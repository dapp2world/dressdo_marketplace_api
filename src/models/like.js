const mongoose = require("mongoose");

const LikeSchema = mongoose.Schema({
  contractAddress: { type: String, required: true },
  tokenID: { type: Number, required: true },
  follower: { type: String, required: true },
});

LikeSchema.index({ contractAddress: 1, tokenID: 1, follower: -1 }, { unique: true });

const Like = mongoose.model("Like", LikeSchema);

module.exports = Like;
