const { Op: { or } } = require('sequelize');

const { sequelize } = require('../../models');
const { redlock } = require('../../databases');

const { ERROR_MESSAGE } = require('./helpers');

class JobsHandler {
  constructor() {
    // TODO: move to base handler class
    this.models = sequelize.models;
    this.redlock = redlock;
    this.locks = {};
    this.listUnpaid = this.listUnpaid.bind(this);
    this.payById = this.payById.bind(this);
    this.releaseLocks = this.releaseLocks.bind(this);
    this.acquireLocks = this.acquireLocks.bind(this);
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
    const { job_id: jobId = 0 } = req.params || {};
    const { Contract, Job, Profile } = this.models;

    if (!jobId) {
      return res
        .status(400)
        .send({
          success: false,
          reason: ERROR_MESSAGE.jobIdMustBeProvided,
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

      try {
        // TODO: better lock and release before and after each operation
        await this.acquireLocks(jobToPay, profileId);
      } catch {
        throw new Error('Resource is busy');
      }

      try {
        // TODO: Add payment date or payedAt
        await Profile.update(
          { balance: contractorUpdatedBalance },
          { where: { id: jobToPay.Contract.ContractorId } },
        );
        await Profile.update(
          { balance: clientUpdatedBalance },
          { where: { id: profileId } },
        );
        await Job.update(
          { paid: true },
          { where: { id: jobToPay.id } },
        );
      } finally {
        await this.releaseLocks();
      }

      jobToPay.paid = true;
      await this.redlock.quit();
      return res.json(jobToPay);
    } catch (error) {
      // TODO: log error and reply with more suitable status code
      await this.redlock.quit();
      return next(error);
    }
  }

  async acquireLocks(jobToPay, profileId) {
    this.locks.profileUpdateContractorLock = await this.redlock.acquire(
      [`profile:update:${jobToPay.Contract.ContractorId}`],
      10000,
    );
    this.locks.profileUpdateClientLock = await this.redlock.acquire(
      [`profile:update:${profileId}`],
      10000,
    );
    this.locks.jobUpdateLock = await this.redlock.acquire(
      [`job:update:${jobToPay.id}`],
      10000,
    );
  }

  async releaseLocks() {
    await this.locks.profileUpdateContractorLock.release();
    await this.locks.profileUpdateClientLock.release();
    await this.locks.jobUpdateLock.release();
  }
}

module.exports = new JobsHandler();
