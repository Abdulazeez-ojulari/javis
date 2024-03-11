const restructureController = require("./restructureController");
const express = require("express");
const router = express.Router();

router.post('/message', restructureController.restructureMessage);

router.post('/email', restructureController.restructureEmail);

router.post('/email/html', restructureController.restructureEmailHtml);

module.exports = router;