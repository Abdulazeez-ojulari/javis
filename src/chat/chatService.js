const { OpenAIApi, Configuration } = require("openai");
// const { Chat } = require("./chatModel");
// const { Ticket } = require("../models/ticket.model");
// const { ChatMessage } = require("../models/chat-message.model");
// const uuid = require("uuid");
// const { Business } = require("../business/businessModel");
// const { KnowledgeBase } = require("../knowledgeBase/knowledgeBaseModel");
// const { Order } = require("../order/orderModel");
// const { DetectedFAQ } = require("../models/detected-faq.model");
// const { Agent } = require("../business/agent.model");
// const { MongooseError } = require("mongoose");
// const error = require("../middlewares/error");
const fs = require('fs')
const parse = require('csv-parse').parse

const configuration = new Configuration({
  organization: "org-oRjT38IDR8URxu112r663l81",
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// module.exports.processChatService = async (
//   ticketId,
//   email,
//   businessId,
//   channel,
//   customer,
//   promptMsg
// ) => {
//   let ticket = await Ticket.findById(ticketId);
//   // console.log(ticketId, ticket);
//   if (!ticket) {
//     ticket = await createChatService(businessId, email, channel, customer);
//     ticketId = id;
//   }
//   let delimiter = "#####";
//   let delimiter2 = "####";
//   let delimiter3 = "*****";

//   // ticket = await Ticket.findById(ticketId ).exec();

//   let business = await Business.findOne({ businessId: businessId }).exec();

//   if (!business) {
//     return { message: "Business doesn't exists" };
//   }

//   let knowledgeBase = await KnowledgeBase.findOne({
//     businessId: businessId,
//   }).exec();

//   let knowledge_base = [];
//   let faqs = [];

//   if (knowledgeBase) {
//     knowledge_base = knowledgeBase.knowledgeBase;
//     faqs = knowledgeBase.faqs;
//   }

  // let systemKnowledge = [
  //   {
  //     role: "system",
  //     content: `
  //           You are a sales representative for a company called ${business.businessName}.
  //           Do not mention or act like an AI to the customer.
  //           You will be provided with customer service queries.
  //           The customer service query will be delimited with ${delimiter} characters.
  //           Your previous messages with customer will be delimited with ${delimiter2} characters.
  //           Always use only the information delimited with ${delimiter3} to respond to user query. 
  //           If request is not in the inventory, faqs and company informations that was sent with the query you are to return a json format with escalated set to true and escalation_department to the appropriate department.
  //           If the user's message includes pleasantries like 'good morning' or 'hello', you should respond with pleasantries as well.
  //           Always classify each query into a category.
  //           Always classify each query and your previous chat with customer into a sentiment.
  //           Always classify each query into a type.
  //           Generate a title based on customer previous chat with you and customer new query.
  //           Always classify each query and your previous chat with customer into a escalated.
  //           Always classify each query and your previous chat with customer into a department.
  //           If customer is about to place order set placingOrder to true.
  //           Determine if user has completed their chat using their current query and set isCompleted to true.
  //           Set escalated to true if customer query is not related to your inventory else set escalated to false.
  //           Always classify each query and your previous chat with customer into an escalation_department if escalated is set to true else set escalation_department to null
  //           Make sure you don't add any other key aside this keys response, category, sentiment, type, department, escalated, escalation_department, placingOrder, isCompleted and title in your json response.
  //           Always return product details in the response key when you want to display a product to the user from the inventory in text format.

  //           Categories: General Inquiries, Order, Issue, Complains.
  //           Sentiment: Happy, Neutral, Angry.
  //           Type: Bugs, Features, Refunds,Payment, Fruad, Inquiry, Feedback, Request, Order.
  //           Department: ${business.departments}.
  //           Escalation Department: ${business.departments}.
  //           `,
  //   },
  //   {
  //     role: "system",
  //     content: `Company faqs to answer related questions: ${delimiter3}${JSON.stringify(
  //       faqs
  //     )}${delimiter3}.
  //     `,
  //   },
  //   {
  //     role: "system",
  //     content: `
  //           Inventory to answer from: ${JSON.stringify(knowledge_base)}.
  //           If customer service query is regarding a product in your inventory you must include the image of that product from your inventory in your response key in text format.
  //           If customer service query is not related to your inventory then inform the customer that you will escalate their query then set escalated key to true and classify the escalation_department key in your json response.
  //           Use the response key to return all the content of your response of the customer query including content from your inventory.
  //           `,
  //   },
  // ];

//   if (!business.aiMode || business.aiMode == "auto") {
//     let reply = await autoReply(
//       promptMsg,
//       systemKnowledge,
//       ticketId,
//       ticket,
//       businessId,
//       email,
//       customer
//     );

//     return reply;
//   } else if (business.aiMode == "supervised") {
//     let reply = await supervisedReply(
//       promptMsg,
//       systemKnowledge,
//       ticketId,
//       ticket,
//       businessId,
//       email,
//       customer
//     );

//     return reply;
//   }
// };

// const autoReply = async (
//   promptMsg,
//   systemKnowledge,
//   ticketId,
//   ticket,
//   businessId,
//   email,
//   customer
// ) => {
//   let reply = await replyChatService(
//     promptMsg,
//     systemKnowledge,
//     ticketId,
//     ticket
//   );
//   console.log(reply.data.choices[0].message);

//   let content = reply.data.choices[0].message.content;
//   let msg = reply.data.choices[0].message.content;
//   let category = "";
//   let type = "";
//   let department = "";
//   let sentiment = "";
//   let escalation_department = "";
//   let title = "";
//   let isCompleted;
//   if (content.charAt(0) == "{") {
//     if (content.charAt(content.length - 1) !== "}") content.push("}");
//     let jsonResponse = JSON.parse(content);
//     msg = jsonResponse.response;
//     category = jsonResponse.category;
//     type = jsonResponse.type;
//     department = jsonResponse.department;
//     sentiment = jsonResponse.sentiment;
//     escalated = jsonResponse.escalated;
//     escalation_department = jsonResponse.escalation_department;
//     title = jsonResponse.title;
//     isCompleted = jsonResponse.isCompleted;

//     if (!jsonResponse.response && jsonResponse.placingOrder) {
//       msg = "Created your order";
//     }

//     if (category && category.length > 0) ticket.category = category;
//     if (type && type.length > 0) ticket.type = type;
//     if (department && department.length > 0) ticket.department = department;
//     if (sentiment && sentiment.length > 0) ticket.sentiment = sentiment;
//     if (escalation_department && escalation_department.length > 0)
//       ticket.escalation_department = escalation_department;
//     if (title && title.length > 0) {
//       let newTitles = ticket.titles;
//       newTitles.push(title);
//       ticket.titles = newTitles;
//     }
//     if (jsonResponse.escalated !== undefined) ticket.escalated = escalated;

//     if (jsonResponse.isCompleted) ticket.isCompleted = isCompleted;

//     if (jsonResponse.placingOrder && jsonResponse.items) {
//       ticket.escalated = escalated;
//       let newOrder = new Order({
//         ticketId: ticketId,
//         email: email,
//         businessId: businessId,
//         customer: customer,
//         items: jsonResponse.items,
//       });

//       await newOrder.save();
//     }
//   }

//   // let newMessages = chat.messages;
//   // newMessages.push({ role: "user", content: promptMsg });
//   // newMessages.push({ role: "assistance", content: msg });
//   // chat.messages = newMessages;

//   const customerReqMsg = new ChatMessage({
//     ticketId,
//     content: promptMsg,
//     role: "user",
//   });

//   await customerReqMsg.save();

//   // const assistantResMsg = new ChatMessage({
//   //   ticketId,
//   //   content: msg,
//   //   role: "assistance",
//   // });

//   const assistantResMsg = new ChatMessage({
//     ticketId,
//     content:
//       escalated == true && department
//         ? `Your request has been escalated to the ${department} department`
//         : escalated == true && !department
//         ? `Your request has been escalated to the proper department`
//         : msg,
//     role: "assistance",
//   });

//   await assistantResMsg.save();
//   if (escalated) {
//     const detectedFaqId = uuid.v4();
//     const detectedFaq = new DetectedFAQ({
//       faqId: detectedFaqId,
//       question: promptMsg,
//       response: "",
//       businessId,
//     });

//     await detectedFaq.save();
//   }

//   if (ticket.titles.length > 0) {
//     let overall = await metricsService(ticket.titles);
//     console.log(overall.data.choices[0].message);

//     let overallMetrics = overall.data.choices[0].message.content;

//     let title = "";
//     let common_title = "";
//     if (overallMetrics.charAt(0) == "{") {
//       if (overallMetrics.charAt(overallMetrics.length - 1) !== "}")
//         overallMetrics.push("}");
//       let jsonResponse = JSON.parse(overallMetrics);
//       title = jsonResponse.title;
//       common_title = jsonResponse.common_title;

//       if (title && title.length > 0) ticket.title = title;

//       if (common_title && common_title.length > 0) ticket.title = common_title;
//     }
//   }

//   await ticket.save();
//   let data = {
//     replyMode: "auto",
//     message: [customerReqMsg, assistantResMsg],
//     ticketId,
//     reply: assistantResMsg,
//   };

//   return data;
// };

// const supervisedReply = async (
//   promptMsg,
//   systemKnowledge,
//   ticketId,
//   ticket,
//   businessId,
//   email,
//   customer
// ) => {
//   let reply = await replyChatService(
//     promptMsg,
//     systemKnowledge,
//     ticketId,
//     ticket
//   );
//   console.log(reply.data.choices[0].message);

//   let content = reply.data.choices[0].message.content;
//   let msg = reply.data.choices[0].message.content;
//   let category = "";
//   let type = "";
//   let department = "";
//   let sentiment = "";
//   let escalation_department = "";
//   let title = "";
//   let isCompleted;
//   if (content.charAt(0) == "{") {
//     if (content.charAt(content.length - 1) !== "}") content.push("}");
//     let jsonResponse = JSON.parse(content);
//     msg = jsonResponse.response;
//     category = jsonResponse.category;
//     type = jsonResponse.type;
//     department = jsonResponse.department;
//     sentiment = jsonResponse.sentiment;
//     escalated = jsonResponse.escalated;
//     escalation_department = jsonResponse.escalation_department;
//     title = jsonResponse.title;
//     isCompleted = jsonResponse.isCompleted;

//     if (!jsonResponse.response && jsonResponse.placingOrder) {
//       msg = "Created your order";
//     }

//     if (category && category.length > 0) ticket.category = category;
//     if (type && type.length > 0) ticket.type = type;
//     if (department && department.length > 0) ticket.department = department;
//     if (sentiment && sentiment.length > 0) ticket.sentiment = sentiment;
//     if (escalation_department && escalation_department.length > 0)
//       ticket.escalation_department = escalation_department;
//     if (title && title.length > 0) {
//       let newTitles = ticket.titles;
//       newTitles.push(title);
//       ticket.titles = newTitles;
//     }
//     if (jsonResponse.escalated !== undefined) ticket.escalated = escalated;

//     if (jsonResponse.isCompleted) ticket.isCompleted = isCompleted;

//     if (jsonResponse.placingOrder && jsonResponse.items) {
//       ticket.escalated = escalated;
//       let newOrder = new Order({
//         ticketId: ticketId,
//         email: email,
//         businessId: businessId,
//         customer: customer,
//         items: jsonResponse.items,
//       });

//       await newOrder.save();
//     }
//   }

//   // let newMessages = chat.messages;
//   // newMessages.push({ role: "user", content: promptMsg });
//   // newMessages.push({ role: "assistance", content: msg, status: "draft" });
//   // chat.messages = newMessages;

//   const customerReqMsg = new ChatMessage({
//     ticketId,
//     content: promptMsg,
//     role: "user",
//   });

//   await customerReqMsg.save();

//   // const assistantResMsg = new ChatMessage({
//   //   ticketId,
//   //   content:
//   //     escalated == true
//   //       ? "Your request has been escalated to the proper department"
//   //       : msg,
//   //   role: "assistance",
//   //   status: "draft",
//   // });

//   const assistantResMsg = new ChatMessage({
//     ticketId,
//     content:
//       escalated == (true && department)
//         ? `Your request has been escalated to the ${department} department`
//         : escalated == true && !department
//         ? `Your request has been escalated to the proper department`
//         : msg,
//     role: "assistance",
//     status: "draft",
//   });

//   await assistantResMsg.save();

//   if (escalated) {
//     const detectedFaqId = uuid.v4();
//     const detectedFaq = new DetectedFAQ({
//       faqId: detectedFaqId,
//       question: promptMsg,
//       response: "",
//       businessId,
//     });

//     await detectedFaq.save();
//   }

//   if (ticket.titles.length > 0) {
//     let overall = await metricsService(ticket.titles);
//     console.log(overall.data.choices[0].message);

//     let overallMetrics = overall.data.choices[0].message.content;

//     let title = "";
//     let common_title = "";
//     if (overallMetrics.charAt(0) == "{") {
//       if (overallMetrics.charAt(overallMetrics.length - 1) !== "}")
//         overallMetrics.push("}");
//       let jsonResponse = JSON.parse(overallMetrics);
//       title = jsonResponse.title;
//       common_title = jsonResponse.common_title;

//       if (title && title.length > 0) ticket.title = title;

//       if (common_title && common_title.length > 0) ticket.title = common_title;
//     }
//   }

//   await ticket.save();
//   let data = {
//     replyMode: "supervised",
//     // message: newMessages[newMessages.length - 2],
//     message: [customerReqMsg, assistantResMsg],
//     ticketId: ticketId,
//   };

//   return data;
// };

// const replyChatService = async (promptMsg, messages, ticketId, ticket) => {
//   // let previousMsg = ticket.messages.map((msg) => {
//   //   return { role: msg.role, content: msg.content };
//   // });
//   // console.log(previousMsg)
//   let previousMsg = await ChatMessage.find({ ticketId });
//   previousMsg = previousMsg.map((msg) => ({
//     role: msg.role,
//     content: msg.content,
//   }));
//   let delimiter = "#####";
//   let delimiter2 = "####";
//   previousMsg = {
//     role: "system",
//     content: `Previous messages between you and the customer${delimiter2}${JSON.stringify(
//       previousMsg
//     )}${delimiter2}`,
//   };
//   // console.log(previousMsg)
//   let newMsg = {
//     role: "user",
//     content: `${delimiter}${promptMsg}${delimiter}`,
//   };
//   messages.push(previousMsg);
//   messages.push(newMsg);

//   try {
//     let completion = await javis(messages, ticketId);
//     return completion;
//   } catch (e) {
//     console.log(e);
//     return e;
//   }
// };

// const question = async (message) => {
//   let prompt = `
//   Determine if this is a question,return true or false, no explanations: "${message}". `;
//   return await javis(message, null);
// };

const javis = async (messages, ticketId = null) => {
  let data = {
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0.2,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  if (ticketId) data["user"] = ticketId;

  const completion = await openai.createChatCompletion(data);
  // console.log(completion)
  return completion;
};

// module.exports.question = question;

// const createChatService = async (
//   businessId,
//   email,
//   channel,
//   customer,
//   phoneNo
// ) => {
//   // let knowledgeBase = await KnowledgeBase.findOne({businessId: businessId})
//   // let id = uuid.v4() + uuid.v4();
//   let agent = await getRandomAgent(businessId);
//   let newTicket = new Ticket({
//     // ticketId: id,
//     email: email,
//     businessId: businessId,
//     customer: customer,
//     phoneNo: phoneNo,
//     channel: channel,
//     agentName: agent.agentName,
//   });
//   try {
//     await newTicket.save();
//   } catch (e) {
//     if (error instanceof MongooseError) {
//       console.log(error);
//     }
//     console.log(e);
//     return e;
//   }
//   return newTicket;
// };

// const getRandomAgent = async (businessId) => {
//   const business = await Business.findOne({ businessId }).select("_id");
//   let agentsArray = await Agent.find({ businessId: business._id });
//   const randomIndex = Math.floor(Math.random() * agentsArray.length);
//   return agentsArray[randomIndex];
// };

// module.exports.getRandomAgent = getRandomAgent;

// // Accepts an array of texts
// const constructSummarizationPrompt = (texts) => {
//   let prompt = "Please summarize the following texts:\n\n";
//   texts.forEach((text, index) => {
//     prompt += `${index + 1}. ${text}\n\n`;
//   });
//   prompt += "Summary:";
//   return prompt;
// };

// module.exports.createChatService = createChatService;

// const metricsService = async (titles) => {
//   let delimiter = "#####";
//   let messages = [
//     {
//       role: "system",
//       content: `
//             You are an analyst.
//             You will be provided with a list of titles.
//             The titles will be delimited with ${delimiter} characters.
//             Determine the common title from the list of titles. 
//             Make sure you don't add any other key aside this key title in your json response.

//             Titles: ${delimiter}${JSON.stringify(titles)}${delimiter}.
//             `,
//     },
//   ];

//   try {
//     let completion = await javis(messages);
//     return completion;
//   } catch (e) {
//     console.log(e);
//     return e;
//   }
// };

module.exports.createVector = async (faqs) => {
  let embedding_array = []

  for(let i=0; i<faqs.length; i++){
    // console.log(faqs[i])
    let faq = JSON.stringify(faqs[i])
    let completion = await javisEmbeddings(faq)

    let embedding = completion.data[0].embedding

    // Create a Python dictionary containing the vector and the original text
    let embedding_dict = {'embedding': embedding, 'text': faqs[i]}
    // Store the dictionary in a list.
    embedding_array.push(embedding_dict)
  }


  let csv = await generateCSVFile(embedding_array);

  fs.writeFile('public/vectors.csv', csv, (err) => {
    if (err) {
      console.log(err)
    return err;
  }
    console.log('CSV vectors generated successfully.');
  });

  return
}

const generateCSVFile = async (embeddings) => {
  let csv = 'embedding,text\n';

  for (const embed of embeddings) {
      // console.log("response", products)

      let { embedding, text } = embed;
  
      csv += `"${embedding}","${text}"\n`;
  }

  return csv;
}

const javisEmbeddings = async (message) => {
  const completion = await openai.createEmbedding({
    input: message,
    model: "text-embedding-ada-002"
  }
  );

  return completion.data;
};

module.exports.processMsg = async (promptMsg, res, faqs, departments, business) => {
  console.log(promptMsg)
  let embeddingCompletion = await javisEmbeddings(promptMsg)
  let embedding = embeddingCompletion.data[0].embedding;
  let similarity_array = []
  // let embeddings = []
  let df = ""
  df

  for(let i=0; i<faqs.length; i++){
    let faqEmbedding = faqs[i]["embeddings"];
    similarity_array.push(calculate_similarity(faqEmbedding, embedding))
  }

  let index = indexOfMax(similarity_array)

  let delimiter = "#####";
  let delimiter2 = "####";
  let delimiter3 = "*****";

  let systemKnowledge = [
    {
      role: "system",
      content: `
            You are a sales representative for a company called ${business.businessName}.
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
          response: faqs[index].response
        }
      )}${delimiter3}.
      `,
    },
    // {
    //   role: "system",
    //   content: `Previous messages between you and the customer${delimiter2}${JSON.stringify(
    //     previousMsg
    //   )}${delimiter2}`,
    // },
    {
      role: "user",
      content: `${delimiter}${promptMsg}${delimiter}`,
    }
  ];

  console.log(systemKnowledge)
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
    `
    
  let question_prompt = `
    [Article]
    ${faqs[index].response}
    
    [Question]
    ${promptMsg}
  `

  let knowledge = [
    {
        "role": "system",
        "content": system_prompt
    },
    {
        "role": "user",
        "content": question_prompt
    }
  ]

  let completion = await javis(systemKnowledge)
  console.log(completion.data.choices[0])
  res.send(completion.data.choices[0].message)
}

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
  console.log(vec1)
  let dot_product = dotProduct(vec1, vec2);
  let magnitude1 = calculateMagnitude(vec1)
  let magnitude2 = calculateMagnitude(vec2)
  return dot_product / (magnitude1 * magnitude2)
}

function dotProduct(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same length');
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
