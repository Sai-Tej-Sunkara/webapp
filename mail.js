const nodemailer = require('nodemailer');
require("dotenv").config();
const logger = require("./logs/logger");

console.log(process.env.EMAIL_TO_ADDRESS);

let transporter = nodemailer.createTransport({
  host: process.env.SMTP,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});

let sendMail = (subject, text) => {
    let mailOptions = {
        from: '"Sai Tej Sunkara" <no-reply@demo.assignmentsai.com>',
        to: process.env.EMAIL_TO_ADDRESS,
        subject: subject,
        text: text,
        html: `<b>${text}</b>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            logger.error(error);
            return;
        }
        else {
            logger.info("Email sent : "+info.messageId);
            return;
        }
    });
}

module.exports = sendMail;