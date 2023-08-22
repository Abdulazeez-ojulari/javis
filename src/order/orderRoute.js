const orderController = require('./orderController');
const express = require('express');
const router = express.Router();

router.get('/get-all/:businessId', orderController.getOrders);

module.exports = router;