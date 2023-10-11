const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is also the default, can be omitted
});

module.exports.processMl = async (
  promptMail,
  res,
  faqs,
  departments,
  business,
  previousMails
) => {
  // console.log(promptMail)
  let embeddingCompletion = await javisEmbeddings(promptMail);
  let embedding = embeddingCompletion.data[0].embedding;
  let similarity_array = [];
  // let embeddings = []
  let df = "";
  df;

  for (let i = 0; i < faqs.length; i++) {
    let faqEmbedding = faqs[i]["embeddings"];
    similarity_array.push(calculate_similarity(faqEmbedding, embedding));
  }

  let index = indexOfMax(similarity_array);

  let delimiter = "#####";
  let delimiter2 = "####";
  let delimiter3 = "*****";

  let systemKnowledge = [
    {
      role: "system",
      content: `
          You are a sales representative and a customer support agent for a company called ${business.businessName}.
          Do not mention or act like an AI to the customer.
          You will be provided with customer service queries.
          The customer service query will be delimited with ${delimiter} characters.
          Your previous messages with customer will be delimited with ${delimiter2} characters.
          Always use only the information delimited with ${delimiter3} to respond to user query. 
          If request is not in the inventory, faqs and company informations that was sent with the query you are to return a json format with escalated set to true and escalation_department to the appropriate department.
          If the user's message includes pleasantries like 'good morning' or 'hello', you should respond with pleasantries as well.
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
          Department: ${departments}.
          Escalation Department: ${departments}.
          `,
    },
    {
      role: "system",
      content: `Company faqs to answer related questions: ${delimiter3}${JSON.stringify(
        {
          question: faqs[index].question,
          response: faqs[index].response,
        }
      )}${delimiter3}.
        `,
    },
    {
      role: "system",
      content: `Previous messages between you and the customer${delimiter2}${JSON.stringify(
        previousMails
      )}${delimiter2}`,
    },
    {
      role: "user",
      content: `${delimiter}${promptMail}${delimiter}`,
    },
  ];

  // console.log(systemKnowledge)
  let system_prompt = `
      You are an AI assistant. You work for Credpal. You will be asked questions from a
      customer and will answer in a helpful and friendly manner.
      
      You will be provided company information from credpal under the
      [Article] section. The customer question will be provided under the
      [Question] section. You will answer the customers questions based on the
      article. Only provide the answer to the query don't respond with completed part of question.
      Answer in points and not in long paragraphs
      
      If the users question is not answered by the article you will respond with
      'I'm sorry I don't know.'
      `;

  let question_prompt = `
      [Article]
      ${faqs[index].response}
      
      [Question]
      ${promptMail}
    `;

  let knowledge = [
    {
      role: "system",
      content: system_prompt,
    },
    {
      role: "user",
      content: question_prompt,
    },
  ];

  let completion = await javis(systemKnowledge);
  // console.log(completion.data.choices[0])
  res.send(completion.data.choices[0].message);
};

const javisEmbeddings = async (message) => {
  const completion = await openai.embeddings.create({
    input: message,
    model: "text-embedding-ada-002",
  });

  return completion.data;
};

function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1; // Handle empty array
  }

  let maxIndex = 0;
  let maxValue = arr[0];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > maxValue) {
      maxIndex = i;
      maxValue = arr[i];
    }
  }

  return maxIndex;
}

const calculate_similarity = (vec1, vec2) => {
  console.log("vec1", vec1);
  let dot_product = dotProduct(vec1, vec2);
  let magnitude1 = calculateMagnitude(vec1);
  let magnitude2 = calculateMagnitude(vec2);
  return dot_product / (magnitude1 * magnitude2);
};

function dotProduct(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error("Vectors must have the same length");
  }

  let result = 0;
  for (let i = 0; i < vec1.length; i++) {
    result += vec1[i] * vec2[i];
  }

  return result;
}

function calculateMagnitude(vec) {
  let sumOfSquares = 0;
  for (let i = 0; i < vec.length; i++) {
    sumOfSquares += Math.pow(vec[i], 2);
  }

  const magnitude = Math.sqrt(sumOfSquares);
  return magnitude;
}
