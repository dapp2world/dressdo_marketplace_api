const mongoose = require("mongoose");

const TurkWorkSchema = mongoose.Schema({
  contractAddress: { type: String },
  tokenID: { type: Number },
  banDate: { type: Date },
});
TurkWorkSchema.index({ contractAddress: 1, tokenID: -1 }, { unique: true });

const TurkWork = mongoose.model("TurkWork", TurkWorkSchema);

module.exports = TurkWork;
