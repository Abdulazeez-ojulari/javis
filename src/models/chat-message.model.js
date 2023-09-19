const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  // ticketId: { type: mongoose.Types.ObjectId, ref: "Ticket" },
  ticketId: { type:  mongoose.Types.ObjectId, required: true, minlength: 1, ref: 'Ticket', index: 1 },
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
}, { timestamps: true});

schema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const ChatMessage = mongoose.model("ChatMessage", schema);
ChatMessage.syncIndexes()

exports.ChatMessage = ChatMessage;
