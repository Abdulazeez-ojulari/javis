const errorMiddleWare = require("../middlewares/error");
const uuid = require("uuid");
const PlanPayment = require("../payment/paymentModel");
const {
  generateTransactionReference,
  calculateExpirationDate,
} = require("../utils/helper");
const { validationResult } = require("express-validator");
const paystack = require("../utils/paystack");
const { Business } = require("../business/businessModel");
const { User } = require("../user/userModel");
const { PAYMENT_STATUS } = require("../utils/const");
const crypto = require("crypto");

exports.pay = errorMiddleWare(async (req, res) => {
  const { id, userId, isAdmin } = req.user;
  // const { businessId } = req.params;
  const errors = validationResult(req);
  const transactionId = uuid.v4();
  const reference = generateTransactionReference();
  const { amount, plan } = req.body;
  const planExpirationDate = calculateExpirationDate(plan, new Date());
  const currentDate = new Date();

  if (!errors.isEmpty()) {
    let validationErrors = [];
    for (const error of errors.array()) {
      validationErrors.push({ field: error.path, message: error.msg });
    }

    return res
      .status(400)
      .json({ message: "Bad Request", data: validationErrors });
  }

  const user = await User.findOne({ userId });

  if (!user) {
    return res.status(403).json({ message: "User not found", data: user });
  }

  // const business = await Business.findOne({ businessId: businessId });

  // if (!business) {
  //   return res
  //     .status(404)
  //     .json({ message: "Business not found", data: business });
  // }

  /* checks that admin initiating the admin delete request is a member of the business
  and that role is either admin or owner*/
  // const isThisAdminMemberOfBusiness = business.teams.filter((team) => {
  //   return (
  //     team.userId._id.toString() === id &&
  //     (team.role === "admin" || team.role === "owner")
  //   );
  // });

  // if (isThisAdminMemberOfBusiness.length <= 0) {
  //   return res.status(403).json({
  //     message: "You do not possess the permission to access this route",
  //   });
  // }

  const ongoingPlan = await PlanPayment.findOne({
    // businessId: business.id,
    userId: user.id,
    transactionStatus: PAYMENT_STATUS["SUCCESS"],
    transactionExpirationDate: { $gt: currentDate },
  });

  if (ongoingPlan) {
    return res.status(200).json({
      message: "You still have valid payment ongoing",
      data: ongoingPlan,
    });
  }

  const paymentData = {
    email: user.email,
    amount: parseInt(amount) * 100,
    // amount: +amount * 100, // Amount in kobo (100 kobo = 1 Naira)
    currency: "NGN", // Nigerian Naira
    reference, // unique reference for each transaction
  };

  const transactionResponse = await paystack.transaction.initialize({
    ...paymentData,
  });

  const planPaymentObj = {
    transactionId: transactionId,
    plan,
    amount,
    userId: id,
    // businessId: business.id,
    reference,
    paystackReference: transactionResponse.data.reference,
    transactionStatus: PAYMENT_STATUS["PENDING"],
    transactionExpirationDate: planExpirationDate,
    created_date: new Date(),
    updated_date: new Date(),
  };

  const transaction = await new PlanPayment(planPaymentObj);

  await transaction.save();
  // console.log(transaction);

  res.send({
    message: "Payment reference generated successful",
    data: transactionResponse.data,
  });
});

// exports.verifyPayment = errorMiddleWare(async (req, res) => {
//   const event = req.body;
//   const secret = process.env.PAYSTACK_SECRET;
//   const hash = crypto
//     .createHmac("sha512", secret)
//     .update(JSON.stringify(req.body))
//     .digest("hex");

//   if (hash != req.headers["x-paystack-signature"]) {
//     console.log("Invalid request from paystack");
//     return;
//   }
//   const trxReference = event.data.reference;
//   const paymentDate = event.data.paid_at;
//   const created_at = event.data.created_at;

//   const transaction = await PlanPayment.findOne({ reference: trxReference });
//   if (!transaction) {
//     console.log("invalid transaction reference");
//     return;
//   }

//   // verify transaction reference
//   const verifyResponse = await paystack.transaction.verify(trxReference);
//   // console.log(verifyResponse, hash, req.headers["x-paystack-signature"]);
//   transaction.transactionDate = paymentDate;
//   transaction.created_date = created_at;
//   transaction.updated_date = new Date();
//   if (verifyResponse.data.status === "success") {
//     transaction.transactionStatus = PAYMENT_STATUS["SUCCESS"];
//   } else {
//     transaction.transactionStatus = PAYMENT_STATUS["FAILED"];
//   }

//   await transaction.save();

//   // console.log(
//   //   transaction,
//   //   "-----------------------------------------------------",
//   //   verifyResponse
//   // );

//   // Verify the webhook event (using Paystack's library or manually)
//   // Handle the event and update your database accordingly

//   res.status(200).json({ message: "Webhook received" });
// });

exports.verifyPayment = errorMiddleWare(async (req, res) => {
  const { trxRef } = req.params;

  const transaction = await PlanPayment.findOne({ reference: trxRef });
  if (!transaction) {
    console.log("invalid transaction reference");
    return;
  }

  if (transaction.transactionStatus === PAYMENT_STATUS["SUCCESS"]) {
    return res.status(200).json({
      message: "Transaction verified successfully",
      data: transaction,
    });
  }

  // verify transaction reference
  const { data } = await paystack.transaction.verify(trxRef);
  // console.log(data);

  transaction.transactionDate = data.paid_at;
  transaction.created_date = data.created_at;
  transaction.updated_date = new Date();
  if (data.status === "success") {
    transaction.transactionStatus = PAYMENT_STATUS["SUCCESS"];
  } else {
    transaction.transactionStatus = PAYMENT_STATUS["FAILED"];
  }

  await transaction.save();

  res
    .status(200)
    .json({ message: "Transaction verified successfully", data: transaction });
});
