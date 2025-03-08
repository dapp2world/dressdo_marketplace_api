const mongoose = require("mongoose");

const BundleLikeSchema = mongoose.Schema({
  bundleID: { type: String, required: true },
  follower: { type: String, required: true },
});

BundleLikeSchema.index({ bundleID: 1, follower: -1 }, { unique: true });

const BundleLike = mongoose.model("BundleLike", BundleLikeSchema);

module.exports = BundleLike;
