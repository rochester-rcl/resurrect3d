var mongoose = require('mongoose');
var Schema = mongoose.Schema;
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
  }
  // not sure what else we want but this will do for now, probably first, last, institution etc
});

UserSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);
