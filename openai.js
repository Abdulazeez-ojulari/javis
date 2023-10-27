const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

exports.javis = async (messages, tokens) => {
  let data = {
    model: "gpt-4",
    messages: messages,
    max_tokens: tokens,
    temperature: 0.6,
    frequency_penalty: 1.29,
    presence_penalty: 1.02,
  };

  // if (ticketId) data["user"] = ticketId;

  const completion = await openai.chat.completions.create(data);
  // console.log(completion)
  return completion;
};

exports.javisEmbeddings = async (message) => {
  const completion = await openai.embeddings.create({
    input: message,
    model: "text-embedding-ada-002",
  });

  return completion.data;
};