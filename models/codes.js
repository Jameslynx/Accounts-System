const { Schema, model } = require("mongoose");

// user registeration codes schema
const secretSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
    expires: 600,
  },
});

module.exports = model("secretCode", secretSchema);
