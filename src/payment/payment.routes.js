const auth = require("../middlewares/auth");
const { body } = require("express-validator");

module.exports = function (app) {
  const router = require("express").Router();
  const controller = require("./payment.controller");

  router.post(
    "/pay",
    [body("amount", "Enter valid plan amount").isNumeric()],
    controller.pay
  );

  app.use("/plan", auth, router);
};
