const mongoose = require("mongoose");

const UnlockableContentsSchema = mongoose.Schema({
  contractAddress: { type: String, required: true },
  tokenID: { type: Number, required: true },
  content: { type: String, required: true },
});

UnlockableContentsSchema.index({ contractAddress: 1, tokenID: -1 }, { unique: true });

const UnlockableContents = mongoose.model("UnlockableContents", UnlockableContentsSchema);

module.exports = UnlockableContents;
