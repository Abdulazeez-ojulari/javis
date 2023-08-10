const chatController = require('./chatController');
const express = require('express');
const router = express.Router();

router.post('/send', chatController.replyChat);

module.exports = router;