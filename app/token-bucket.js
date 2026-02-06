const SCRIPT = `
  local capacity = 10
  local refill_rate = 0.2 -- tokens per second
  local now = tonumber(ARGV[1])
  local data = redis.call("HMGET", KEYS[1], "t", "l")
  local last_tokens = tonumber(data[1]) or capacity
  local last_refill = tonumber(data[2]) or now
  
  local tokens = math.min(capacity, last_tokens + (now - last_refill) * refill_rate)
  if tokens >= 1 then
    redis.call("HMSET", KEYS[1], "t", tokens - 1, "l", now)
    return 1
  end
  return 0
`;
app.get('/', async (req, res) => {
  const allowed = await redis.eval(SCRIPT, 1, `tokenbucket:${req.ip}`, Date.now());
  allowed ? res.send("Success") : res.status(429).send("Throttled");
});
app.listen(3000);