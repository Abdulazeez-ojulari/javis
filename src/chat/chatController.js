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
            You must always respond to user query.
            Make sure you don't add any other key aside this keys response, category, sentiment, type, department to your json response.
            Use the response key to return all the content of your response of the customer query with product informations.
            If customer query is regarding a product you must include the image of that product from you knowledge base in your response.

            Categories: General Inquiries, Order, Issue, Complains.
            Sentiment: Happy, Neutral, Angry.
            Type: Bugs, Features, Refunds,Payment, Fruad, Inquiry, Feedback, Request, Order.
            Department: Sales, Product, Finance, Operatons, Legal, Logistics, Collection.
            `
        },
        {
            "role": "system", 
            "content": `Company faqs to answer related questions: ${JSON.stringify(knowledgeBase.faqs)}.`
        },
        {
            "role": "system", 
            "content": `Knowledge base to answer from and always send image link when showing or sending details of products to user: ${JSON.stringify(knowledgeBase.knowledgeBase)}.`
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
    if(content.charAt(0) == '{'){
        let jsonResponse = JSON.parse(content);
        msg = jsonResponse.response
        category = jsonResponse.category
        type = jsonResponse.type
        department = jsonResponse.department
        sentiment = jsonResponse.sentiment

        if(category && category.length > 0)
        chat.category = category;
        if(type && type.length > 0)
        chat.type = type;
        if(department && department.length > 0)
        chat.department = department;
        if(sentiment && sentiment.length > 0)
        chat.sentiment = sentiment;
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