const router = require("express").Router();

const User = require("../models/User");
const secretCode = require("../models/codes");
const log = require("../models/maillog");
const Mailer = require("../config/mailer");

// Verification notification page
router.get("/mailAuth", (req, res) => {
  res.render("verification");
});

// Hanle verification
router.get("/mailAuth/:code/:codeId", (req, res) => {
  let userId = req.params.code;
  let codeId = req.params.codeId;

  // check for verification code
  secretCode.findById(codeId, (err, code) => {
    if (err) console.log(err);
    else if (code && code.code === userId) {
      // check for user and verifify
      User.findOneAndUpdate(
        { _id: userId, email: code.email },
        { $set: { confirmed: true, status: "active" } },
        { new: true },
        (err, user) => {
          if (err) console.log(err);
          else if (user) {
            req.flash("success_msg", "Account successfully verified");
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
          req.flash("error_msg", "resend verification link");
          return res.redirect("/users/verification/mailAuth");
        } else {
          req.flash("error_msg", "Account does not exist");
          return res.redirect("/users/register");
        }
      });
    }
  });
});

// Handle verification link resend
router.post("/resend", (req, res) => {
  let email = req.body.email;

  User.findOne({ email }, (err, user) => {
    if (err) console.log(err);
    // check for user and confirmation status
    else if (user && !user.confirmed) {
      // check for existing secret code; not expired
      secretCode.findOne(
        { email, dateCreated: { $gte: Date.now() - 600000 } },
        (err, code) => {
          if (err) console.log(err);
          else if (code) {
            req.flash("success_msg", "check your email");
            return res.redirect("/users/verification/mailAuth");
          } else {
            mailerCoderLogger(user, req, res);
          }
        }
      );
    } else if (user && user.confirmed) {
      req.flash("success_msg", "user already registered");
      return res.redirect("/users/login");
    } else {
      req.flash("error_msg", "please enter registration email");
      return res.redirect("/users/verification/mailAuth");
    }
  });
});

function mailerCoderLogger(user, req, res) {
  // check maximum mail count
  checkLogCount(user.email, req, res, (doc) => {
    // create code
    let secCode = new secretCode({ email: user.email, code: user._id });
    secCode.save((err, code) => {
      if (err) console.log(err);
      else {
        // create mail
        Mailer.mailConfig(
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
                res.redirect("/users/verification/mailAuth");
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
          res.redirect("/users/verification/mailAuth");
        } else {
          // call callback with log doc
          cb(doc);
        }
      }
    }
  );
}

module.exports = router;
