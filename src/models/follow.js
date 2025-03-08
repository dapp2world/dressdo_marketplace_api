const mongoose = require("mongoose");

const FollowSchema = mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
});

FollowSchema.index({ from: 1, to: 1 }, { unique: true });

const Follow = mongoose.model("Follow", FollowSchema);

module.exports = Follow;
