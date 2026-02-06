const express = require('express');
const Redis = require('ioredis');
const app = express();
const redis = new Redis({ host: 'redis' });

const SCRIPT = `
  local leak_rate = 2 -- seconds per request
  local capacity = 5
  local now = tonumber(ARGV[1])
  local last_leak = tonumber(redis.call("GET", KEYS[1])) or now
  local next_time = math.max(now, last_leak) + leak_rate
  if (next_time - now) > (capacity * leak_rate) then return 0
  else redis.call("SET", KEYS[1], next_time) return 1 end
`;
app.get('/', async (req, res) => {
  const allowed = await redis.eval(SCRIPT, 1, `sliding:${req.ip}`, Date.now());
  allowed ? res.send("Success") : res.status(429).send("Throttled");
});
app.listen(3000);