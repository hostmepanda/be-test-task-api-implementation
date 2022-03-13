const Sequelize = require('sequelize');

const sequelizeDialect = process.env.SEQUELIZE_DIALECT || 'sqlite';
const sequelizeStoragePath = process.env.SEQUELIZE_STORAGE_PATH || './database.sqlite3';

const sequelize = new Sequelize({
  dialect: sequelizeDialect,
  storage: sequelizeStoragePath,
});

module.exports = {
  sequelize,
};
