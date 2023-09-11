const { body } = require("express-validator");
const auth = require("../middlewares/auth");

module.exports = (app) => {
  const router = require("express").Router();
  const controller = require("./gmail.controller");

  //   router.post(
  //     "/",
  //     [body("mails", "Enter valid array of mails").isArray()],
  //     controller.persistGoogleMails
  //   );

  router.get("/:businessId", [auth], controller.getBusinessGmails);

  router.post("/", controller.persistGoogleMails);

  app.use("/ai/gmail", router);
};
