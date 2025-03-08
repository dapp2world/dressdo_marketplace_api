const mongoose = require("mongoose");

const BundleInfoSchema = mongoose.Schema({
  contractAddress: { type: String, required: true },
  bundleID: { type: String, required: true },
  tokenID: { type: Number, required: true },
  tokenURI: { type: String },
  tokenType: { type: Number, default: 721 },
  supply: { type: Number, required: true },
});
BundleInfoSchema.index(
  { contractAddress: 1, bundleID: -1, tokenID: 1 },
  { unique: true }
);

const BundleInfo = mongoose.model("BundleInfo", BundleInfoSchema);

module.exports = BundleInfo;
