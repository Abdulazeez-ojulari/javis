const { OpenAIApi, Configuration } = require("openai");
const Gmail = require("../integration/gmailModel");

const configuration = new Configuration({
    organization: "org-oRjT38IDR8URxu112r663l81",
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);