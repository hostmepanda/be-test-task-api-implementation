const Sequelize = require('sequelize');

const rootPath = process.cwd();

const sequelizeDialect = process.env.SEQUELIZE_DIALECT || 'sqlite';
const sequelizeStoragePath = process.env.SEQUELIZE_STORAGE_PATH || `${rootPath}/database.sqlite3`;

// TODO: enable optimistic locking
const sequelize = new Sequelize({
  dialect: sequelizeDialect,
  storage: sequelizeStoragePath,
});

module.exports = {
  sequelize,
};
