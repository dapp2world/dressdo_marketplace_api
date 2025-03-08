const mongoose = require("mongoose");

const OfferSchema = mongoose.Schema({
  creator: { type: String },
  minter: { type: String },
  tokenID: { type: Number }, //nft item token id
  quantity: { type: String }, // number of items tranferred
  paymentToken: { type: String, default: "dt" }, // payment erc20 token address
  pricePerItem: { type: Number }, // price in payment token
  priceInUSD: { type: Number, default: 0 },
  deadline: { type: Number, required: false },
  blockNumber: { type: Number, required: true },
});
OfferSchema.index({ minter: 1, tokenID: -1, creator: 1 }, { unique: true });

const Offer = mongoose.model("Offer", OfferSchema);

module.exports = Offer;
