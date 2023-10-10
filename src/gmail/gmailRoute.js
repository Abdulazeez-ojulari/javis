const gmailController = require("./gmailController");
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

router.post("/:businessId/prompt", gmailController.processMail);

module.exports = router;
