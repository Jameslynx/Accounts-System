const mongoose = require("mongoose");
const fs = require("fs");

// dummy dipslay image
let dummy = fs.readFileSync("public/blank-profile.png");

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  confirmed: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: "pending",
  },
  dp: {
    data: { type: Buffer, default: dummy },
    contentType: { type: String, default: "image/png" },
  },
  date: { type: String, default: Date.now },
});

module.exports = mongoose.model("user", UserSchema);
