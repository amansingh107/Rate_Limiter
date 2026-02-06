const express = require('express');
const Redis = require('ioredis');
const app = express();
const redis = new Redis({ host: 'redis' });

const LUA_SCRIPT = `
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local current = redis.call("INCR", key)
  if current == 1 then
    redis.call("EXPIRE", key, window)
  end
  if current > limit then
    return 0
  end
  return 1
`;

app.get('/', async (req, res) => {
  const ip = req.ip;
  // Limit: 10 requests per 60 seconds
  const result = await redis.eval(LUA_SCRIPT, 1, `limit:${ip}`, 10, 60);

  if (result === 0) {
    return res.status(429).send('Too many requests! Try again later.');
  }
  res.send(`Request successful! Served by instance: ${process.env.HOSTNAME}`);
});

app.listen(3000, () => console.log('Server running on port 3000'));
