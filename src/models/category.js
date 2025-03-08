const mongoose = require("mongoose");

const CategorySchema = mongoose.Schema({
  minterAddress: { type: String, required: true, index: { unique: true } },
  type: { type: Number, default: 721 },
});

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category;
