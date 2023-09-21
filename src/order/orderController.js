const { validationResult } = require("express-validator");
const errorMiddleware = require("../middlewares/error");
const { Order } = require("./orderModel");
const { Business } = require("../business/businessModel");

module.exports.getOrders = errorMiddleware(async (req, res) => {
  let { businessId } = req.params;

  const orders = await Order.find({ businessId: businessId });
  if (!orders) {
    return res.status(404).send({ message: "Order doesn't exists" });
  }

  return res.send(orders);
});

module.exports.cancelOrder = errorMiddleware(async (req, res) => {
  let { businessId, chatId } = req.params;
  const { email } = req.body;
  const user = req.user;
  const errors = validationResult(req);

  console.log("hello");

  if (!errors.isEmpty()) {
    const validationErrors = [];
    for (let error of errors.array()) {
      validationErrors.push({ field: error.path, message: error.msg });
    }

    return res
      .status(400)
      .json({ message: "Bad Request", data: validationErrors });
  }

  const business = await Business.findOne({ businessId });

  if (!business) {
    return res.status(404).send({ message: "Business doesn't exists" });
  }

  const isThisAdminMemberOfBusiness = business.teams.filter((team) => {
    return (
      team.userId._id.toString() === user.id &&
      (team.role === "admin" || team.role === "owner")
    );
  });

  if (isThisAdminMemberOfBusiness.length <= 0) {
    return res.status(403).json({
      message: "You do not possess the permission to access this route",
    });
  }

  const order = await Order.findOne({
    businessId,
    email: email.toLowerCase(),
    chatId,
  });
  if (!order) {
    return res.status(404).send({ message: "Order doesn't exists" });
  }

  order.status = "cancelled";

  await order.save();

  return res.send({ message: "Order cancelled successfully", data: order });
});

module.exports.confirmOrder = errorMiddleware(async (req, res) => {
  let { businessId, chatId } = req.params;
  const { email } = req.body;
  const user = req.user;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors = [];
    for (let error of errors.array()) {
      validationErrors.push({ field: error.path, message: error.msg });
    }

    return res
      .status(400)
      .json({ message: "Bad Request", data: validationErrors });
  }

  const business = await Business.findOne({ businessId });

  if (!business) {
    return res.status(404).send({ message: "Business doesn't exists" });
  }

  const isThisAdminMemberOfBusiness = business.teams.filter((team) => {
    return (
      team.userId._id.toString() === user.id &&
      (team.role === "admin" || team.role === "owner")
    );
  });

  if (isThisAdminMemberOfBusiness.length <= 0) {
    return res.status(403).json({
      message: "You do not possess the permission to access this route",
    });
  }

  const order = await Order.findOne({
    businessId,
    email: email.toLowerCase(),
    chatId,
  });
  if (!order) {
    return res.status(404).send({ message: "Order doesn't exists" });
  }
  // return res.send(order);
  order.status = "completed";
  await order.save();

  return res.send({ message: "Order confirmed successfully", data: order });
});
