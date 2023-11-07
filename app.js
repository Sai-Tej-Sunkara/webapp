/** @format */

const express = require("express");
const assignments = require("./assignments/assignments");
const { sequelize, User, Assignment } = require("./sequelize");
const { create_table_and_insert_data, authenticateDatabase } = require("./file");
const logger = require("./logs/logger");
const statsd = require("./statsd/statsd");
const sendMail = require("./mail");

const app = express();

authenticateDatabase();

app.use("/v1", assignments);

app.get("/healthz", async (req, res) => {
  statsd.increment("GET.Healthz");
  if(req.headers["content-length"]>0) {
    logger.info("400 Healthz Error");
    res.status(400).end();
    return;
  }
  if(Object.keys(req.query).length > 0 ) {
    logger.info("400 Healthz Error");
    res.status(400).end();
    return;
  }
  try {
    await sequelize.authenticate();
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("X-Content-Type-Options", "nosniff");
    logger.info("200 Healthz Successful");
    sendMail("Mail Regarding Healthz Hit - Success", "Healthz was hit successfully");
    res.status(200).end();
  } catch (error) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("X-Content-Type-Options", "nosniff");
    logger.info("503 Service Unavailable");
    sendMail("Mail Regarding Healthz Hit - Error", "Service Unavailable");
    res.status(503).end();
  }
});

app.get("/*", async (req, res) => {
  statsd.increment("Get.Any");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");
  logger.info("404 Not Found");
  res.status(404).end();
});

app.all("*", (req, res) => {
  statsd.increment("Any Request");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");
  logger.info("405 Method Allowed");
  res.status(405).end();
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

module.exports = app;