const express = require('express');
const Redis = require('ioredis');
const app = express();
const redis = new Redis({ host: 'redis' });

const SCRIPT = `
  local current = redis.call("INCR", KEYS[1])
  if current == 1 then redis.call("EXPIRE", KEYS[1], ARGV[1]) end
  return current <= tonumber(ARGV[2]) and 1 or 0
`;

app.get('/', async (req, res) => {
  const allowed = await redis.eval(SCRIPT, 1, `fixed:${req.ip}`, 60, 10);
  allowed ? res.send("Success") : res.status(429).send("Throttled");
});
app.listen(3000);