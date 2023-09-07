const mongoose = require("mongoose");
const { PAYMENT_STATUS, PLAN } = require("../utils/const");

// enum PaymentStatus {
//     SUCCESS = 'success',
//     FAILED = 'failed',
//     PENDING = 'pending'
// }

const planSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
  },
  plan: {
    type: String,
    required: true,
    minlength: 1,
    enum: Object.values(PLAN),
  },
  amount: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  businessId: {
    type: mongoose.Types.ObjectId,
    // required: true,
    ref: "Business",
  },
  reference: {
    type: String,
    required: true,
  },
  paystackReference: {
    type: String,
    required: true,
  },
  transactionDate: {
    type: Date,
    required: false,
  },
  metaData: {
    type: String,
    required: false,
  },
  transactionStatus: {
    type: String,
    required: true,
    default: "failed",
    enum: Object.values(PAYMENT_STATUS),
  },
  transactionExpirationDate: { type: Date, required: true },
  created_date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  updated_date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

planSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const PlanPayment = mongoose.model("PlanPayment", planSchema);

module.exports = PlanPayment;
