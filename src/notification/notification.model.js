const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model (assuming you have a User model)
    required: false,
  },
  recipients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model (recipient)
      required: true,
    },
  ],
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  metaData: { type: String, required: false },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

notificationSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
