const chatController = require("./chatController");
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

// router.post("/send", chatController.sendChat);

// router.post("/reply", chatController.replyChat);

// router.get("/user/:email", chatController.getUserChat);

// router.get("/user/:email/messages", chatController.getUserChatMessages);

// router.get(
//   "/user/:ticketId/messages",
//   // [auth],
//   chatController.getUserChatMessages
// );


// router.get("/conversation/:ticketId", chatController.getConversation);

// router.get("/all-chat/:businessId", chatController.getBusinessChats);

// router.post("/new-chat", chatController.newChat);

// router.get("/question",chatController.question)

router.get('/:businessId/generatevectors', chatController.generateVectors);

router.post('/:businessId/prompt', chatController.processMessage);

router.post('/categorization', chatController.messageCategorization);

// router.post(
//   "/acknowledge-chat-messages/business/:businessId",
//   [auth],
//   chatController.acknowledgeChat
// );

module.exports = router;
