const mongoose = require("mongoose");

const ERC1155HOLDINGSchema = mongoose.Schema({
  contractAddress: { type: String, required: true },
  tokenID: { type: Number, required: true },
  holderAddress: { type: String, required: true },
  supplyPerHolder: { type: Number, default: 0 },
});

ERC1155HOLDINGSchema.index(
  { contractAddress: 1, tokenID: 1, holderAddress: -1 },
  { unique: true }
);

const ERC1155HOLDING = mongoose.model("ERC1155HOLDING", ERC1155HOLDINGSchema);

module.exports = ERC1155HOLDING;
