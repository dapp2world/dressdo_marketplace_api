const mongoose = require("mongoose");

const AbiSchema = mongoose.Schema({
  address: { type: String, required: true },
  abi: { type: String },
});

const ABI = mongoose.model("ABI", AbiSchema);

module.exports = ABI;
