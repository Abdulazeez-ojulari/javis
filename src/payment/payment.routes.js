const auth = require("../middlewares/auth");
const { body } = require("express-validator");

module.exports = function (app) {
  const router = require("express").Router();
  const controller = require("./payment.controller");

  router.post(
    "/plan/pay/business/:businessId",
    [
      auth,
      body("amount")
        .isInt({ min: 1000 })
        .withMessage("Enter valid plan amount"),
      body("plan", "Enter valid plan type").trim().not().isEmpty(),
    ],
    controller.pay
  );

  router.post("/webhook", controller.verifyPayment);

  app.use("/ai", router);
};
