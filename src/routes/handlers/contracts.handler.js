const { Contract } = require('../../models');

class ContractsHandler {
  constructor() {
    this.Contract = Contract;
    this.getById = this.getById.bind(this);
  }

  /**
   * FIX ME!
   * @returns contract by id
   */
  async getById(req, res, next) {
    const { id } = req.params;

    try {
      const contract = await this.Contract.findOne({ where: { id } });

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
