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
  let completion
  try {
    completion = "swegw"
    completion = await openai.chat.completions.create(data);
    completion = {
      status: "success",
      code: 200,
      data: await openai.chat.completions.create(data)
    }
  } catch (error) {
    if (error instanceof OpenAI.RateLimitError) {
      // Handle rate limit error here
      console.log(error.code)
      console.error("Rate limit exceeded:", error.message);
      completion = {
        status: "error",
        code: 429
      }
      // Additional handling if needed
    } else {
      // Handle other errors
      console.error("An unexpected error occurred:", error.message);
      completion = {
        status: "error",
        code: 400
      }
      // Additional handling if needed
    }
  }

  // const completion = await openai.chat.completions.create(data);
  console.log(completion)
  return completion;
};

exports.javisEmbeddings = async (message) => {
  let completion

  try {
    let comple = await openai.embeddings.create({
      input: message,
      model: "text-embedding-ada-002",
    });

    completion = comple.data
  } catch (error) {
    if (error instanceof OpenAI.RateLimitError) {
      console.log(error)
      // Handle rate limit error here
      console.error("Rate limit exceeded:", error.s.code);
      completion = {
        status: "error",
        code: 429
      }
      // Additional handling if needed
    } else {
      // Handle other errors
      console.error("An unexpected error occurred:", error.message);
      completion = {
        status: "error",
        code: 400
      }
      // Additional handling if needed
    }
  }

  return completion;
};