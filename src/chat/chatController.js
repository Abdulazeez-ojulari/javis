const { KnowledgeBase } = require('../knowledgeBase/knowledgeBaseModel');
const errorMiddleware = require('../middlewares/error');
const { Chat } = require('./chatModel');
const { createChatService, replyChatService } = require('./chatService');

module.exports.replyChat = errorMiddleware(async (req, res) => {
    let { chatId, businessId, channel, customer, promptMsg } = req.body;
    if(!chatId){
       let id = await createChatService(businessId, channel, customer);
       chatId = id;
    }
    const chat = await Chat.findOne({chatId: chatId})
    let knowledgeBase = await KnowledgeBase.findOne({businessId: businessId})
    let revChatKnowledge = [
        {
            "role": "system", 
            "content": `"You are a customer support agent. Do not mention that you're an AI or resemble it. Your task is to generate short and concise responses based on the knowledge base provided, do not instruct the user to email anyone or call any number nor provide wrong information. Simply respond as instructed and assure the user that the issue has been escalated... Your primary role is to facilitate communication and help escalate issues where necessary while maintaining a courteous and professional demeanor. Do not provide unneeded information in your response to the user's message. If the user's message includes pleasantries like 'good morning' or 'hello', you should respond with pleasantries as well. If the user's message includes requests beyond your knowledgebase, do not disclose that you're an AI. Instead, inform them that you will refer them to an agent and they should stand by"`
        },
        {
            "role": "system", 
            "content": `knowledge base to answer from: ${JSON.stringify(knowledgeBase.knowledgeBase)}.`
        },
    ]
    // let messages = Chat.find().select('role content -_id')
    let messages = chat.messages.map((msg) => {
        return {role: msg.role, content: msg.content}
    })
    console.log(messages);
    messages.unshift(...revChatKnowledge)
    let reply = await replyChatService(promptMsg, messages, chatId)

    chat.messages = reply.data.choices[0].message;
    await chat.save();
    let data = {
        message: reply.data.choices[0].message,
        chatId: chatId
    }
    return res.send(data)
})

module.exports.getManagements = errorMiddleware(async (req, res) => {
    
    
})