const mongoose = require("mongoose");

const NotificationSchema = mongoose.Schema({
  address: { type: String, required: true },
  contents: [{ type: String }],
});

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
