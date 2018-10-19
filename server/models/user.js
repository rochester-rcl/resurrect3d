const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mail = require('../mail');
const bcrypt = require('bcrypt');

var UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    index: {
      unique: true,
      dropDups: true,
    }
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    index: {
      unique: true,
      dropDups: true,
    }
  },
  token: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    required: true,
    default: false
  }
  // not sure what else we want but this will do for now, probably first, last, institution etc
});

UserSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
}

UserSchema.methods.sendVerificationEmail = function() {
  const message = {
    to: this.email,
    html: mail.greeting + this.token,
    ...mail.message,
  }
  mail.transporter.sendMail(message, (error) => { console.log(error) });
}

module.exports = mongoose.model('User', UserSchema);
