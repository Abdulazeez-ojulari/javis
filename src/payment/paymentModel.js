const mongoose = require("mongoose");
const { PAYMENT_STATUS } = require("../utils/const");

// enum PaymentStatus {
//     SUCCESS = 'success',
//     FAILED = 'failed',
//     PENDING = 'pending'
// }

const planSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
  },
  plan: {
    type: String,
    required: true,
    minlength: 1,
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
    required: true,
  },
  metaData: {
    type: String,
    required: false,
  },
  paymentStatus: {
    type: String,
    required: true,
    default: "failed",
    enum: Object.values(PAYMENT_STATUS),
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

planSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const PlanPayment = mongoose.model("PlanPayment", planSchema);

module.exports = PlanPayment;
