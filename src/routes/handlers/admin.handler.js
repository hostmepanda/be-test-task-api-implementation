const { Op: { and, gte, lte } } = require('sequelize');

const { sequelize } = require('../../database');

// TODO: find more common place for error reasons
const ERROR_MESSAGE = {
  startEndShouldBeDates: 'Start and end params should be valid dates',
  startEndShouldBeString: 'Start and end params should be string',
  startShouldBeGreaterEnd: 'Start date should be greater or equal end date',
};
class AdminHandler {
  constructor() {
    this.models = sequelize.models;
    this.listBestProfessionByRange = this.listBestProfessionByRange.bind(this);
    this.validateQueryParams = this.validateQueryParams.bind(this);
  }

  async listBestProfessionByRange(req, res, next) {
    this.queryParams = req.query;
    try {
      this.validateQueryParams(res);
    } catch (error) {
      return res
        .status(400)
        .send({
          success: false,
          reason: error.message,
        });
    }

    const { end, start } = req.query;
    const { Contract, Job, Profile } = this.models;

    try {
      const query = {
        attributes: {
          include: [
            'Contract.ContractorId',
            [sequelize.fn('sum', sequelize.col('price')), 'sumByPeriod'],
          ],
        },
        group: 'Contract.ContractorId',
        include: {
          model: Contract,
          attributes: ['ContractorId'],
        },
        order: [[sequelize.literal('sumByPeriod'), 'DESC']],
        where: {
          paid: true,
          [and]: [
            {
              createdAt: {
                [gte]: new Date(start),
              },
            },
            {
              createdAt: {
                [lte]: new Date(end),
              },
            },
          ],
        },
      };
      const contractorJobsByRangePeriod = await Job.findAll(query);
      if (contractorJobsByRangePeriod?.length > 0) {
        const [mostPaidJobsByContractorId] = contractorJobsByRangePeriod;
        const {
          Contract: {
            ContractorId: mostPaidContractorId,
          },
        } = mostPaidJobsByContractorId.toJSON();
        const {
          profession,
        } = await Profile.findOne({ where: { id: mostPaidContractorId, type: 'contractor' } });
        return res.send({ profession });
      }
      return res
        .status(404)
        .end();
    } catch (error) {
      return next(error);
    }
  }

  validateQueryParams() {
    const { end, start } = this.queryParams;
    if (typeof end !== 'string' || typeof start !== 'string') {
      throw new Error(ERROR_MESSAGE.startEndShouldBeString);
    }
    const endDate = new Date(end);
    const startDate = new Date(start);
    const isInvalidEndDate = Number.isNaN(endDate.valueOf());
    const isInvalidStartDate = Number.isNaN(startDate.valueOf());
    if (isInvalidEndDate || isInvalidStartDate) {
      throw new Error(ERROR_MESSAGE.startEndShouldBeDates);
    }
    if (endDate < startDate) {
      throw new Error(ERROR_MESSAGE.startShouldBeGreaterEnd);
    }
    return undefined;
  }
}

module.exports = new AdminHandler();
