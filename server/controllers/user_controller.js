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
  // should likely put this in a separate function
  user.save((err, savedUser) => {
    if (err) res.send(err);
    if (savedUser !== undefined) {
      const response = {
        username: savedUser.username,
        email: savedUser.email,
        token: savedUser.token,
        id: savedUser._id
      };
      savedUser.sendVerificationEmail(function(err, info) {
        if (err) {
          res.json({ status: false, message: "Invalid e-mail address!" });
        } else {
          res.json(response);
        }
      });
    }
  });
};

const deleteUser = (req, res) => {
  console.log(req.user._id, req.params.id);
  if (req.user._id == req.params.id) {
    User.findOne(
      {
        _id: req.params.id
      },
      (err, user) => {
        User.remove({ _id: user._id }, (err, user) => {
          if (err) res.send(err);
          req.logout();
          res.json({ status: true, message: "User successfully deleted" });
        });
      }
    );
  } else {
    res
      .status(403)
      .json({
        status: false,
        message: "You can only delete your own account!"
      });
  }
};

const verifyUser = (req, res) => {
  const token = req.params.token;
  User.findOne({
    token: token,
  }, (err, user) => {
    if (err) res.send(err)
    if (user !== null) {
      user.verified = true;
      user.save((err, savedUser) => {
        if (err) res.send(err);
        res.json({ status: true, message: 'Account verified for ' + savedUser.email });
      });
    } else {
      res.json({ status: false, message: 'No token found. Did you sign up for an account?' });
    }
  });
}

const logout = (req, res) => {
  req.logout();
  res.json({ loggedOut: true });
};

const onLogin = (req, res) => {
  const { username, email, token, _id } = req.user;
  res.json({
    username: username,
    email: email,
    token: token,
    id: _id
  });
};

// Sends a response - this is so we can do authentication on the client side
const authenticateClient = (req, res) => {
  if (req.user === undefined) {
    res.json({
      authenticated: false
    });
  } else {
    res.json({
      authenticated: true
    });
  }
};

const authenticateServer = (req, res, next) => {
  if (req.user === undefined) {
    return res.status(401).json({
      authenticated: false
    });
  }
  return next();
};

passport.use(
  new LocalStrategy(function(email, password, done) {
    console.log('here');
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
      if (!user.verified) {
        return done(null, false, { message: "user is not verified" });
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
  login: passport.authenticate("local"),
  logout: logout,
  protect: passport.authenticate("bearer"),
  add: addUser,
  delete: deleteUser,
  verify: verifyUser,
  onLogin: onLogin,
  authenticateClient: authenticateClient,
  authenticateServer: authenticateServer
};
