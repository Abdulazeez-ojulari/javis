const auth = require("../middlewares/auth");
const chatController = require("./chatController");
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

router.post("/send", chatController.sendChat);

router.post("/reply", chatController.replyChat);

router.get("/user/:email", [auth], chatController.getUserChat);

// router.get("/user/:email/messages", chatController.getUserChatMessages);

router.get(
  "/user/:ticketId/messages",
  [auth],
  chatController.getUserChatMessages
);

router.get("/conversation/:ticketId",[auth], chatController.getConversation);

router.get("/all-chat/:businessId", chatController.getBusinessChats);

router.post("/new-chat", chatController.newChat);

// router.post(
//   "/acknowledge-chat-messages/business/:businessId",
//   [auth],
//   chatController.acknowledgeChat
// );

module.exports = router;
