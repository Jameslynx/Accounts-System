require("dotenv/config");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

class Mailer {
  constructor() {}

  mailConfig(email, name, code, codeId, host) {
    this.mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Registration mail verification",
      html: `<div style="color:#FEE715FF;background-color:#101820FF;text-align:center;padding: 10px 0px 10px 0px">
      <h1>Welcome, <span style="color:#ffffff;">${name}<span></h1>
      <img src="https://cdn.pixabay.com/photo/2017/06/26/09/41/lavender-2443220_960_720.jpg" width="40%" height="auto">
      <p>Click this link to log in: <a href="https://${host}/users/verification/mailAuth/${code}/${codeId}" target="_blank">
      ${host}/users/verification/mailAuth/${code}/${codeId}</a></p>
      </div>`,
    };
  }

  resetMailConfig(email, name, code, codeId, host) {
    this.mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset",
      html: `<div style="color:#FEE715FF;background-color:#101820FF;text-align:center;padding: 10px 0px 10px 0px">
      <h1>Let's get you logged in, <span style="color:#ffffff;">${name}<span></h1>
      <img src="https://cdn.pixabay.com/photo/2020/05/25/02/05/key-5216637_960_720.jpg" width="40%" height="auto">
      <p>Click this link to reset password: <a href="https://${host}/users/password/passwordReset/${code}/${codeId}" target="_blank">
      ${host}/users/password/passwordReset/${code}/${codeId}</a></p>
      </div>`,
    };
  }

  async sender(cb) {
    try {
      const accessToken = await oAuth2Client.getAccessToken();
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.EMAIL,
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });
      this.transporter.sendMail(this.mailOptions, cb);
    } catch (err) {
      return err;
    }
  }
}

module.exports = new Mailer();
