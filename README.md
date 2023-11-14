# WebApp Readme

This repository contains a Node.js application that uses MySQL as its database. This README will guide you through the steps to set up and run the project on your local machine.
twest-check
## Prerequisites

Before you can run this project, you need to have the following software installed on your machine:

- [MySQL Server](https://dev.mysql.com/downloads/mysql/)
- [Node.js](https://nodejs.org/)
- npm (Node Package Manager, comes with Node.js installation)

## Installation

1. **MySQL Server:**

   - Download and install MySQL Server from [here](https://dev.mysql.com/downloads/mysql/).
   - Follow the installation instructions for your specific operating system.
   - Create a database for this project in MySQL. You will need the database name, username, and password later in the configuration.

2. **Node.js:**

   - Download and install Node.js from [here](https://nodejs.org/).
   - Follow the installation instructions for your specific operating system.

3. **Project Dependencies:**

   - Open a terminal/command prompt and navigate to the project directory.
   - Run the following command to install project dependencies:

     ```bash
     npm install
     ```

## Configuration

1. **Database Configuration:**

   - Open the `secrets or .env` in applications.
   - Update the development configuration with your MySQL database information (database name, username, and password).

2. **Environment Variables:**

   - Create a `.env` file in the project root directory.
   - Add the following variables to the `.env` file and set their values accordingly:

     ```
     DB Values - DATABASE, USER, PASS, HOST, DIALECT
     ```

## Running the Application

1. **Database Migration:**

   - To create the necessary tables in the MySQL database, run the following command:

     ```bash
     npx sequelize db:migrate
     ```

2. **Start the Application:**

   - To start the application, run the following command:

     ```bash
     node app
     ```

   The application will be accessible at `http://localhost:3000` (or the port you specified in the `.env` file).

## Usage

- Once the application is running, you can use it to perform various tasks related to your Node.js project. Be sure to explore the project's features and functionalities as per your requirements.

## Additional Information

- For more information on Node.js, MySQL, or the dependencies used in this project, please refer to their respective documentation.

- RDS Created for decoupling EC2 instance and Database

Thank you for using this project!
