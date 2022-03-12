const Sequelize = require('sequelize');

// TODO: move to store or database folder and rename respectively
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite3',
});

module.exports = {
  sequelize,
};
