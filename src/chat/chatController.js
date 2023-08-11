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
            "content": `knowledge base to answer from and always send image link when showing or sending details of products to user: ${JSON.stringify(knowledgeBase.knowledgeBase)}.`
        },
        {
            "role": "system", 
            "content": `"Always send image link attached to knowledge base"`
        },
    ]
    // let messages = Chat.find().select('role content -_id')
    let messages = chat.messages.map((msg) => {
        return {role: msg.role, content: msg.content}
    })
    console.log(messages);
    messages.unshift(...revChatKnowledge)
    let reply = await replyChatService(promptMsg, messages, chatId)

    chat.messages.push(reply.data.choices[0].message);
    await chat.save();
    let data = {
        message: reply.data.choices[0].message,
        chatId: chatId
    }
    return res.send(data)
})

module.exports.getManagements = errorMiddleware(async (req, res) => {
    
    
})