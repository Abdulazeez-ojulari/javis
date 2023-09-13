const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, minlength: 1 },
  email: {
    type: String,
  },
  businessId: {
    type: String,
    required: true,
    minlength: 1,
  },
  customer: {
    type: String,
  },
  phoneNo: {
    type: String,
  },
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

schema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const Ticket = mongoose.model("Ticket", schema);

exports.Ticket = Ticket;