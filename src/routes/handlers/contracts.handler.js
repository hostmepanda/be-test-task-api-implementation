const { Op: { or } } = require('sequelize');

const { sequelize } = require('../../models');

class ContractsHandler {
  constructor() {
    this.models = sequelize.models;
    this.getById = this.getById.bind(this);
    this.list = this.list.bind(this);
  }

  /**
   * @param req
   * @param res
   * @param next
   * @returns contract by id for calling profile
   */
  async getById(req, res, next) {
    const { id } = req.params;
    const { id: profileId } = req.profile;
    const { Contract } = this.models;

    try {
      const query = {
        where: {
          id,
          [or]: [
            { ClientId: profileId },
            { ContractorId: profileId },
          ],
        },
      };

      const contract = await Contract.findOne(query);

      if (!contract) {
        return res.status(404).end();
      }

      return res.json(contract);
    } catch (error) {
      // TODO: log error and reply with some status code
      return next(error);
    }
  }

  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns contracts for calling profile
   */
  async list(req, res, next) {
    const { id: profileId } = req.profile;
    const { Contract } = this.models;

    try {
      const query = {
        where: {
          [or]: [
            { ClientId: profileId },
            { ContractorId: profileId },
          ],
          status: ['new', 'in_progress'],
        },
      };
      // TODO: pagination should be applied here
      const nonTerminatedContracts = await Contract.findAll(query);

      if (nonTerminatedContracts?.length > 0) {
        return res.json(nonTerminatedContracts);
      }

      return res.status(404).end();
    } catch (error) {
      // TODO: log error and reply with some status code
      return next(error);
    }
  }
}

module.exports = new ContractsHandler();
