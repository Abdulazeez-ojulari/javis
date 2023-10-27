const restructureController = require("./restructureController");
const express = require("express");
const router = express.Router();

router.post('/message', restructureController.restructureMessage);

module.exports = router;