const mongoose = require("mongoose");

const FaqEntrySchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
});

const schema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Types.ObjectId,
      required: true,
      minlength: 1,
      ref: "Business",
    },

    faqs: [FaqEntrySchema],
  },
  { timestamps: true }
);

schema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const Faq = mongoose.model("Faq", schema);

Faq.syncIndexes();

module.exports.Faq = Faq;
