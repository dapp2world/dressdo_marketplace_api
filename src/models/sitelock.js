const mongoose = require("mongoose");

const SiteLockSchema = mongoose.Schema({
  isLocked: { type: Boolean, required: true, default: false },
  lockTime: { type: Number, required: true, default: 0 },
});

const SiteLock = mongoose.model("SiteLock", SiteLockSchema);

module.exports = SiteLock;
