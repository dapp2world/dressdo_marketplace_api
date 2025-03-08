const mongoose = require("mongoose");

const PayTokenSchema = mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  address: { type: String, required: true },
  chainlinkProxyAddress: { type: String, required: true },
  decimals: { type: Number, required: true },
  isMainnet: { type: Boolean, default: true },
});

PayTokenSchema.index({ address: 1, isMainnet: -1 }, { unique: true });

const PayToken = mongoose.model("PayToken", PayTokenSchema);

module.exports = PayToken;
