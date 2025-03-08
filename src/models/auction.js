const mongoose = require("mongoose");

const AuctionSchema = mongoose.Schema({
  minter: { type: String, required: true },
  tokenID: { type: Number, required: true },
  bidder: { type: Number, required: true },
  startTime: { type: Number, required: true },
  endTime: { type: Date, required: true },
  paymentToken: {type: String, required: true},
  txHash: {type: String, required: true},
  reservePrice: {type: String, required: true},
  blockNumber: {type: Number, required: true },
});

AuctionSchema.index({ minter: 1, tokenID: -1 }, { unique: true });

const Auction = mongoose.model("Auction", AuctionSchema);

module.exports = Auction;
