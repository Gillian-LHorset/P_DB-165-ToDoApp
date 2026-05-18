const { createClient } = require('redis');

let redisClient;

async function initRedis() {
  const redisUrl = process.env.REDIS_URL || 'redis://default:admin_pwd@localhost:6379';

  redisClient = createClient({
    url: redisUrl
  });

  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  redisClient.on('connect', () => console.log('Redis Client Connected'));

  await redisClient.connect();
  return redisClient;
}

module.exports = { initRedis, getRedisClient: () => redisClient };
