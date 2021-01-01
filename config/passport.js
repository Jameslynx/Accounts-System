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
          // user doesn't exist
          return done(null, false, { message: "That email is not registered" });
        }
        if (!bcrypt.compareSync(password, user.password)) {
          // password incorrect
          return done(null, false, { message: "Password incorrect" });
        }
        // check if user is verified
        if (user.confirmed) {
          // user found, verified and password matched
          return done(null, user);
        } else {
          // user account not verified yet
          return done(null, false, { message: "acount not verified" });
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
