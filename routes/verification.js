const router = require("express").Router();

const User = require("../models/User");
const codes = require("../models/codes");

router.get("/mailAuth", (req, res) => {
  res.render("verification");
});

router.get("/mailAuth/:code/:codeId", (req, res) => {
  let userId = req.params.code;
  let codeId = req.params.codeId;

  codes.findById(codeId, (err, code) => {
    if (err) console.log(err);
    else if (code) {
      User.findOneAndUpdate(
        { _id: userId },
        { $set: { confirmed: true, status: "active" } },
        { new: true },
        (err, user) => {
          if (err) console.log(err);
          else if (user) {
            if (code.email === user.email) {
              req.flash("success_msg", "Account successfully verified");
              return res.redirect("/users/login");
            } else {
              req.flash("error_msg", "resend verification link");
              return res.redirect("/users/verification/mailAuth");
            }
          } else {
            req.flash("error_msg", "Account does not exist");
            res.redirect("/users/register");
          }
        }
      );
    } else {
      req.flash("error_msg", "resend verification link");
      return res.redirect("/users/verification/mailAuth");
    }
  });
});

module.exports = router;
