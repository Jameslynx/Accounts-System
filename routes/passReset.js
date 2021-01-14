const router = require("express").Router();
const bcrypt = require("bcrypt");

const User = require("../models/User");
const secretCode = require("../models/codes");
const log = require("../models/maillog");
const Mailer = require("../config/mailer");
const PassTester = require("../config/passparser");

router.get("/passwordReset", (req, res) => {
  res.render("reset");
});

router.post("/passwordReset", (req, res) => {
  let email = req.body.email;
  if (!email) {
    req.flash("error_msg", "Please enter email");
    return res.redirect("/users/password/passwordReset");
  }

  User.findOne({ email }, (err, user) => {
    if (err) console.log(err);
    // check for user and confirmation status
    else if (user && user.confirmed) {
      // check for existing secret code; not expired
      secretCode.findOne(
        {
          email,
          dateCreated: { $gte: Date.now() - 600000 },
          cat: "reset",
        },
        (err, code) => {
          if (err) console.log(err);
          else if (code) {
            req.flash(
              "success_msg",
              "check your email, link expires in 10 mins"
            );
            return res.redirect("/users/password/passwordReset");
          } else {
            mailerCoderLogger(user, req, res);
          }
        }
      );
    } else if (user && !user.confirmed) {
      req.flash("error", "account not verified");
      return res.redirect("/users/password/passwordReset");
    } else {
      req.flash("error_msg", "User not found");
      return res.redirect("/users/password/passwordReset");
    }
  });
});

// Password change
router.get("/passwordReset/:code/:codeId", (req, res) => {
  let userId = req.params.code;
  let codeId = req.params.codeId;
  res.render("password", { userId, codeId });
});

// Handle verification
router.post("/passwordReset/:code/:codeId", (req, res) => {
  let userId = req.params.code;
  let codeId = req.params.codeId;

  let { password, confirm } = req.body;

  let errors = [];

  if (password) {
    errors = errors.concat(PassTester.test(password));
  }

  if (password !== confirm) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (errors.length) {
    res.render("password", { errors, password, confirm, userId, codeId });
  }

  // check for verification code
  secretCode.findById(codeId, (err, code) => {
    if (err) console.log(err);
    else if (code && code.code === userId) {
      let hash = bcrypt.hashSync(password, 12);
      // check for user and verifify
      User.findOneAndUpdate(
        { _id: userId, email: code.email },
        { $set: { password: hash } },
        { new: true },
        (err, user) => {
          if (err) console.log(err);
          else if (user) {
            req.flash("success_msg", "Account password reset");
            return res.redirect("/users/login");
          } else {
            req.flash("error_msg", "Account does not exist");
            res.redirect("/users/register");
          }
        }
      );
    } else {
      // check if user is registered or not
      User.findById(userId, (err, user) => {
        if (err) console.log(err);
        else if (user) {
          req.flash("error_msg", "resend password reset link");
          return res.redirect("/users/password/passwordReset");
        } else {
          req.flash("error_msg", "Account does not exist");
          return res.redirect("/users/register");
        }
      });
    }
  });
});

function mailerCoderLogger(user, req, res) {
  // check maximum mail count
  checkLogCount(user.email, req, res, (doc) => {
    // create code
    let secCode = new secretCode({
      email: user.email,
      code: user._id,
      cat: "reset",
    });
    secCode.save((err, code) => {
      if (err) console.log(err);
      else {
        // create mail
        Mailer.resetMailConfig(
          user.email,
          user.name,
          code.code,
          code._id,
          req.headers.host
        );
        // send mail to user
        Mailer.sender((err, _) => {
          if (err) console.log(err);
          else {
            // increase mail count
            doc.count = ++doc.count;
            doc.save((err, _) => {
              if (err) console.log(err);
              else {
                req.flash("success_msg", "check your email");
                res.redirect("/users/password/passwordReset");
              }
            });
          }
        });
      }
    });
  });
}

function checkLogCount(email, req, res, cb) {
  // check for users maximum daily verification emails
  log.findOrCreate(
    { email, dateCreated: { $gte: Date.now() - 86400000 } },
    (err, doc) => {
      if (err) console.log(err);
      else {
        if (doc.count == 3) {
          req.flash("error_msg", "daily limit exceeded, try again later");
          res.redirect("/users/password/passwordReset");
        } else {
          // call callback with log doc
          cb(doc);
        }
      }
    }
  );
}

module.exports = router;
