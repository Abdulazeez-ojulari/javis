const { Business } = require('../business/businessModel');
const errorMiddleware = require('../middlewares/error');
const { Chat } = require('./chatModel');
const { createChatService, processChatService } = require('./chatService');

module.exports.newChat = errorMiddleware(async (req, res) => {
    let { email, businessId, channel, customer } = req.body;

    let id = await createChatService(businessId, email, channel, customer);

    let chat = await Chat.findOne({chatId: id})

    return res.send(chat)
})

module.exports.replyChat = errorMiddleware(async (req, res) => {
    let { chatId, email, businessId, channel, customer, promptMsg } = req.body;
    let data = await processChatService(chatId, email, businessId, channel, customer, promptMsg);

    return res.send(data)
})

module.exports.getUserChat = errorMiddleware(async (req, res) => {
    let { email } = req.params;

    if(!email){
        return res.status(404).send({message: "Email not provided"});
    }

    let chats = await Chat.find({email: email})
    return res.send(chats)
})

module.exports.getConversation = errorMiddleware(async (req, res) => {
    let { chatId } = req.params;

    let chat = await Chat.findOne({chatId: chatId})
    if(!chat){
        return res.status(404).send({message: "Chat dosen't exists"});
    }

    return res.send(chat)    
})

module.exports.getBusinessChats = errorMiddleware(async (req, res) => {
    let { businessId } = req.params;

    const business = await Business.findOne({businessId: businessId})
    if(!business){
        return res.status(400).send({message: "Business dosen't exists"});
    }

    let chats = await Chat.find({businessId: businessId})

    return res.send(chats)
})