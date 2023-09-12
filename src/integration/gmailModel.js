const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

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
  escalated: {
    type: Boolean,
    default: false,
  },
  sentiment: {
    type: String,
    default: "Neutral",
  },
  channel: {
    type: String,
    required: true,
    minlength: 1,
  },
  category: {
    type: String,
    default: null,
  },
  type: {
    type: String,
    default: null,
  },
  department: {
    type: String,
    default: null,
  },
  escalation_department: {
    type: String,
    default: null,
  },
  titles: {
    type: [String],
  },
  title: {
    type: String,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  enifResponseDate: { type: Date, required: false },
  mailSentDate: { type: Date, required: false },
  created_date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  update_date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

gmailSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

gmailSchema.plugin(mongoosePaginate);

const  Gmail = mongoose.model("Gmail", gmailSchema);

module.exports = Gmail;
