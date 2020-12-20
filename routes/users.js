const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");

const User = require("../models/User");

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
  console.log(name, email, password, password2);
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
            req.flash("success_msg", "You are now registered and can log in");
            res.redirect("/users/login");
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

module.exports = router;
