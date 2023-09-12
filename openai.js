import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  organization: "org-bjGzRkQpFWMSJvHPWiOTp4Iz",
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
// const response = await openai.listEngines();gpt-3.5-turbo-16k
// const response = await openai.createFile(
//     fs.createReadStream("mydata.jsonl"),
//     "fine-tune"
// );

let data = {
  Gold1: {
    Price: "5,000",
    Image: "https://guardian.ng/wp-content/uploads/2022/11/Gold-bars.png",
    Availability: "In-stock",
  },
  Gold2: {
    Price: "10,000",
    Image: "https://wigmoretrading.com/wp-content/uploads/2021/11/Gold.jpg",
    Availability: "Out-of-stock",
  },
  Gold3: {
    Price: "7,000",
    Image: "https://wigmoretrading.com/wp-content/uploads/2021/11/Gold.jpg",
    Availability: "In-stock",
  },
};

const completion = await openai.createChatCompletion({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "system",
      content: `knowledge base to answer from: ${JSON.stringify(data)}.`,
    },
    { role: "user", content: "I need available stocks" },
  ],
});

console.log(completion.data.choices[0].message);
