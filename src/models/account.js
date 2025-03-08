const mongoose = require("mongoose");

const AccountSchema = mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      index : true,
      unique: true,
    },
    alias: { type: String },
    email: { type: String },
    bio: { type: String },
    imageHash: { type: String },
    bannerHash: { type: String },
    bundleIDs: [{ type: String }],
    nonce: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Instance method for formatting JSON response
AccountSchema.methods.toAccountJSON = function () {
  return {
    address: this.address,
    alias: this.alias,
    email: this.email,
    bio: this.bio,
    imageHash: this.imageHash,
    bannerHash: this.bannerHash,
  };
};

const Account = mongoose.model("Account", AccountSchema);

module.exports = Account;
