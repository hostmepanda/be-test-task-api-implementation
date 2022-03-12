const Sequelize = require('sequelize');
const { sequelize } = require('./helper');

class Profile extends Sequelize.Model {}

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
  },
);

module.exports = {
  Profile,
};
