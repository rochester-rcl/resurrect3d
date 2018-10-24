const nodemailer = require('nodemailer');
const mailConfig = require('./email.json'); // DONT CHECK THIS IN

const transporter = nodemailer.createTransport({
  service: mailConfig.service,
  auth: {
    user: mailConfig.email,
    pass: mailConfig.password
  }
});

const greeting = '<p>Greetings from Resurrect3D! To verify your account, click on the link provided below: </p><br>';

const message = {
  from: mailConfig.email,
  subject: 'Your Resurrect3D Account'
}

module.exports = {
  transporter: transporter,
  message: message,
  greeting: greeting,
  verificationRoute: mailConfig.verificationRoute,
}
