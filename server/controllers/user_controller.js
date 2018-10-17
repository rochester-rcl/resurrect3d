const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const BearerStrategy = require("passport-http-bearer").Strategy;
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const constants = require("../constants");
const bcrypt = require("bcrypt");
// Create
const addUser = (req, res) => {
  let user = req.body;
  const { password, ...info } = user;
  // for now let's set it to never expire, it's really not that big a deal
  const token = jwt.sign({ email: info.email }, constants.PRIVATE_KEY);
  const hash = bcrypt.hashSync(password, constants.SALT_ROUNDS);
  user = new User({
    username: info.username,
    email: info.email,
    password: hash,
    token: token
  });

  user.save((err, savedUser) => {
    if (err) res.send(err);
    if (savedUser !== undefined) {
      const response = {
        username: savedUser.username,
        email: savedUser.email,
        token: savedUser.token,
        id: savedUser._id,
      };
      res.json(response);
    }
  });
};

const deleteUser = (req, res) => {
  User.findOne(
    {
      _id: req.params.id
    },
    (err, user) => {
      User.remove({ _id: user._id }, (err, user) => {
        if (err) res.send(err);
        res.json({ success: "User successfully deleted" });
      });
    }
  );
};

const onAuthenticated = (req, res) => {
  const { username, email, token, _id } = req.user;
  res.json({
    username: username,
    email: email,
    token: token,
    id: _id
  });
};

passport.use(
  new LocalStrategy(function(email, password, done) {
    // no idea why this is being set to undefined below, but this works
    const _password = password;
    User.findOne({ email: email }, function(err, user) {
      if (err) return done(err);
      if (!user) {
        return done(null, false, { message: "invalid username" });
      }
      if (!user.validPassword(_password)) {
        return done(null, false, { message: "incorrect password" });
      }
      return done(null, user);
    });
  })
);

passport.use(
  new BearerStrategy(function(token, done) {
    User.findOne({ token: token }, function(err, user) {
      if (err) return done(err);
      if (!user) return done(null, false);
      const { password, ...rest } = user;
      return done(null, rest, { scope: "all" });
    });
  })
);

// serialization
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

module.exports = {
  authenticate: passport.authenticate("local"),
  protect: passport.authenticate("bearer"),
  add: addUser,
  delete: deleteUser,
  onAuthenticated: onAuthenticated
};
