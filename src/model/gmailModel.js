const mongoose = require("mongoose");
const gmailSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      minlength: 1,
      index: 1,
    },
    // ticketId: { type: String, required: true, minlength: 1 },
    mailId: { type: String, required: true, unique: true },
    gmailId: {
      type: String,
      required: true,
      minlength: 1,
      unique: true,
      sparse:true
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
    customerName: { type: String },
    mailSnippet: { type: String, required: true },
    threadId: {
      type: String,
      required: true,
      minlength: 1,
    },
    subject: { type: String, required: true },
    content: { type: String, required: false },
    assistantResponse: { type: String, required: false },
    assistantResponseDate: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      required: true,
      default: "sent",
    },
    role: { type: String, default: "user" },
    businessId: { type: String, required: true },
    originalMailDate: {
      type: Date,
      required: true,
    },
    created_date: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    id: {},
  },
  { timestamps: true }
);

gmailSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

// gmailSchema.plugin(mongoosePaginate);

const Gmail = mongoose.model("Gmail", gmailSchema);
Gmail.syncIndexes();

exports.Gmail = Gmail;
