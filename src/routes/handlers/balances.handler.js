const { Op: { or } } = require('sequelize');

const { sequelize } = require('../../models');

// TODO: find more common place for error reasons
const ERROR_MESSAGE = {
  depositMustBeNumber: 'Deposit must be a number',
  depositMustBePositive: 'Deposit must be positive',
  internalError: 'Internal error',
  maxAllowedDeposit: 'Max allowed deposit is',
};
class BalancesHandler {
  constructor() {
    this.models = sequelize.models;
    this.depositByUserId = this.depositByUserId.bind(this);
  }

  async depositByUserId(req, res, next) {
    this.profile = req.profile;
    const { deposit } = req.body;
    const { id: profileId } = req.profile;
    const { Job, Contract, Profile } = this.models;

    const depositSum = parseInt(deposit * 100, 10);

    if (typeof deposit !== 'number') {
      return res
        .status(400)
        .send({
          success: false,
          reason: ERROR_MESSAGE.depositMustBeNumber,
        });
    }
    if (deposit <= 0) {
      return res
        .status(400)
        .send({
          success: false,
          reason: ERROR_MESSAGE.depositMustBePositive,
        });
    }

    try {
      const query = {
        include: {
          model: Contract,
          attributes: [],
          where: {
            ClientId: profileId,
          },
        },
        where: {
          [or]: [
            { paid: false },
            { paid: null },
          ],
        },
      };
      const totalJobsUnpaidSum = await Job.sum('price', query);
      const maxAllowedDeposit = parseInt(totalJobsUnpaidSum * 0.25 * 100, 10);

      if (depositSum > maxAllowedDeposit) {
        return res
          .status(403)
          .send({
            success: false,
            reason: `${ERROR_MESSAGE.maxAllowedDeposit} ${maxAllowedDeposit / 100}`,
          });
      }
      const currentBalance = parseInt(this.profile.balance * 100, 10);

      const updatedBalance = (currentBalance + depositSum) / 100;
      try {
        await Profile.update(
          { balance: updatedBalance },
          { where: { id: profileId } },
        );
        return res.status(200).send({
          success: true,
          balance: updatedBalance,
        });
      } catch (error) {
        return res
          .status(400)
          .send({
            success: false,
            reason: ERROR_MESSAGE.internalError,
          });
      }
    } catch (error) {
      // TODO: log error
      return next(error);
    }
  }
}
module.exports = new BalancesHandler();
