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

  // router.get("/:businessId", [auth], controller.getBusinessGmails);

  router.get("/ticket/:businessId", [auth], controller.getBusinessTickets);

  router.get("/:ticketId", [auth], controller.getBusinessMailByTicketId);

  router.post(
    "/reply/:mailId",
    [auth, body("reply").trim().notEmpty().withMessage("Enter valid reply")],
    controller.replyMail
  );

  router.post("/", controller.persistGoogleMails);

  router.post("/push", controller.pushNotification);

  router.post("/mail", controller.sendMail);

  app.use("/ai/gmail", router);
};
