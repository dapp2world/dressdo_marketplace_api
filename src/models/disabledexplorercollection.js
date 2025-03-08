const mongoose = require("mongoose");

const DisabledExplorerCollectionSchema = mongoose.Schema({
  minterAddress: { type: String, required: true, index: { unique: true } },
  type: { type: Number, default: 721 },
  reason: { type: String },
});

const DisabledExplorerCollection = mongoose.model("DisabledExplorerCollection", DisabledExplorerCollectionSchema);

module.exports = DisabledExplorerCollection;
