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
  id: {
    type: sequelize.Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
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
  account_created: {
    type: sequelize.Sequelize.DATE,
    defaultValue: Sequelize.fn("NOW"),
  },
  account_updated: {
    type: sequelize.Sequelize.DATE,
    defaultValue: Sequelize.fn("NOW"),
  },
}, {
  timestamps: null,
});

module.exports = { sequelize, User };
