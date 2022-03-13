const { Op: { or } } = require('sequelize');

const { sequelize } = require('../../models');

const ERROR_MESSAGE = {
  profileIsNotAuthorized: 'You profile is not authorized to perform the request',
  insufficientFunds: 'Insufficient funds',
};

class JobsHandler {
  constructor() {
    // TODO: move to base handler class
    this.models = sequelize.models;
    this.listUnpaid = this.listUnpaid.bind(this);
    this.payById = this.payById.bind(this);
    this.isClientProfile = this.isClientProfile.bind(this);
  }

  async listUnpaid(req, res, next) {
    const { id: profileId } = req.profile;
    const { Contract, Job } = this.models;

    try {
      const query = {
        include: {
          model: Contract,
          attributes: ['ContractorId'],
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

  async payById(req, res, next) {
    this.profile = req.profile;

    const { id: profileId } = req.profile;
    const { job_id: jobId } = req.params;
    const { Contract, Job, Profile } = this.models;

    if (!this.isClientProfile()) {
      return res
        .status(403)
        .send({
          success: false,
          reason: ERROR_MESSAGE.profileIsNotAuthorized,
        });
    }

    try {
      const query = {
        include: {
          model: Contract,
          attributes: ['ContractorId'],
          where: {
            ClientId: profileId,
          },
        },
        where: {
          id: jobId,
          [or]: [
            { paid: false },
            { paid: null },
          ],
        },
      };
      const jobToPay = await Job.findOne(query);

      if (!jobToPay) {
        return res.status(404).end();
      }

      if (this.profile.balance < jobToPay.price) {
        return res
          .status(400)
          .send({ success: false, reason: ERROR_MESSAGE.insufficientFunds });
      }
      const contractorProfile = await Profile.findOne({
        where: {
          id: jobToPay.Contract.ContractorId,
          type: 'contractor',
        },
      });
      const contractorUpdatedBalance = contractorProfile.balance + jobToPay.price;
      const clientUpdatedBalance = this.profile.balance - jobToPay.price;

      await Profile.update(
        { balance: contractorUpdatedBalance },
        { where: { id: jobToPay.Contract.ContractorId } },
      );
      await Profile.update(
        { balance: clientUpdatedBalance },
        { where: { id: profileId } },
      );
      jobToPay.paid = true;
      return res.json(jobToPay);
    } catch (error) {
      // TODO: log error and reply with more suitable status code
      return next(error);
    }
  }

  isClientProfile() {
    return this.profile?.type === 'client';
  }
}

module.exports = new JobsHandler();
