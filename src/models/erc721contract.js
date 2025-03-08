const mongoose = require("mongoose");

const ERC721CONTRACTSchema = mongoose.Schema(
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

const ERC721CONTRACT = mongoose.model("ERC721CONTRACT", ERC721CONTRACTSchema);

module.exports = ERC721CONTRACT;
