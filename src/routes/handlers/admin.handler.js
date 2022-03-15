const { Op: { and, gte, lte } } = require('sequelize');

const { sequelize } = require('../../models');

// TODO: find more common place for error reasons
const ERROR_MESSAGE = {
  limitShouldBeNumber: 'Limit param should be a number',
  limitShouldBeGreaterZero: 'Limit param should be greater 0',
  startEndShouldBeDates: 'Start and end params should be valid dates',
  startEndShouldBeString: 'Start and end params should be a string',
  startShouldBeGreaterEnd: 'Start date should be greater end date',
};
class AdminHandler {
  constructor() {
    this.models = sequelize.models;
    this.listBestClients = this.listBestClients.bind(this);
    this.listBestProfession = this.listBestProfession.bind(this);
    this.validateQueryParams = this.validateQueryParams.bind(this);
  }

  async listBestProfession(req, res, next) {
    this.queryParams = req.query;
    try {
      this.validateQueryParams();
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
          include: {
            model: Profile,
            as: 'Contractor',
          },
        },
        order: [[sequelize.literal('sumByPeriod'), 'DESC']],
        where: {
          paid: true,
          [and]: [
            {
              paymentDate: {
                [gte]: new Date(start),
              },
            },
            {
              paymentDate: {
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
            Contractor: {
              profession,
            },
          },
        } = mostPaidJobsByContractorId.toJSON();
        return res.send({ profession });
      }
      return res
        .status(404)
        .end();
    } catch (error) {
      // TODO: log error
      return next(error);
    }
  }

  async listBestClients(req, res, next) {
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

    const { end, limit = 2, start } = req.query;
    const { Contract, Job, Profile } = this.models;
    try {
      const query = {
        attributes: {
          include: [
            'Contract.ClientId',
            [sequelize.fn('sum', sequelize.col('price')), 'paid'],
          ],
        },
        group: 'Contract.ClientId',
        include: {
          model: Contract,
          attributes: ['ClientId'],
          include: {
            model: Profile,
            as: 'Client',
          },
        },
        order: [[sequelize.literal('paid'), 'DESC']],
        limit,
        where: {
          paid: true,
          [and]: [
            {
              paymentDate: {
                [gte]: new Date(start),
              },
            },
            {
              paymentDate: {
                [lte]: new Date(end),
              },
            },
          ],
        },
      };
      const contractorJobsByRangePeriod = await Job.findAll(query);
      if (contractorJobsByRangePeriod?.length > 0) {
        const bestClients = contractorJobsByRangePeriod.map(
          (bestClient) => {
            const {
              paid,
              Contract: {
                Client: {
                  id,
                  fullName,
                },
              },
            } = bestClient.toJSON();
            return { id, fullName, paid };
          },
        );
        return res.json(bestClients);
      }
      return res
        .status(404)
        .end();
    } catch (error) {
      return next(error);
    }
  }

  validateQueryParams() {
    const { end, start, limit = 2 } = this.queryParams;
    if (typeof end !== 'string' || typeof start !== 'string') {
      throw new Error(ERROR_MESSAGE.startEndShouldBeString);
    }
    if (Number.isNaN(parseInt(limit, 10))) {
      throw new Error(ERROR_MESSAGE.limitShouldBeNumber);
    }
    const endDate = new Date(end);
    const startDate = new Date(start);
    const isInvalidEndDate = Number.isNaN(endDate.valueOf());
    const isInvalidStartDate = Number.isNaN(startDate.valueOf());
    if (isInvalidEndDate || isInvalidStartDate) {
      throw new Error(ERROR_MESSAGE.startEndShouldBeDates);
    }
    if (endDate <= startDate) {
      throw new Error(ERROR_MESSAGE.startShouldBeGreaterEnd);
    }
    if (limit <= 0) {
      throw new Error(ERROR_MESSAGE.limitShouldBeGreaterZero);
    }

    return undefined;
  }
}

module.exports = new AdminHandler();
