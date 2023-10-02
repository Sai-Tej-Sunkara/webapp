/** @format */

const express = require("express");
const { sequelize, User } = require("./sequelize");

const fs = require("fs");
const csv = require("csv-parser");

const app = express();

const filepath = "/Users/saitejsunkara/Desktop/CloudComputing/webapp/data/users.csv";

let create_table = (sequelize) => {
  sequelize
    .sync()
    .then(() => {
      console.log("Table created if it doesn't exist.");
    })
    .catch((error) => {
      console.error("Error creating table: ", error);
    });
}

let read_csv_and_insert_data = (sequelize) => {
  fs.createReadStream(filepath)
    .pipe(csv())
    .on("data", async (data) => {
      try {
        const [user, created] = await User.findOrCreate({
          where: { email: data.email },
          defaults: data,
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
}

sequelize.authenticate().then(()=>{
  console.log("Database Connection Established Successfully!");
  create_table(sequelize);
  read_csv_and_insert_data(sequelize);
}).catch((error)=>{
  console.error("Database Connection Haven't Been Established");
  throw error;
})

// let csv_results = [];
// fs.createReadStream(filepath).pipe(csv()).on("data", (data)=>{
//   csv_results.push(data);
// }).on("end", ()=>{
//   console.log("CSV data: ", csv_results);
//   if(csv_results.length == 0) {
//       console.log("CSV File has no data");
//   }
// }).on("error", (error)=>{
//   console.error("Error reading CSV: ", error);
// })

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