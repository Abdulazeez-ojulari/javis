const auth = require("../middlewares/auth");

module.exports = (app) => {
  const router = require("express").Router();
  const controller = require("./notifications.controller");

  router.get("/", controller.Notifications);
  router.post(
    "/acknowledge/:notificationId",
    controller.acknowledgeNotifications
  );

  app.use("/ai/notifications", [auth], router);
};
