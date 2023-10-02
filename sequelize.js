/** @format */

const Sequelize = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.USER,
  process.env.PASS,
  {
    host: process.env.HOST,
    dialect: process.env.DIALECT,
  }
);

const User = sequelize.define("User", {
  first_name: {
    type: sequelize.Sequelize.STRING,
    allowNull: false,
  },
  last_name: {
    type: sequelize.Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: sequelize.Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: sequelize.Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = { sequelize, User };
