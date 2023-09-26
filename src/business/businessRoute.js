const { body } = require("express-validator");
const auth = require("../middlewares/auth");
const businessController = require("./businessController");
const express = require("express");
const router = express.Router();

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

module.exports = router;
