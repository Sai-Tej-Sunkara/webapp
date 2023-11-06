const statsd = require("node-statsd");

export const client = new statsd({
  host: "localhost",
  port: 8125,
  prefix: "api.calls.",
});