const chatController = require('./chatController');
const express = require('express');
const router = express.Router();

router.post('/send', chatController.sendChat);

router.post('/reply', chatController.replyChat);

router.get('/user/:email', chatController.getUserChat);

router.get('/conversation/:chatId', chatController.getConversation);

router.get('/all-chat/:businessId', chatController.getBusinessChats);

router.post('/new-chat', chatController.newChat);

module.exports = router;