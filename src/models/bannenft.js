const mongoose = require("mongoose");

const BannedNFTSchema = mongoose.Schema({
  contractAddress: { type: String, required: true },
  tokenID: { type: Number, required: true },
});

BannedNFTSchema.index({ contractAddress: 1, tokenID: 1 }, { unique: true });

const BannedNFT = mongoose.model("BannedNFT", BannedNFTSchema);

module.exports = BannedNFT;
