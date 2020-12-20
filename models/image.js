const mongoose = require("mongoose");

const imageSchema = mongoose.Schema({
  desc: String,
  img: {
    data: Buffer,
    contentType: String,
  },
});

module.exports = new mongoose.model("Image", imageSchema);
