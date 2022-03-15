const Sequelize = require('sequelize');

const { sequelize } = require('../databases');

class Contract extends Sequelize.Model {}

// TODO: add index fields
Contract.init(
  {
    status: Sequelize.ENUM('new', 'in_progress', 'terminated'),
    terms: {
      allowNull: false,
      type: Sequelize.TEXT,
    },
  },
  {
    sequelize,
    modelName: 'Contract',
  },
);

module.exports = {
  Contract,
};
