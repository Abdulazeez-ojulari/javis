const { Business } = require('../business/businessModel');
const { KnowledgeBase } = require('../knowledgeBase/knowledgeBaseModel');
const errorMiddleware = require('../middlewares/error');
const { Chat } = require('./chatModel');
const { createChatService, replyChatService } = require('./chatService');

module.exports.replyChat = errorMiddleware(async (req, res) => {
    let { chatId, businessId, channel, customer, promptMsg } = req.body;
    let chat = await Chat.findOne({chatId: chatId})
    if(!chat){
       let id = await createChatService(businessId, channel, customer);
       chatId = id;
    }
    let delimiter = '#####'

    chat = await Chat.findOne({chatId: chatId})
    let knowledgeBase = await KnowledgeBase.findOne({businessId: businessId})
    let systemKnowledge = [
        {
            "role": "system", 
            "content": `
            You will be provided with customer service queries.
            The customer service query will be delimited with ${delimiter} characters.
            Always classify each query into a category.
            Always classify each query into a sentiment.
            Always classify each query into a type.
            Always classify each query into a department.
            Always classify each query into an escalation_department if escalated is set to true else set escalation_department to null
            Set escalated to true if customer query is not related to your knowledge base else set escalated to false.
            Make sure you don't add any other key aside this keys response, category, sentiment, type, department, escalated and escalation_department in your json response.

            Categories: General Inquiries, Order, Issue, Complains.
            Sentiment: Happy, Neutral, Angry.
            Type: Bugs, Features, Refunds,Payment, Fruad, Inquiry, Feedback, Request, Order.
            Department: Sales, Product, Finance, Operatons, Legal, Logistics, Collection.
            Escalation Department: Sales, Product, Finance, Operatons, Legal, Logistics, Collection.
            `
        },
        {
            "role": "system", 
            "content": `Company faqs to answer related questions: ${JSON.stringify(knowledgeBase.faqs)}.`
        },
        {
            "role": "system", 
            "content": `
            Knowledge base to answer from: ${JSON.stringify(knowledgeBase.knowledgeBase)}.
            Only answer from your knowledge base.
            If customer service query is regarding a product in your knowledge base you must include the image of that product from your knowledge base in your response key.
            If customer service query is not related to your knowledge base then inform the customer that you will escalate their query then set escalated key to true and classify the escalation_department key in your json response.
            Use the response key to return all the content of your response of the customer query including content from your knowledge base.
            `
        }
    ]

    let reply = await replyChatService(promptMsg, systemKnowledge, chatId, chat)
    console.log(reply.data.choices[0].message)

    let content = reply.data.choices[0].message.content;
    let msg = reply.data.choices[0].message.content;
    let category = ""
    let type = ""
    let department = ""
    let sentiment = ""
    let escalation_department = ""
    if(content.charAt(0) == '{'){
        if(content.charAt(content.length - 1) !== '}')
        content.push('}')
        let jsonResponse = JSON.parse(content);
        msg = jsonResponse.response
        category = jsonResponse.category
        type = jsonResponse.type
        department = jsonResponse.department
        sentiment = jsonResponse.sentiment
        escalated = jsonResponse.escalated

        if(category && category.length > 0)
        chat.category = category;
        if(type && type.length > 0)
        chat.type = type;
        if(department && department.length > 0)
        chat.department = department;
        if(sentiment && sentiment.length > 0)
        chat.sentiment = sentiment;
        if(escalation_department && escalation_department.length > 0)
        chat.escalation_department = escalation_department;

        chat.escalated = escalated;
    }

    let newMessages = chat.messages;
    newMessages.push({role: "user", content: promptMsg})
    newMessages.push({role: "assistance", content: msg})
    chat.messages = newMessages;

    await chat.save();
    let data = {
        message: {role: "assistance", content: msg},
        chatId: chatId
    }
    return res.send(data)
})

module.exports.getChat = errorMiddleware(async (req, res) => {
    let { chatId } = req.params;
    let chat = await Chat.findOne({chatId: chatId})
    if(!chat){
        return res.status(404).send({message: "Chat dosen't exists"});
    }

    return res.send(chat)
})

module.exports.getChats = errorMiddleware(async (req, res) => {
    let { businessId } = req.params;

    const business = await Business.findOne({businessId: businessId})
    if(!business){
        return res.status(400).send({message: "Business dosen't exists"});
    }

    let chats = await Chat.find({businessId: businessId})

    return res.send(chats)
})