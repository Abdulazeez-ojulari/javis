const auth = require("../middlewares/auth");

module.exports = (app) => {
  const router = require("express").Router();
  const { body } = require("express-validator");
  const controller = require("./detectedFAQ.controller");

  router.get("/:businessId", controller.getNewlyDetectedFAQ);
  router.post(
    "/reply/:faqId",
    body("reply", "Enter valid reply").trim().not().isEmpty(),
    controller.replyNewlyDetectedFAQ
  );

  app.use("/ai/detected-faq", [auth], router);
};
