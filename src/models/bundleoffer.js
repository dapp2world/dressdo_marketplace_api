const mongoose = require("mongoose");

const BundleOfferSchema = mongoose.Schema({
  bundleID: { type: String, required: true },
  creator: { type: String, required: true },
  paymentToken: { type: String, default: "dt" }, // payment erc20 token address
  price: { type: Number, required: true }, // price in payment token
  priceInUSD: { type: Number, default: 0 }, // price in usd
  deadline: { type: Number },
});
BundleOfferSchema.index({ bundleID: 1 }, { unique: true });

const BundleOffer = mongoose.model("BundleOffer", BundleOfferSchema);

module.exports = BundleOffer;
