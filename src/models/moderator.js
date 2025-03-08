const mongoose = require("mongoose");

const ModeratorSchema = mongoose.Schema({
  address: { type: String, required: true },
  name: { type: String, required: true },
});
ModeratorSchema.index({ address: 1 }, { unique: true });

const Moderator = mongoose.model("Moderator", ModeratorSchema);

module.exports = Moderator;
