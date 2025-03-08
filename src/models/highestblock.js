const mongoose = require("mongoose");

const BlockHeightSchema = mongoose.Schema({
  network: { type: String, default: "Opera" },
  height: { type: Number, default: 0 },
  epoch: { type: Date },
});

const BlockHeight = mongoose.model("BlockHeight", BlockHeightSchema);

module.exports = BlockHeight;
