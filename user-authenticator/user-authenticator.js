const { User, sequelize, Assignment } = require("../sequelize");
const bcrypt = require("bcrypt");

const check_user = async (username, password) => {
    try {
      await sequelize.authenticate();
      try {
        const user = await User.findOne({ where: { email: username } });
        if (!user) {
          return {isValid: false, message: "Authentication Failed - User not found - User is not found. If you have added recently to users.csv, don't worry. I will create that user automatically. Try this request now."}
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
    
        if (isPasswordValid) {
          return {isValid: true, message: "Authentication Success", user: user.id};
        }
        return {isValid: false, message: "Authentication Failed - Password Not Valid"};
      } catch (error) {
        console.error(error);
        return {isValid: false, message: "Database or Table isn't providing information right now. Never worry. I have been configured to automatically Create Tables for You.", status: 503};
      }
    } catch (error) {
      console.error(error);
      return {isValid: false, message: "Database or Table isn't providing information right now. Never worry. I have been configured to automatically Create Tables for You.", status: 503};
    }
  };

let authenticate_user = async (authHeader) => {
    if (authHeader) {
        const authParts = authHeader.split(' ');
        if (authParts.length === 2 && authParts[0] === 'Basic') {
            const credentials = Buffer.from(authParts[1], 'base64').toString('utf-8').split(':');
            const username = credentials[0];
            const password = credentials[1];
            
            return check_user(username, password);
        }
    }
    else {
        return false;
    }
}

module.exports = authenticate_user;