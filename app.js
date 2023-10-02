/** @format */

const express = require("express");
const assignments = require("./assignments/assignments");
const { sequelize, User, Assignment } = require("./sequelize");
require("./file");

const app = express();

app.use("/v1", assignments);

app.get("/healthz", async (req, res) => {
  if(req.headers["content-length"]>0) {
    res.status(400).end();
    return;
  }
  if(Object.keys(req.query).length > 0 ) {
    res.status(400).end();
    return;
  }
  try {
    await sequelize.authenticate();
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.status(200).end();
  } catch (error) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.status(503).end();
  }
});

app.all("*", (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.status(405).end();
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

module.exports = app;