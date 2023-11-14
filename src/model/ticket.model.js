const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    // ticketId: { type: String, required: true, unique: true, minlength: 1 },
    email: {
      type: String,
    },
    emailThread: {
      type: String,
      unique: true,
      required: false,
      sparse: true,
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
    placingOrder: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    agentName: {
      type: String,
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
    id: {}
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

ticketSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

ticketSchema.virtual("message", {
  ref: "ChatMessage",
  localField: "_id",
  options: { sort: { createdAt: -1 } },
  justOne: true,
  foreignField: "ticketId",
});

ticketSchema.virtual("messages", {
  ref: "ChatMessage",
  localField: "_id",
  options: { sort: { createdAt: -1 } },
  limit: 10,
  // justOne: true,
  foreignField: "ticketId",
});

ticketSchema.virtual("gmail", {
  ref: "Gmail",
  localField: "_id",
  options: { sort: { createdAt: -1 } },
  justOne: true,
  foreignField: "ticketId",
});
const Ticket = mongoose.model("Ticket", ticketSchema);

Ticket.syncIndexes();

exports.Ticket = Ticket
