const mongoose = require("mongoose");

const FaqProductCatSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      minlength: 1,
      ref: "Business",
    },
    name: {
      type: String,
      required: true,
      minlength: 1,
    },
    adminId: { type: mongoose.Schema.Types.ObjectId, required: true, minlength: 1 },
    id: {},
  },
  { timestamps: true }
);

FaqProductCatSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const FaqProductCat = mongoose.model(
  "FaqProductCat",
  FaqProductCatSchema
);

FaqProductCat.syncIndexes();

exports.FaqProductCat = FaqProductCat;
