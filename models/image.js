const mongoose = require("mongoose");

// Image schema for image storage
const imageSchema = mongoose.Schema({
  desc: String,
  img: {
    data: Buffer,
    contentType: String,
  },
});

module.exports = new mongoose.model("Image", imageSchema);
