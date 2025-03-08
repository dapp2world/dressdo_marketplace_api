const mongoose = require("mongoose");

const BannedUserSchema = mongoose.Schema({
  address: { type: String, required: true },
  reason: { type: String },
});

BannedUserSchema.index(
  {
    address: 1,
  },
  { unique: true }
);

const BannedUser = mongoose.model("BannedUser", BannedUserSchema);

module.exports = BannedUser;
