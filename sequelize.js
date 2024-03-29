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
    unique: true,
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

const Assignment = sequelize.define("Assignment", {
  id: {
    type: Sequelize.DataTypes.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4(),
  },
  name: {
    type: sequelize.Sequelize.STRING,
    allowNull: false,
  },
  points: {
    type: sequelize.Sequelize.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 10,
    },
  },
  num_of_attemps: {
    type: sequelize.Sequelize.INTEGER,
    allowNull: false,
  },
  deadline: {
    type: sequelize.Sequelize.DATE,
    allowNull: false,
  },
  assignment_created: {
    type: sequelize.Sequelize.DATE,
    defaultValue: Sequelize.fn("NOW"),
  },
  assignment_updated: {
    type: sequelize.Sequelize.DATE,
    defaultValue: Sequelize.fn("NOW"),
  },
  user_id: {
    type: sequelize.Sequelize.INTEGER,
    allowNull: false,
    noUpdate: true,
  },
}, {
  timestamps: null,
});

const Submission = sequelize.define("Submission", {
  id: {
    type: Sequelize.DataTypes.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4(),
  },
  assignment_id: {
    type: Sequelize.DataTypes.UUID,
    allowNull: false,
  },
  submission_url: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
  submission_date: {
    type: Sequelize.DataTypes.DATE,
    defaultValue: Sequelize.fn("NOW"),
  },
  submission_updated: {
    type: Sequelize.DataTypes.DATE,
    defaultValue: Sequelize.fn("NOW"),
  },
}, {
  timestamps: null,
});

module.exports = { sequelize, User, Assignment, Submission };
