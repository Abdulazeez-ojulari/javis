const { body, oneOf, check } = require("express-validator");
const auth = require("../middlewares/auth");
const businessController = require("./businessController");
const express = require("express");
const router = express.Router();
const { avatar, doc } = require("../middlewares/multer");

router.post("/create", businessController.createBusiness);

router.post("/update", businessController.updateBusiness);

router.get("/get/:businessId", auth, businessController.getBusiness);

router.get("/get-faqs/:businessId", businessController.getBusinessFaqs);

router.get("/all", businessController.getAllBusiness);

router.post(
  "/:businessId/create-agent",
  [body("agentName", "Enter valid agent name").trim().not().isEmpty(), auth],
  businessController.createAgent
);

router.get("/:businessId/get-agents", auth, businessController.getAgents);

router.delete(
  "/:businessId/delete-agents/:agentId",
  auth,
  businessController.deleteAgent
);

router.delete(
  "/:businessId/team/:memberId",
  auth,
  businessController.deleteTeamMember
);

router.patch(
  "/:businessId/team/:memberId",
  [
    body("role", "Enter valid role, admin or member")
      .optional()
      .isIn(["admin", "member"]),
    body("department", "Enter valid department").optional().trim(),
    oneOf(
      [check("role").exists(), check("department").exists()],
      "Either role or department must be provided."
    ),
    auth,
  ],
  businessController.updateTeamMember
);

router.post(
  "/:businessId/avatar",
  [avatar, auth],
  businessController.updateBusinessAvatar
);

router.post(
  "/:businessId/doc",
  [doc, auth],
  businessController.updateBusinessDoc
);

module.exports = router;
