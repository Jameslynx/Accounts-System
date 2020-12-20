const express = require("express");
const router = express.Router();
const jimp = require("jimp");
const { ensureAuthenticated } = require("../config/auth");
const upload = require("../config/upload");

// Welcome page
router.get("/", (req, res) => {
  res.render("index");
});

// Dashboard page
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", { name: req.user.name, dp: req.user.dp });
});

// Dashboard handle
router.post("/dashboard", ensureAuthenticated, upload.none(), (req, res) => {
  let data = Buffer.from(req.body.thumbnail.split(/,/)[1], "base64");
  jimp.read(data, (err, image) => {
    console.log(err, image);
    if (err) {
      return res.send("image update failed");
    } else {
      if (!/image\/*/.test(image._originalMime)) {
        return res.send("image update failed");
      }
      if (image.bitmap.width < 75 || image.bitmap.height < 75) {
        return res.send("image should be atleast 75x75");
      }
      if (image.bitmap.width > 250 || image.bitmap.height > 250) {
        return res.send("image should be atmost 250x250");
      }
      req.user.dp.data = data;
      req.user.dp.contentType = "image/png";
      req.user.save((err, user) => {
        if (err) res.send(err);
        else {
          req.flash("success_msg", "profile picture updated");
          res.redirect("/dashboard");
        }
      });
    }
  });
});

module.exports = router;
