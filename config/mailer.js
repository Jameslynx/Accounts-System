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
      html: `<div style="color:#FEE715FF;background-color:#101820FF;text-align:center;padding: 10px 0px 10px 0px">
      <h1>Welcome, <span style="color:#ffffff;">${name}<span></h1>
      <img src="https://cdn.pixabay.com/photo/2017/06/26/09/41/lavender-2443220_960_720.jpg" width="40%" height="auto">
      <p>Click this link to log in: <a href="http://${host}/users/verification/mailAuth/${code}/${codeId}" target="_blank">
      ${host}/users/verification/mailAuth/${code}/${codeId}</a></p>
      </div>`,
    };
  }

  sender(cb) {
    this.transporter.sendMail(this.mailOptions, cb);
  }
}

module.exports = new Mailer();
