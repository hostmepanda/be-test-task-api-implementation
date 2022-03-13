const Sequelize = require('sequelize');

const { sequelize } = require('../database');

class Job extends Sequelize.Model {}

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
