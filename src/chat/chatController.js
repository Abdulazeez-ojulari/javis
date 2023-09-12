const { Business } = require("../business/businessModel");
const errorMiddleware = require("../middlewares/error");
const { Chat } = require("./chatModel");
const { createChatService, processChatService } = require("./chatService");
const eventEmitter = require("../event/events");

module.exports.newChat = errorMiddleware(async (req, res) => {
  let { email, businessId, channel, customer, phoneNo } = req.body;

  const business = await Business.findOne({ businessId: businessId });
  if (!business) {
    return res.status(400).send({ message: "Business doesn't exists" });
  }

  let id = await createChatService(
    businessId,
    email,
    channel,
    customer,
    phoneNo
  );

  let chat = await Chat.findOne({ chatId: id });

  eventEmitter.emit("notifyNewChat", {
    businessId,
    customer,
    email,
    channel,
    phoneNo,
  });

  return res.send(chat);
});

module.exports.sendChat = errorMiddleware(async (req, res) => {
  let { chatId, email, businessId, channel, customer, promptMsg } = req.body;
  let data = await processChatService(
    chatId,
    email,
    businessId,
    channel,
    customer,
    promptMsg
  );

  eventEmitter.emit("notifyNewChatMessage", {
    businessId,
    customer,
    promptMsg,
    email,
    channel,
    chatId,
  });

  return res.send(data);
});

module.exports.replyChat = errorMiddleware(async (req, res) => {
  let { chatId, businessId, channel, customer, reply, messageId } = req.body;

  const business = await Business.findOne({ businessId: businessId });
  if (!business) {
    return res.status(400).send({ message: "Business dosen't exists" });
  }

  let chat = await Chat.findOne({ chatId: chatId });
  // console.log(chat)

  if (messageId) {
    let messages = chat.messages;
    let msg;
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (message.id == messageId) {
        msg = message;
        if (message.status === "draft") {
          message.content = reply;
          message.status = "sent";
        }
      }
    }
    chat.messages = messages;
    await chat.save();
    let data = {
      // replyMode: "auto",
      chatId: chatId,
      reply: msg,
    };
    return res.send(data);
  }
});

// module.exports.getUserChat = errorMiddleware(async (req, res) => {
//   let { email } = req.params;
//   // let { businessId } = req.query;

//   if (!email) {
//     return res.status(404).send({ message: "Email not provided" });
//   }

//   let chats = await Chat.find({ email: email });
//   return res.send(chats);
// });

module.exports.getUserChat = errorMiddleware(async (req, res) => {
  let { email } = req.params;
  let { businessId } = req.query;
  let chats;

  if (!email) {
    return res.status(404).send({ message: "Email not provided" });
  }

  if (!businessId) {
    chats = await Chat.find({ email: email }).select("-messages");
  } else {
    chats = await Chat.find({ email, businessId }).select("-messages");
  }
  return res.send(chats);
});

module.exports.getConversation = errorMiddleware(async (req, res) => {
  let { chatId } = req.params;

  let chat = await Chat.findOne({ chatId: chatId });
  if (!chat) {
    return res.status(404).send({ message: "Chat dosen't exists" });
  }

  return res.send(chat);
});

module.exports.getBusinessChats = errorMiddleware(async (req, res) => {
  let { businessId } = req.params;

  const business = await Business.findOne({ businessId: businessId });
  if (!business) {
    return res.status(400).send({ message: "Business dosen't exists" });
  }

  let chats = await Chat.find({ businessId: businessId }).sort({
    created_date: -1,
  });

  return res.send(chats);
});

module.exports.getUserChatMessages = errorMiddleware(async (req, res) => {
  let { email } = req.params;
  let { businessId } = req.query;
  let messages;

  if (!email) {
    return res.status(404).send({ message: "Email not provided" });
  }

  if (businessId) {
    messages = await Chat.find({ email: email }).select("messages");
  } else {
    messages = await Chat.find({ email, businessId }).select("messages");
  }
  return res.send({
    message: "Conversation messages fetched successfully",
    data: messages,
  });
});

// module.exports.acknowledgeChat = errorMiddleware(async (req, res) => {});
