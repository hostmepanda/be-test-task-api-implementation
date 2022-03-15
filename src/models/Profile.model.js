const Sequelize = require('sequelize');

const { sequelize } = require('../databases');

class Profile extends Sequelize.Model {}

// TODO: add index fields
Profile.init(
  {
    balance: Sequelize.DECIMAL(12, 2),
    firstName: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    lastName: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    profession: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    type: Sequelize.ENUM('client', 'contractor'),
  },
  {
    sequelize,
    modelName: 'Profile',
    getterMethods: {
      fullName() {
        return [this.getDataValue('firstName'), this.getDataValue('lastName')].join(' ').trim();
      },
    },
  },
);

module.exports = {
  Profile,
};
