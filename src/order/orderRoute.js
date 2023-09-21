const { body } = require("express-validator");
const orderController = require("./orderController");
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");

router.get("/get-all/:businessId", orderController.getOrders);

router.post(
  "/cancel/business/:businessId/chat/:chatId",
  [auth, body("orderId", "Enter valid order id").trim().not().isEmpty()],
  orderController.cancelOrder
);

router.post(
  "/complete/business/:businessId/chat/:chatId",
  [auth, body("orderId", "Enter valid order id").trim().not().isEmpty()],
  orderController.confirmOrder
);

module.exports = router;
