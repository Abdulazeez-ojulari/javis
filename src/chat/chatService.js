const { OpenAIApi, Configuration } = require("openai");
const { Chat } = require("./chatModel");
const uuid = require('uuid');

const configuration = new Configuration({
    organization: "org-oRjT38IDR8URxu112r663l81",
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports.replyChatService = async (promptMsg, messages, chatId, chat) => {
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
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature:0.4,
            frequency_penalty:0.3,
            presence_penalty:0.7,
            user: chatId,
        });
        // console.log(completion)
        return completion
    }catch(e){
        console.log(e)
        return e
    }
}

module.exports.createChatService = async(businessId, email, channel, customer) => {
    // let knowledgeBase = await KnowledgeBase.findOne({businessId: businessId})
    let id = uuid.v4() + uuid.v4()
    // console.log(channel, businessId, customer);
    let newChat = new Chat({
        chatId: id,
        email: email,
        businessId: businessId,
        customer: customer,
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