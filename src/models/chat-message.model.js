const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  // ticketId: { type: mongoose.Types.ObjectId, ref: "Ticket" },
  ticketId: { type: String, required: true, unique: true, minlength: 1 },
  role: String,
  content: String,
  status: {
    type: String,
    required: true,
    default: "sent",
  },
  created_date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

schema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const ChatMessage = mongoose.model("ChatMessage", schema);

exports.ChatMessage = ChatMessage;
