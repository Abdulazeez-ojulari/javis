const chatController = require('./chatController');
const express = require('express');
const router = express.Router();

router.post('/send', chatController.replyChat);

router.get('/:chatId', chatController.getChat);

router.get('/all-chat/:businessId', chatController.getChats);

module.exports = router;