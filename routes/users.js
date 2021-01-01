const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");

const User = require("../models/User");
const secretCode = require("../models/codes");
const log = require("../models/maillog");
const Mailer = require("../config/mailer");

// Login page
router.get("/login", (req, res) => {
  res.render("login");
});

// Register page
router.get("/register", (req, res) => {
  res.render("register");
});

// Handle Register
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password && password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  if (errors.length) {
    res.render("register", { errors, name, email, password, password2 });
  } else {
    // Validation passed
    User.findOne({ email: email }, (err, user) => {
      if (err) return res.send("database internal error");
      if (user) {
        errors.push({ msg: "Email is already registered" });
        res.render("register", { errors, name, email, password, password2 });
      } else {
        const newUser = new User({ name, email, password });

        // Hash password
        const hash = bcrypt.hashSync(newUser.password, 12);
        newUser.password = hash;
        newUser.save((err, user) => {
          if (err) console.log(err);
          else {
            mailerCoderLogger(user, req, res);
          }
        });
      }
    });
  }
});

// Login Handle
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout Handle
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

function mailerCoderLogger(user, req, res) {
  let secCode = new secretCode({ email: user.email, code: user._id });
  secCode.save((err, code) => {
    if (err) console.log(err);
    Mailer.mailConfig(
      user.email,
      user.name,
      code.code,
      code._id,
      req.headers.host
    );
    Mailer.sender((err, info) => {
      if (err) console.log(err);
      else {
        new log({ email: user.email, count: 1 }).save((err, doc) => {
          if (err) console.log(err);
          else res.redirect("/users/verification/mailAuth");
        });
      }
    });
  });
}

module.exports = router;
