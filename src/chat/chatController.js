const { Business } = require("../business/businessModel");
const errorMiddleware = require("../middlewares/error");
const { Chat } = require("./chatModel");
const { createChatService, processChatService } = require("./chatService");
const eventEmitter = require("../event/events");
const { Ticket } = require("../models/ticket.model");
const { ChatMessage } = require("../models/chat-message.model");

module.exports.newChat = errorMiddleware(async (req, res) => {
  let { email, businessId, channel, customer, phoneNo } = req.body;

  const business = await Business.findOne({ businessId: businessId }).exec();
  if (!business) {
    return res.status(400).send({ message: "Business doesn't exists" });
  }

  let ticket = await createChatService(
    businessId,
    email,
    channel,
    customer,
    phoneNo
  );


  eventEmitter.emit("notifyNewChat", {
    businessId,
    customer,
    email,
    channel,
    phoneNo,
  });

  return res.send(ticket);
});

module.exports.sendChat = errorMiddleware(async (req, res) => {
  let { ticketId, email, businessId, channel, customer, promptMsg } = req.body;
  let data = await processChatService(
    ticketId,
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
    ticketId,
  });

  return res.send(data);
});

module.exports.replyChat = errorMiddleware(async (req, res) => {
  let { ticketId, businessId, channel, customer, reply, messageId } = req.body;

  const business = await Business.findOne({ businessId: businessId });
  if (!business) {
    return res.status(400).send({ message: "Business doesn't exists" });
  }

  // let chat = await Chat.findOne({ chatId: chatId });
  // console.log(chat)
  // let ticket = await Ticket.findOne({ ticketId });

  if (messageId) {
    // let messages = chat.messages;
    const message = await ChatMessage.findOne({
      id: messageId,
      ticketId,
      // role: "assistance",
    });
    message.content = reply;
    message.status = "sent";
    await message.save();
    let data = {
      // replyMode: "auto",
      ticketId,
      reply: message,
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

// module.exports.getUserChat = errorMiddleware(async (req, res) => {
//   let { email } = req.params;
//   let { businessId } = req.query;
//   let chats;

//   if (!email) {
//     return res.status(404).send({ message: "Email not provided" });
//   }

//   if (!businessId) {
//     chats = await Chat.find({ email: email }).select("-messages");
//   } else {
//     chats = await Chat.find({ email, businessId }).select("-messages");
//   }
//   return res.send(chats);
// });

module.exports.getUserChat = errorMiddleware(async (req, res) => {
  let { email } = req.params;
  let { businessId } = req.query;
  let chats = {};

  if (!email) {
    return res.status(404).send({ message: "Email not provided" });
  }

  const userTickets = await Ticket.find({ email }).populate('message').exec();

  if (!userTickets) {
    return res.status(404).send({ message: "Chat record not found" });
  }

  if (!businessId) {
    // chats = await Chat.find({ email: email }).select("-messages");
    chats["ticket"] = await Ticket.find({ email, channel: "chat" }).populate('message').exec();
    // chats["chats"] = await ChatMessage.find({ email }).limit(2);

    // chats = await Chat.aggregate([
    //   {
    //     $match: {
    //       email,
    //     },
    //   },
    //   {
    //     $project: {
    //       businessId: 1,
    //       email: 1,
    //       messages: { $slice: ["$messages", -2] },
    //       customer: 1,
    //       phoneNo: 1,
    //       messages: 1,
    //       escalated: 1,
    //       sentiment: 1,
    //       channel: 1,
    //       category: 1,
    //       type: 1,
    //       department: 1,
    //       escalation_department: 1,
    //       titles: 1,
    //       title: 1,
    //       isCompleted: 1,
    //       created_date: 1,
    //       update_date: 1,
    //     },
    //   },
    // ]);
  } else {
    // chats = await Chat.aggregate([
    //   {
    //     $match: {
    //       businessId,
    //       email,
    //     },
    //   },
    //   {
    //     $project: {
    //       businessId: 1,
    //       email: 1,
    //       messages: { $slice: ["$messages", -2] },
    //       customer: 1,
    //       phoneNo: 1,
    //       messages: 1,
    //       escalated: 1,
    //       sentiment: 1,
    //       channel: 1,
    //       category: 1,
    //       type: 1,
    //       department: 1,
    //       escalation_department: 1,
    //       titles: 1,
    //       title: 1,
    //       isCompleted: 1,
    //       created_date: 1,
    //       update_date: 1,
    //     },
    //   },
    // ]);

    chats["ticket"] = await Ticket.find({
      email,
      businessId,
      channel: "chat",
    }).populate('message').exec();
    // chats["chats"] = await ChatMessage.find({ email }).limit(2);
  }
  return res.send(chats);
});

module.exports.getConversation = errorMiddleware(async (req, res) => {
  let { ticketId } = req.params;

  const ticket = await Ticket.findById(ticketId).populate('message').exec();
  console.log(ticket);

  if (!ticket) {
    return res.status(404).send({ message: "Chat doesn't exists" });
  }

  // const chatMessages = await ChatMessage.findOne({ ticketId });

  const chat = { ticket };

  return res.send(chat);
});

module.exports.getBusinessChats = errorMiddleware(async (req, res) => {
  let { businessId } = req.params;

  const business = await Business.findOne({ businessId: businessId }).exec();
  if (!business) {
    return res.status(400).send({ message: "Business doesn't exists" });
  }

  const tickets = await Ticket.find({ businessId }).sort({ created_date: -1 }).populate('message').exec();

  return res.send(tickets);
});

module.exports.getUserChatMessages = errorMiddleware(async (req, res) => {
  let { ticketId } = req.params;

  let message;

  // message = await Chat.findOne({ chatId }).select("messages");
  message = await ChatMessage.find({ ticketId }).exec();

  if (!message) {
    return res.send({ message: "Chat not found", data: message });
  }

  return res.send({
    message: "Chat messages fetched successfully",
    data: message,
  });
});

// module.exports.acknowledgeChat = errorMiddleware(async (req, res) => {});
