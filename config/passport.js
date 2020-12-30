const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

// Load user
const User = require("../models/User");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Match User
      User.findOne({ email: email }, (err, user) => {
        if (err) console.log(err);
        else if (!user) {
          return done(null, false, { message: "That email is not registered" });
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false, { message: "Password incorrect" });
        }
        if (user.confirmed) {
          return done(null, user);
        } else {
          return done(null, false, { message: "email not verified" });
        }
      });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(null, user);
    });
  });
};
