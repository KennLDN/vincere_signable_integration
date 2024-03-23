const { createClient } = require('redis');
const logger = require('../utils/logger')('REDIS');

let client;

const connectRedis = () => {
  client = createClient({
    url: 'redis://cs-server-redis:6379'
  });

  client.on('connect', () => logger.res({msg: 'Redis Client Connected'}));
  client.on('error', (err) => logger.res({msg: 'Redis Client Error', error: err}));

  client.connect().catch((error) => {
    logger.res({msg: 'Failed to connect to Redis', error});
  });

  return client;
};

module.exports = { connectRedis, getClient: () => client };
