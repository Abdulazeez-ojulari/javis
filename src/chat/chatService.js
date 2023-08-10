const { OpenAIApi, Configuration } = require("openai");
const { Chat } = require("./chatModel");
const uuid = require('uuid');

const configuration = new Configuration({
    organization: "org-oRjT38IDR8URxu112r663l81",
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports.replyChatService = async (promptMsg, messages, chatId) => {
    let newMsg = {
        "role": "user",
        "content": promptMsg
    }
    messages.push(newMsg);
    console.log(messages);
    
    try{
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens:250, 
            temperature:0.4,
            frequency_penalty:0.3,
            presence_penalty:0.7,
        });
        // console.log(completion)
        return completion
    }catch(e){
        // console.log(e)
        return e
    }
}

module.exports.createChatService = async(businessId, channel, customer) => {
    // let knowledgeBase = await KnowledgeBase.findOne({businessId: businessId})
    let id = uuid.v4() + uuid.v4()
    console.log(channel, businessId, customer);
    let newChat = new Chat({
        chatId: id,
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