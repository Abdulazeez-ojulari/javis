const businessController = require('./businessController');
const express = require('express');
const router = express.Router();

router.post('/create', businessController.createBusiness);

router.post('/update', businessController.updateBusiness);

router.get('/get/:businessId', businessController.getBusiness);

module.exports = router;