require("dotenv/config");
const nodemailer = require("nodemailer");

class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  mailConfig(email, name, code, codeId, host) {
    this.mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Registration mail verification",
      html: `<div style="color:#adefd1ff;backgroundcolor:#00203fff"><h1>Welcome, <span style="color:#fffffff">${name}<span>
      </h1><p>Click this link to log in: <a href="http8://${host}/users/verification/mailAuth/${code}/${codeId}" target="_blank">
      ${host}/users/verification/mailAuth/${code}/${codeId}</a></p></div>`,
    };
  }

  sender(cb) {
    this.transporter.sendMail(this.mailOptions, cb);
  }
}

module.exports = new Mailer();
