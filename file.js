const { sequelize, User, Assignment } = require("./sequelize");
const fs = require("fs");
const csv = require("csv-parser");
const bcrypt = require("bcrypt");
const path = require("path");
const logger = require("./logs/logger");
const statsd = require("./statsd/statsd");

const filepath = path.join(__dirname, "./data/users.csv");

let create_table_and_insert_data = (sequelize) => {
  sequelize
    .sync()
    .then(() => {
      console.log("Table created if it doesn't exist.");
      fs.createReadStream(filepath)
      .pipe(csv())
      .on("data", async (data) => {
        try {

          const newUser = {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            password: await bcrypt.hash(data.password, 12),
          };

          for (const key in newUser) {
            if (key !== "first_name" && key !== "last_name" && key !== "email" && key !== "password") {
              delete newUser[key];
            }
          }

          const [user, created] = await User.findOrCreate({
            where: { email: data.email },
            defaults: newUser,
          });

          if (created) {
            console.log(`Inserted new user: ${data.first_name} ${data.last_name}`);
          } else {
            console.log(`User with email ${data.email} already exists, skipping.`);
          }
        } catch (error) {
          console.error("Error inserting user:", error);
        }
      })
      .on("end", () => {
        console.log("CSV data processing completed");
      })
      .on("error", (error) => {
        console.error("Error reading CSV: ", error);
      });
    })
    .catch((error) => {
      console.error("Error creating table: ", error);
    });
}

let authenticateDatabase = () => {
  sequelize.authenticate().then(()=>{
    statsd.increment("Authenticated Database");
    console.log("Database Connection Established Successfully!");
    create_table_and_insert_data(sequelize);
    logger.info("Database Connection Established Successfully and Authenticated");
  }).catch((error)=>{
      console.error(error);
      console.error("Database Connection Haven't Been Established");
      logger.info("Database Connection Haven't Been Established and couldn't authenticate it");
  })
}

module.exports = { create_table_and_insert_data, authenticateDatabase }