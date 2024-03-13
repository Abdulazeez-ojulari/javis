const mongoose = require("mongoose");
const message = new mongoose.Schema({
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

let schema = new mongoose.Schema(
  {
    ticketId: { type: mongoose.Schema.Types.ObjectId, required: true, minlength: 1, ref: 'Ticket', index: 1 },
    role: String,
    content: String,
    email: {
      type: String,
    },
    businessId: {
      type: String,
      required: true,
      minlength: 1,
    },
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
    id: {}
  },
  { timestamps: true }
);

schema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const ChatMessage = mongoose.model("ChatMessage", schema);

exports.ChatMessage = ChatMessage;
