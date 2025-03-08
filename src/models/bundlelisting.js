const mongoose = require("mongoose");

const BundleListingSchema = mongoose.Schema({
  bundleID: { type: String, required: true },
  owner: { type: String, required: true },
  paymentToken: { type: String, default: "dt" }, // payment erc20 token address
  priceInUSD: { type: Number, default: 0 },
  price: { type: Number, required: true },
  startTime: { type: Date },
  isPrivate: { type: Boolean, default: false },
  allowedAddress: { type: String },
});
BundleListingSchema.index({ bundleID: 1 }, { unique: true });
const BundleListing = mongoose.model("BundleListing", BundleListingSchema);

module.exports = BundleListing;
