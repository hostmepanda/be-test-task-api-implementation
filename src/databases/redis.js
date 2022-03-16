const IoRedisClient = require('ioredis');

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_HOST || 6379;

const singleRedisInstance = new IoRedisClient({
  host: redisHost,
  port: redisPort,
});

singleRedisInstance.on('error', (error) => {
  if (error?.code === 'ECONNREFUSED') {
    console.log(
      'Closing the application\n',
      'reason: Error happened while connecting to redis',
      { details: error },
    );
    process.exit(1);
  }
});

module.exports = {
  redis: singleRedisInstance,
};
