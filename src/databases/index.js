const { sequelize } = require('./sequelize');
const { redis } = require('./redis');
const { redlock } = require('./redlock');

module.exports = {
  redis,
  redlock,
  sequelize,
};
