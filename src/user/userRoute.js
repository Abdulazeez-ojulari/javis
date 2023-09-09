const auth = require("../middlewares/auth");
const user = require("./userController");
const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middlewares/isAdmin");
const { body } = require("express-validator");
const { inventoryImagesUpload } = require("../middlewares/multer");

router.post("/signup", user.signup);

router.post("/login", user.login);

// list business administrators
router.get("/list-admins/:businessId", auth, user.fetchAdminList);

router.put(
  "/change-password",
  [
    auth,
    body("oldPassword")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please, enter old password"),
    body("newPassword")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please, enter new password"),
  ],
  user.changePassword
);

router.post("/image-upload", [auth, inventoryImagesUpload], user.imagesUpload);

// delete business administrators
// router.delete(
//   "/business/:businessId/team/:teamId",
//   [auth, isAdmin],
//   user.removeAdmin
// );

module.exports = router;
