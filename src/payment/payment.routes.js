const auth = require("../middlewares/auth");
const { body } = require("express-validator");

module.exports = function (app) {
  const router = require("express").Router();
  const controller = require("./payment.controller");

  router.post(
    "/",
    [
      body("amount")
        .isInt({ min: 1000 })
        .withMessage("Enter valid plan amount"),
      body("plan", "Enter valid plan type").trim().not().isEmpty(),
    ],
    controller.pay
  );

  // router.post("/webhook", controller.verifyPayment);
  router.post("/verify/:trxRef", controller.verifyPayment);

  router.get(
    "/:businessId/plan-days-to-expiration",
    auth,
    controller.getPlanExpirationDaysLeft
  );

  app.use("/ai/plan/pay", auth, router);
};
