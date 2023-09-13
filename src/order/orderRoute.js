const { body } = require("express-validator");
const orderController = require("./orderController");
const express = require("express");
const router = express.Router();

router.get("/get-all/:businessId", orderController.getOrders);

router.post(
  "/cancel/business/:businessId/chat/:chatId",
  [auth, body("email", "Enter valid customer email address").isEmail()],
  orderController.cancelOrder
);

router.post(
  "/complete/business/:businessId/chat/:chatId",
  [auth, body("email", "Enter valid customer email address").isEmail()],
  orderController.confirmOrder
);

module.exports = router;
