const Sequelize = require('sequelize');

const { sequelize } = require('../databases');

class Job extends Sequelize.Model {}

// TODO: add index fields
Job.init(
  {
    description: {
      allowNull: false,
      type: Sequelize.TEXT,
    },
    paid: {
      default: false,
      type: Sequelize.BOOLEAN,
    },
    paymentDate: Sequelize.DATE,
    price: {
      allowNull: false,
      type: Sequelize.DECIMAL(12, 2),
    },
  },
  {
    sequelize,
    modelName: 'Job',
  },
);

module.exports = {
  Job,
};
