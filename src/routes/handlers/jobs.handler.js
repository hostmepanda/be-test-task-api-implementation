const { Op: { or } } = require('sequelize');

const { sequelize } = require('../../models');

class JobsHandler {
  constructor() {
    // TODO: move to base handler class
    this.models = sequelize.models;
    this.listUnpaid = this.listUnpaid.bind(this);
  }

  async listUnpaid(req, res, next) {
    const { id: profileId } = req.profile;
    const { Contract, Job } = this.models;

    try {
      const query = {
        include: {
          model: Contract,
          attributes: [],
          where: {
            [or]: [
              { ClientId: profileId },
              { ContractorId: profileId },
            ],
            status: 'in_progress',
          },
        },
        where: {
          [or]: [
            { paid: false },
            { paid: null },
          ],
        },
      };
      const activeUnpaidJobs = await Job.findAll(query);

      if (activeUnpaidJobs?.length > 0) {
        return res.json(activeUnpaidJobs);
      }

      return res.status(404).end();
    } catch (error) {
      // TODO: log error and reply with more suitable status code
      return next(error);
    }
  }
}

module.exports = new JobsHandler();
