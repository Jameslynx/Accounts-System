const { Schema, model } = require("mongoose");
const findOrCreate = require("mongoose-find-or-create");

const logSchema = new Schema({
  email: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  dateCreated: {
    type: Date,
    default: Date.now,
    expires: 86400,
  },
});
logSchema.plugin(findOrCreate);

module.exports = model("log", logSchema);
