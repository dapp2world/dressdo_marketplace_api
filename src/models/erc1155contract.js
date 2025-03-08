const mongoose = require("mongoose");

const ERC1155CONTRACTSchema = mongoose.Schema(
  {
    address: { type: String, required: true, index: { unique: true } },
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isAppropriate: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const ERC1155CONTRACT = mongoose.model("ERC1155CONTRACT", ERC1155CONTRACTSchema);

module.exports = ERC1155CONTRACT;
