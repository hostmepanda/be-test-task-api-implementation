const { Op: { or } } = require('sequelize');

const { sequelize } = require('../../models');

class ContractsHandler {
  constructor() {
    this.models = sequelize.models;
    this.getById = this.getById.bind(this);
  }

  /**
   * @returns contract by id for calling profile
   */
  async getById(req, res, next) {
    const { id } = req.params;
    const { id: profileId } = req.profile;

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

      const contract = await this.models.Contract.findOne(query);

      if (!contract) {
        return res.status(404).end();
      }

      return res.json(contract);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new ContractsHandler();
