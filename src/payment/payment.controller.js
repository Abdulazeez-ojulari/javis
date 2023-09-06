const errorMiddleWare = require("../middlewares/error");
const uuid = require("uuid");
const PlanPayment = require("../payment/paymentModel");

exports.pay = errorMiddleWare(async (req, res) => {
  res.send({ message: "successful" });
});
