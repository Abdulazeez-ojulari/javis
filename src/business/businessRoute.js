const auth = require("../middlewares/auth");
const businessController = require("./businessController");
const express = require("express");
const router = express.Router();

router.post("/create", businessController.createBusiness);

router.post("/update", businessController.updateBusiness);

router.get("/get/:businessId", auth, businessController.getBusiness);

router.get("/get-faqs/:businessId", businessController.getBusinessFaqs);

router.get("/", businessController.getAllBusiness);

module.exports = router;
