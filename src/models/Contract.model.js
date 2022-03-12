const Sequelize = require('sequelize');
const { sequelize } = require('./helper');

class Contract extends Sequelize.Model {}

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
