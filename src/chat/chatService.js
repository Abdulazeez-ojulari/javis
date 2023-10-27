
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
// const fs = require("fs");
// const parse = require("csv-parse").parse;

const { javisEmbeddings, javis } = require("../../openai");

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
  let embedding_array = [];

  for (let i = 0; i < faqs.length; i++) {
    // console.log(faqs[i])
    let faq = JSON.stringify(faqs[i]);
    let completion = await javisEmbeddings(faq);

    let embedding = completion.choices[0].embedding

    // Create a Python dictionary containing the vector and the original text
    let embedding_dict = { embedding: embedding, text: faqs[i] };
    // Store the dictionary in a list.
    embedding_array.push(embedding_dict);
  }

  let csv = await generateCSVFile(embedding_array);

  fs.writeFile("public/vectors.csv", csv, (err) => {
    if (err) {
      console.log(err);
      return err;
    }
    console.log("CSV vectors generated successfully.");
  });

  return;
};

const generateCSVFile = async (embeddings) => {
  let csv = "embedding,text\n";

  for (const embed of embeddings) {
    // console.log("response", products)

    let { embedding, text } = embed;

    csv += `"${embedding}","${text}"\n`;
  }

  return csv;
};

module.exports.processMsg = async (promptMsg, res, faqs, departments, business, previousMsg, customer, inventories) => {
  console.log(customer, previousMsg)
  let foundFaq = await getFaq(promptMsg, faqs, previousMsg)
  let foundInventory = await getInventory(promptMsg, inventories, previousMsg)
  console.log(foundFaq, "faq")
  console.log(foundInventory, "inventory")
  const response_instructions_chat = `
  You are a customer support agent for ${business.businessName}. 
  Do not mention that you're an AI or resemble it. Do not include 'AI' or 'ai' or 'A.I.' or 'a.i.' in your response. 
  Your task is to generate concise responses based on the knowledge base provided, do not instruct the user to email anyone or call any number nor provide wrong information. 
  Simply respond as instructed and assure the user that the issue has been escalated. Your primary role is to facilitate communication and help escalate issues where necessary while maintaining a courteous and professional demeanor. 
  Do not provide unneeded information in your response to the user's message. If the user's message includes pleasantries, you should respond with pleasantries as well. 
  If the user's message includes requests beyond your knowledgebase, do not disclose that you're an AI or customer support agent and do not tell the user that its request is not in your knowledgebase. Instead, request for user data that could help in fixing their issue and inform them that you will refer them to an agent and that they will receive a notification about their request.`
  const query_categorization_instructions = `You are a query analyst responsible for categorizing messages into a JavaScript JSON format. Your responses must contain the following keys: department, urgency, sentiment, title, type, and category. Here's an explanation of the keys:
  "department": Determine the department based on the user's message. Departments to check from <${departments.length > 0 ? departments.join('/'): "Customer Support"}>. If a department is identified, set it to that department; otherwise, set it to "Customer Support"."
  "urgency": Assess the urgency as low, medium, or high based on the user's message.
  "sentiment": Analyze the sentiment of the message and set it to Happy, Neutral, or Angry accordingly.
  "title": Categorize the message content into a suitable ticket title.
  "type": Categorize the message content into an appropriate ticket type.
  "category": Categorize the message content into an applicable ticket category.
  Ensure that your response adheres to the correct JavaScript JSON format. Always confirm that your JSON response is structured properly`;
  // const escalation_instructions = `You are an escalation assistant. You will be provided with an agent_response and the knowledge_base that was used to generate the response. Your task is to determine if the content in the agent_response is generated from or similar to the content in the knowledge_base return either true or false only. i only gave a max_token of 1`;
  // const escalation_instructions2 = `You are an response analyst that analyses response in a boolean format. Your task is to return true if the provided response needs to be escalated, resembles an escalation message, looks like an escalation message, contains the word escalation, includes apology statements else return false. return a boolean "true" or "false".`;
  const escalation_instructions3 = `
  You are an escalation detector for response messages. Your task is to evaluate whether a given response should be escalated. Return true if the response indicates a need for escalation. Consider the following criteria:
  Check if the response contains the word 'escalation'.
  Look for apology statements in the response.
  Assess if the message resembles or includes common phrases found in escalation messages.
  If the response lacks information or states an inability to assist, consider it for escalation.
  Return a boolean value 'true' if the response meets any of these criteria; otherwise, return 'false'.
  `;

  // let delimiter = "#####";
  // let delimiter2 = "####";
  // let delimiter3 = "*****";

  let mes = previousMsg.reverse().map(msg => { 
      return msg.content
  })

  let _agentmsg = previousMsg.filter(msg => { 
    return msg.role == "assistance"
  })

  console.log(_agentmsg)

  let agentmsg = _agentmsg.reverse().map(msg => { 
    return msg.content
  })

  let company_information = {
    company_description: business.description,
    company_address: business.address,
    account_number: business.accountNo,
    bank_name: business.bankName,
  }

  mes.push(promptMsg)
  const responseInstructionsLogic = [
    {
      "role": "system",
      "content": `response_instructions: ${response_instructions_chat}`
    },
    {
      "role": "system",
      "content": `knowledge base to answer from: Company Information - ${JSON.stringify(company_information)}, Inventories - ${JSON.stringify(foundInventory)}, FAQ - ${JSON.stringify(foundFaq)}`
    },
    {
      "role": "system",
      "content": `User's previous messages for reflection: ${previousMsg.length > 0 ? previousMsg[previousMsg.length -1].content: ""} and user's name is ${customer}`
    },
    {"role": "user", "content": `${promptMsg}`},
  ];

  const queryCategorizationLogic = [
    {
        "role": "system",
        "content": `query_categorization_instructions: ${query_categorization_instructions}.`
    },
    {
        "role": "assistant",
        "content": `message to be analysed: ${mes.join(",")}`
    },
  ]

  let completion = await javis(responseInstructionsLogic, 500)
  console.log(completion.choices[0], "response")

  let completion2 = await javis(queryCategorizationLogic, 100)
  console.log(completion2.choices[0], "categorization")

  agentmsg.push(completion.choices[0].message.content)
  const escalationLogic = [
    {
        "role": "system",
        "content": `escalation_instructions: ${escalation_instructions3}.`
    },
    {
      "role": "assistant",
      "content": `agent_response to be analysed: ${agentmsg.join(",")}`
    },
  ]

  let completion3 = await javis(escalationLogic, 1)
  console.log(completion3.choices[0], "escalation")

  // let related = [
  //   "Introductions",
  //   "Gratitude Expressions",
  //   "Closing Remarks",
  //   "Cultural Greetings",
  //   "Casual Greetings",
  //   "Formal Greetings",
  //   "Complements"
  // ]

  // let systemKnowledge2 = [
  //   {
  //     "role": "system",
  //     "content": `
  //       You are an analyst.
  //       You will be provided with the customer query, agent response and faq that the agent used to answer customer response.
  //       Customer query is delimited by ${delimiter} characters.
  //       Agent response is delimited by ${delimiter2} characters.
  //       Faq is delimited by ${delimiter3} characters.
  //     `
  //   },
  //   {
  //     "role": "system",
  //     "content": `
  //       ${delimiter2}${completion.choices[0].message.content}${delimiter2}
  //       ${delimiter3}${JSON.stringify(foundFaq)}${delimiter3}
  //       Determine if the agent generated the response from the faq delimited with ${delimiter3} characters.
  //       Set Escalation to "yes" if "From Faq" is set "no" and query is not related to ${JSON.stringify(related)}.
  //       Categorize user query using this categorization and return your response in json format:
  //       - Ticket Class
  //       - Ticket Type
  //       - Ticket Sentiment
  //       - Title
  //       - Urgency
  //       - Escalation [yes, no]
  //       - Satisfaction
  //       - From Faq: [yes,no]
  //       - Formal Greetings: [yes, no]
  //       - Casual Greetings: [yes, no]
  //       - Cultural Greetings: [yes, no]
  //       - Departments: ${departments}
  //       - escalation_department: ${departments}
  //     `
  //   },
  //   {
  //     "role": `user`,
  //     "content": `${delimiter}${promptMsg}${delimiter}`
  //   }
  // ];
  let categorization;
  let response;
  let stringifiedResponse = "";
  // console.log(completion2.choices[0].message.content);
  stringifiedResponse = completion2.choices[0].message.content.toString().replace(/'/g, '"').replace(/“/g, '"')
  try{
    console.log(stringifiedResponse)
    categorization = JSON.parse(stringifiedResponse)
    response = {
      response: completion.choices[0].message.content,
      department: categorization.department,
      urgency: categorization.urgency,
      sentiment: categorization.sentiment,
      title: categorization.title,
      type: categorization.type,
      category: categorization.category,
      escalated: completion3.choices[0].message.content.toLowerCase().includes("true"),
      escalation_department: completion3.choices[0].message.content.toLowerCase().includes("true") ? categorization.department : null
    }
  }catch(e){
    response = response = {
      response: completion.choices[0].message.content,
      escalated: completion3.choices[0].message.content.toLowerCase().includes("true"),
      escalation_department: completion3.choices[0].message.content.toLowerCase().includes("true") ? categorization.department : null
    }
    console.log(e.message)
  }

  console.log(response)

  res.send(
    {
      role: "assistant",
      content: JSON.stringify(response)
    }
  )
}

const getFaq = async (promptMsg, faqs, previousMsg) => {
  // console.log(promptMsg)
  let embeddingCompletion = await javisEmbeddings(promptMsg)
  let embedding = embeddingCompletion[0].embedding;
  let similarity_array = []
  let prev_similarity_array = []
  // let embeddings = []
  let df = "";
  df;

  for (let i = 0; i < faqs.length; i++) {
    let faqEmbedding = faqs[i]["embeddings"];
    similarity_array.push(calculate_similarity(faqEmbedding, embedding));
  }

  if(previousMsg.length > 0){
    let userMessages = []
    for(let i=0; i<previousMsg.length; i++){
      if(previousMsg[i].role === "user"){
        userMessages.push(previousMsg[i].content)
      }
    }

    if(userMessages.length > 0){
      let previousEmbeddingCompletion = await javisEmbeddings(userMessages)
      let previousEmbedding = previousEmbeddingCompletion[0].embedding;
      for(let i=0; i<faqs.length; i++){
        let faqEmbedding = faqs[i]["embeddings"];
        prev_similarity_array.push(calculate_similarity(faqEmbedding, previousEmbedding))
      }
    }
    // console.log(userMessages, prev_similarity_array)
  }

  let index = indexOfMax(similarity_array)
  let previousIndex = indexOfMax(prev_similarity_array)

  let foundFaq = []
  // console.log(index, similarity_array)
  if(index >= 0){
    if(previousIndex >= 0){
      foundFaq = [
        {
          question: faqs[previousIndex].question,
          response: faqs[previousIndex].response
        },
        {
          question: faqs[index].question,
          response: faqs[index].response,
        }
      ]
    }else{
      foundFaq = [
        {
          question: faqs[index].question,
          response: faqs[index].response
        }
      ]
    }
  }

  return foundFaq;
}

const getInventory = async (promptMsg, inventories, previousMsg) => {
  // console.log(promptMsg)
  let embeddingCompletion = await javisEmbeddings(promptMsg)
  let embedding = embeddingCompletion[0].embedding;
  let similarity_array = []
  let prev_similarity_array = []
  // let embeddings = []
  let df = "";
  df;

  for (let i = 0; i < inventories.length; i++) {
    let inventoryEmbedding = inventories[i]["embeddings"];
    similarity_array.push(calculate_similarity(inventoryEmbedding, embedding));
  }

  if(previousMsg.length > 0){
    let userMessages = []
    for(let i=0; i<previousMsg.length; i++){
      if(previousMsg[i].role === "user"){
        userMessages.push(previousMsg[i].content)
      }
    }

    if(userMessages.length > 0){
      let previousEmbeddingCompletion = await javisEmbeddings(userMessages)
      let previousEmbedding = previousEmbeddingCompletion[0].embedding;
      for(let i=0; i<inventories.length; i++){
        let inventoryEmbedding = inventories[i]["embeddings"];
        prev_similarity_array.push(calculate_similarity(inventoryEmbedding, previousEmbedding))
      }
    }
    // console.log(userMessages, prev_similarity_array)
  }

  let index = indexOfMax(similarity_array)
  let previousIndex = indexOfMax(prev_similarity_array)

  let foundInventory = []
  // console.log(index, similarity_array)
  if(index >= 0){
    if(previousIndex >= 0){
      delete inventories[previousIndex].embeddings;
      delete inventories[index].embeddings;
      foundInventory = [
        {
          name: inventories[previousIndex].name,
          image: inventories[previousIndex].image,
          quantity: inventories[previousIndex].quantity,
          category: inventories[previousIndex].category,
          price: inventories[previousIndex].price,
          status: inventories[previousIndex].status,
          more: inventories[previousIndex].more
        },
        {
          name: inventories[index].name,
          image: inventories[index].image,
          quantity: inventories[index].quantity,
          category: inventories[index].category,
          price: inventories[index].price,
          status: inventories[index].status,
          more: inventories[index].more
        }
      ]
    }else{
      foundInventory = [
        {
          name: inventories[index].name,
          image: inventories[index].image,
          quantity: inventories[index].quantity,
          category: inventories[index].category,
          price: inventories[index].price,
          status: inventories[index].status,
          more: inventories[index].more
        }
      ]
    }
  }

  console.log(foundInventory, "found")

  return foundInventory;
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
