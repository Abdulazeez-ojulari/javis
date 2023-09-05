const mongoose = require("mongoose");

const gmailSchema = new mongoose.Schema({
  emailId: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
  },
  gmailMailId: {
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
  mailThreadId: {
    type: String,
    required: true,
    minlength: 1,
  },
  mailContent: { type: String, required: true },
  enifResponse: { type: String, required: false },
  businessId: { type: String, required: true, minlength: 1 },
  enifResponseDate: { type: Date, required: false },
  mailDate: { type: Date, required: true },
});

gmailSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const Gmail = mongoose.model("Gmail", gmailSchema);

exports.Gmail = Gmail;
