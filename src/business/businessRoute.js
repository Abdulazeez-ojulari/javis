const businessController = require('./businessController');
const express = require('express');
const router = express.Router();

router.post('/create', businessController.createBusiness);

module.exports = router;