const mongoose = require("mongoose");

const BundleAuctionSchema = mongoose.Schema({
  bundleID: { type: String, required: true },
  bidder: { type: Number, required: true },
  startTime: { type: Number, default: Date.now },
  endTime: { type: Date, default: Date.now },
});

BundleAuctionSchema.index({ bundleID: 1 }, { unique: true });
const BundleAuction = mongoose.model("BundleAuction", BundleAuctionSchema);

module.exports = BundleAuction;
