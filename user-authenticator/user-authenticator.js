const { User } = require("../sequelize");
const bcrypt = require("bcrypt");

const check_user = async (username, password) => {
    try {
      const user = await User.findOne({ where: { email: username } });
      if (!user) {
        return {isValid: false, message: "Authentication Failed - User not found"}
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (isPasswordValid) {
        return {isValid: true, message: "Authentication Success", user: user.id};
      }
      return {isValid: false, message: "Authentication Failed - Password Not Valid"};
    } catch (error) {
      throw error;
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