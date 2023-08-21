const chatController = require('./chatController');
const express = require('express');
const router = express.Router();

router.post('/send', chatController.replyChat);

router.get('/user/:email/:chatId', chatController.getUserChat);

router.get('/conversation/:chatId', chatController.getConversation);

router.get('/all-chat/:businessId', chatController.getBusinessChats);

module.exports = router;