const { OpenAIApi, Configuration } = require("openai");
const { Chat } = require("./chatModel");
const uuid = require('uuid');
const { Business } = require("../business/businessModel");
const { KnowledgeBase } = require("../knowledgeBase/knowledgeBaseModel");
const { Order } = require("../order/orderModel");

const configuration = new Configuration({
    organization: "org-oRjT38IDR8URxu112r663l81",
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports.processChatService = async (chatId, email, businessId, channel, customer, promptMsg) => {
    let chat = await Chat.findOne({chatId: chatId})
    if(!chat){
       let id = await createChatService(businessId, email, channel, customer);
       chatId = id;
    }
    let delimiter = '#####'
    let delimiter2 = '####'
    let delimiter3 = '*****'

    chat = await Chat.findOne({chatId: chatId})

    let business = await Business.findOne({businessId: businessId})

    if(!business){
        return {message: "Business dosen't exists"};
    }

    let knowledgeBase = await KnowledgeBase.findOne({businessId: businessId})

    let knowledge_base = []
    let faqs = []

    if(knowledgeBase){
        knowledge_base = knowledgeBase.knowledgeBase
        faqs = knowledgeBase.faqs
    }

    let systemKnowledge = [
        {
            "role": "system", 
            "content": `
            You are a sales representative.
            Do not mention or act like an AI to the customer.
            You will be provided with customer service queries.
            The customer service query will be delimited with ${delimiter} characters.
            Your previous messages with customer will be delimited with ${delimiter2} characters.
            Always use only the information delimited with ${delimiter3} to respond to user query. 
            If request is not in the inventory, faqs and company informations that was sent with the query you are to return a json format with escalated set to true and escalation_department to the appropriate department.
            Always classify each query into a category.
            Always classify each query and your previous chat with customer into a sentiment.
            Always classify each query into a type.
            Generate a title based on customer previous chat with you and customer new query.
            Always classify each query and your previous chat with customer into a escalated.
            Always classify each query and your previous chat with customer into a department.
            If customer is about to place order set placingOrder to true.
            Determine if user has completed their chat using their current query and set isCompleted to true.
            Set escalated to true if customer query is not related to your inventory else set escalated to false.
            Always classify each query and your previous chat with customer into an escalation_department if escalated is set to true else set escalation_department to null
            Make sure you don't add any other key aside this keys response, category, sentiment, type, department, escalated, escalation_department, placingOrder, isCompleted and title in your json response.
            Always return product details in the response key when you want to display a product to the user from the inventory in text format.

            Categories: General Inquiries, Order, Issue, Complains.
            Sentiment: Happy, Neutral, Angry.
            Type: Bugs, Features, Refunds,Payment, Fruad, Inquiry, Feedback, Request, Order.
            Department: ${business.departments}.
            Escalation Department: ${business.departments}.
            `
        },
        {
            "role": "system", 
            "content": `Company Informations: ${delimiter3}${JSON.stringify(business.companyInformation)}${delimiter3}.`
        },
        {
            "role": "system", 
            "content": `Company faqs to answer related questions: ${delimiter3}${JSON.stringify(faqs)}${delimiter3}.`
        },
        {
            "role": "system", 
            "content": `
            Inventory to answer from: ${JSON.stringify(knowledge_base)}.
            If customer service query is regarding a product in your inventory you must include the image of that product from your inventory in your response key in text format.
            If customer service query is not related to your inventory then inform the customer that you will escalate their query then set escalated key to true and classify the escalation_department key in your json response.
            Use the response key to return all the content of your response of the customer query including content from your inventory.
            `
        }
    ]

    if(!business.aiMode || business.aiMode == 'auto'){
        let reply = await autoReply(promptMsg, systemKnowledge, chatId, chat, businessId, email, customer)

        return reply;
    }else if(business.aiMode == 'supervised'){
       let reply = await supervisedReply(promptMsg, systemKnowledge, chatId, chat, businessId, email, customer)

       return reply;
    }
}

const autoReply = async (promptMsg, systemKnowledge, chatId, chat, businessId, email, customer) => {

    let reply = await replyChatService(promptMsg, systemKnowledge, chatId, chat)
    console.log(reply.data.choices[0].message)

    let content = reply.data.choices[0].message.content;
    let msg = reply.data.choices[0].message.content;
    let category = ""
    let type = ""
    let department = ""
    let sentiment = ""
    let escalation_department = ""
    let title = ""
    let isCompleted
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
        escalation_department = jsonResponse.escalation_department
        title = jsonResponse.title
        isCompleted = jsonResponse.isCompleted

        if(!jsonResponse.response && jsonResponse.placingOrder){
            msg = 'Created your order'
        }

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
        if(title && title.length > 0){
            let newTitles = chat.titles;
            newTitles.push(title)
            chat.titles = newTitles
        }
        if(jsonResponse.escalated !== undefined)
        chat.escalated = escalated;

        if(jsonResponse.isCompleted)
        chat.isCompleted = isCompleted;

        if(jsonResponse.placingOrder && jsonResponse.items){
            chat.escalated = escalated;
            let newOrder = new Order({
                chatId: chatId,
                email: email,
                businessId: businessId,
                customer: customer,
                items: jsonResponse.items
            });

            await newOrder.save()
        }
    }

    let newMessages = chat.messages;
    newMessages.push({role: "user", content: promptMsg})
    newMessages.push({role: "assistance", content: msg})
    chat.messages = newMessages;

    if(chat.titles.length > 0){
        let overall = await metricsService(chat.titles)
        console.log(overall.data.choices[0].message)

        let overallMetrics = overall.data.choices[0].message.content;

        let title = ""
        let common_title = ""
        if(overallMetrics.charAt(0) == '{'){
            if(overallMetrics.charAt(overallMetrics.length - 1) !== '}')
            overallMetrics.push('}')
            let jsonResponse = JSON.parse(overallMetrics);
            title = jsonResponse.title
            common_title = jsonResponse.common_title

            if(title && title.length > 0)
            chat.title = title;

            if(common_title && common_title.length > 0)
            chat.title = common_title;

        }
    }

    await chat.save();
    let data = {
        replyMode: "auto",
        message: newMessages[newMessages.length-2],
        chatId: chatId,
        reply: newMessages[newMessages.length-1]
    }

    return data
}

const supervisedReply = async (promptMsg, systemKnowledge, chatId, chat, businessId, email, customer) => {
    let reply = await replyChatService(promptMsg, systemKnowledge, chatId, chat)
    console.log(reply.data.choices[0].message)

    let content = reply.data.choices[0].message.content;
    let msg = reply.data.choices[0].message.content;
    let category = ""
    let type = ""
    let department = ""
    let sentiment = ""
    let escalation_department = ""
    let title = ""
    let isCompleted
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
        escalation_department = jsonResponse.escalation_department
        title = jsonResponse.title
        isCompleted = jsonResponse.isCompleted

        if(!jsonResponse.response && jsonResponse.placingOrder){
            msg = 'Created your order'
        }

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
        if(title && title.length > 0){
            let newTitles = chat.titles;
            newTitles.push(title)
            chat.titles = newTitles
        }
        if(jsonResponse.escalated !== undefined)
        chat.escalated = escalated;

        if(jsonResponse.isCompleted)
        chat.isCompleted = isCompleted;

        if(jsonResponse.placingOrder && jsonResponse.items){
            chat.escalated = escalated;
            let newOrder = new Order({
                chatId: chatId,
                email: email,
                businessId: businessId,
                customer: customer,
                items: jsonResponse.items
            });

            await newOrder.save()
        }
    }

    let newMessages = chat.messages;
    newMessages.push({role: "user", content: promptMsg})
    newMessages.push({role: "assistance", content: msg, status: "draft"})
    chat.messages = newMessages;

    if(chat.titles.length > 0){
        let overall = await metricsService(chat.titles)
        console.log(overall.data.choices[0].message)

        let overallMetrics = overall.data.choices[0].message.content;

        let title = ""
        let common_title = ""
        if(overallMetrics.charAt(0) == '{'){
            if(overallMetrics.charAt(overallMetrics.length - 1) !== '}')
            overallMetrics.push('}')
            let jsonResponse = JSON.parse(overallMetrics);
            title = jsonResponse.title
            common_title = jsonResponse.common_title

            if(title && title.length > 0)
            chat.title = title;

            if(common_title && common_title.length > 0)
            chat.title = common_title;

        }
    }

    await chat.save();
    let data = {
        replyMode: "supervised",
        message: newMessages[newMessages.length-2],
        chatId: chatId
    }

    return data
}

const replyChatService = async (promptMsg, messages, chatId, chat) => {
    let previousMsg = chat.messages.map(msg => {
        return {role: msg.role, content: msg.content}
    })
    // console.log(previousMsg)
    let delimiter = '#####'
    let delimiter2 = '####'
    previousMsg = {
        "role": "system",
        "content": `Previous messages between you and the customer${delimiter2}${JSON.stringify(previousMsg)}${delimiter2}`
    }
    // console.log(previousMsg)
    let newMsg = {
        "role": "user",
        "content": `${delimiter}${promptMsg}${delimiter}`
    }
    messages.push(previousMsg)
    messages.push(newMsg);
    
    try{
        let completion = await javis(messages, chatId)
        return completion;
    }catch(e){
        console.log(e)
        return e
    }
}

const javis = async (messages, chatId = null) => {
    let data = {
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature:0.4,
        frequency_penalty:0.3,
        presence_penalty:0.7,
    }

    if(chatId)
    data['user'] = chatId

    const completion = await openai.createChatCompletion(data);
    // console.log(completion)
    return completion
}

const createChatService = async(businessId, email, channel, customer, phoneNo) => {
    // let knowledgeBase = await KnowledgeBase.findOne({businessId: businessId})
    let id = uuid.v4() + uuid.v4()
    // console.log(channel, businessId, customer);
    let newChat = new Chat({
        chatId: id,
        email: email,
        businessId: businessId,
        customer: customer,
        phoneNo: phoneNo,
        messages: [],
        channel: channel
    });
    try{
        await newChat.save();
    }catch(e){
        console.log(e);
        return e;
    }
    return id;
}

module.exports.createChatService = createChatService

const metricsService = async (titles) => {
    let delimiter = '#####'
    let messages = [
        {
            "role": "system", 
            "content": `
            You are an analyst.
            You will be provided with a list of titles.
            The titles will be delimited with ${delimiter} characters.
            Determine the common title from the list of titles. 
            Make sure you don't add any other key aside this key title in your json response.

            Titles: ${delimiter}${JSON.stringify(titles)}${delimiter}.
            `
        }
    ]
    
    try{
        let completion = await javis(messages)
        return completion;
    }catch(e){
        console.log(e)
        return e
    }
}