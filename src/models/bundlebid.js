const mongoose = require("mongoose");

const BundleBidSchema = mongoose.Schema({
  bundleID: { type: String, required: true },
  bidder: { type: String, required: true },
  bid: { type: Number, required: true },
});
BundleBidSchema.index({ bundleID: 1 }, { unique: true });

const BundleBid = mongoose.model("BundleBid", BundleBidSchema);

module.exports = BundleBid;
