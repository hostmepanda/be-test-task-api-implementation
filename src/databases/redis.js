const IoRedisClient = require('ioredis');

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_HOST || 6379;

const singleRedisInstance = new IoRedisClient({ host: redisHost, port: redisPort });

module.exports = {
  redis: singleRedisInstance,
};
