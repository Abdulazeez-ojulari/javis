const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  ticketId: { type: mongoose.Types.ObjectId, ref: "Ticket" },
  mailId: { type: String, required: true, unique: true },
  gmailId: {
    type: String,
    required: true,
    unique: true,
    minlength: 1,
  },
  from: {
    type: String,
    required: true,
    minlength: 1,
  },
  to: {
    type: String,
    required: true,
    minlength: 1,
  },
  mailSnippet: { type: String, required: true },
  threadId: {
    type: String,
    required: true,
    minlength: 1,
  },
  subject: { type: String, required: true },
  content: { type: String, required: false },
  assistantResponse: { type: String, required: false },
  status: {
    type: String,
    required: true,
    default: "sent",
  },
  role: { type: String, default: "user" },
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

const GoogleMail = mongoose.model("GoogleMail", schema);

exports.GoogleMail = GoogleMail;