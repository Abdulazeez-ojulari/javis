const auth = require("../middlewares/auth");
const { body } = require("express-validator");
const { inventoryImagesUpload } = require("../middlewares/multer");

module.exports = function (app) {
  const router = require("express").Router();
  const controller = require("./admin.controller");

  // delete business administrators
  router.delete(
    "/business/:businessId/administrators/:adminId",
    controller.removeAdmin
  );

  router.post(
    "/invite/:businessId/business",
    [
      body("inviteeEmail", "Input valid invitee email address")
        .trim()
        .isEmail(),
    ],
    controller.inviteMember
  );

  router.post(
    "/image-upload/:businessId/business",
    [inventoryImagesUpload],
    controller.inventoryImagesUpload
  );

  app.use("/ai/admin", [auth], router);
};
