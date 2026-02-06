const SCRIPT = `
  local now = tonumber(ARGV[1])
  local window = 60000 -- 1 minute in ms
  redis.call("ZREMRANGEBYSCORE", KEYS[1], 0, now - window)
  if redis.call("ZCARD", KEYS[1]) < 10 then
    redis.call("ZADD", KEYS[1], now, now)
    return 1
  end
  return 0
`;

app.get('/', async (req, res) => {
  const allowed = await redis.eval(SCRIPT, 1, `sliding:${req.ip}`, Date.now());
  allowed ? res.send("Success") : res.status(429).send("Throttled");
});
app.listen(3000);