const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  faqId: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
  },
  question: {
    type: String,
    required: true,
    minlength: 1,
  },
  response: {
    type: String,
    required: false,
  },
}, { timestamps: true});

schema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const RecentlyIdentifiedFAQ = mongoose.model("RecentlyIdentifiedFAQ", schema);

exports.RecentlyIdentifiedFAQ = RecentlyIdentifiedFAQ;
