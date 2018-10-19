const nodemailer = require('nodemailer');
// TODO will create the default transport here. Will load in host etc from a json file
const transporter = nodemailer.createTransport({
  host: '',
  port: 587,
  secure: false,
});

const greeting = '<p>Greetings from blah! To verify your account, click on the link provided below: </p><br>';

const message = {
  from: '<admin@example.com>',
  subject: 'Your Blah Account'
}

module.exports = {
  transporter: transporter,
  message: message,
  greeting: greeting,
}
