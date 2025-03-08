const mongoose = require("mongoose");

const FactoryCollectionSchema = mongoose.Schema({
  deployer: { type: String, required: true },
  minter: { type: String, required: true },
});

FactoryCollectionSchema.index({ minter: 1 }, { unique: true });

const FactoryCollection = mongoose.model("FactoryCollection", FactoryCollectionSchema);

module.exports = FactoryCollection;
