const { OpenAIApi, Configuration } = require("openai");
const { Ticket } = require("../models/ticket.model");
const { ChatMessage } = require("../models/chat-message.model");
const { GoogleMail } = require("../models/gmail.model");
const uuid = require("uuid");
const { Business } = require("../business/businessModel");
const { KnowledgeBase } = require("../knowledgeBase/knowledgeBaseModel");
const { Order } = require("../order/orderModel");
const nodemailer = require("nodemailer");
const {
  extractNameAndEmail,
  stripSpecialCharacters,
} = require("../utils/helper");
const base64 = require("base64url");
const cron = require("node-cron");
const { google } = require("googleapis");
const { MongooseError } = require("mongoose");
const OAuth2Client = google.auth.OAuth2;

const CLIENT_ID = process.env.CLIENT_ID;
const CLEINT_SECRET = process.env.CLEINT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLEINT_SECRET, REDIRECT_URI);

const configuration = new Configuration({
  organization: "org-oRjT38IDR8URxu112r663l81",
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const processEmailService = async (ticketId, channel, mail) => {
  let [customer, email] = extractNameAndEmail(mail.from);
  const refinedMail = {
    businessId: mail.businessId,
    gmailId: mail.emailId,
    threadId: mail.threadId,
    snippet: mail.snippet,
    originalMailDate: mail.mailSentDate,
    subject: mail.subject,
    content: mail.body,
    email: email,
    to: mail.to,
  };

  let ticket = await Ticket.findOne({ _id: ticketId });

  if (!ticket) {
    let id = await createEmailService(refinedMail, email, channel, customer);
    ticketId = id;
  }
  let delimiter = "#####";
  let delimiter2 = "####";
  let delimiter3 = "*****";

  ticket = await Ticket.findById(ticketId).exec();

  let business = await Business.findOne({ businessId: refinedMail.businessId });

  if (!business) {
    return { message: "Business doesn't exists" };
  }

  let knowledgeBase = await KnowledgeBase.findOne({
    businessId: refinedMail.businessId,
  });

  let knowledge_base = [];
  let faqs = [];

  if (knowledgeBase) {
    knowledge_base = knowledgeBase.knowledgeBase;
    faqs = knowledgeBase.faqs;
  }

  let systemKnowledge = [
    {
      role: "system",
      content: `
            You are a sales representative.
            Do not mention or act like an AI to the customer.
            You will be provided with customer service queries.
            The customer service query will be delimited with ${delimiter} characters.
            Your previous mails with customer will be delimited with ${delimiter2} characters.
            Always use only the information delimited with ${delimiter3} to respond to user query. 
            If request is not in the inventory, faqs and company information that was sent with the query you are to return a json format with escalated set to true and escalation_department to the appropriate department.
            Always classify each query into a category.
            Always classify each query and your previous mail with customer into a sentiment.
            Always classify each query into a type.
            Generate a title based on customer previous mail with you and customer new query.
            Always classify each query and your previous mail with customer into a escalated.
            Always classify each query and your previous mail with customer into a department.
            If customer is about to place order set placingOrder to true.
            Determine if user has completed their chat using their current query and set isCompleted to true.
            Set escalated to true if customer query is not related to your inventory else set escalated to false.
            Always classify each query and your previous mail with customer into an escalation_department if escalated is set to true else set escalation_department to null
            Make sure you don't add any other key aside this keys response, category, sentiment, type, department, escalated, escalation_department, placingOrder, isCompleted and title in your json response.
            Always return product details in the response key when you want to display a product to the user from the inventory in text format.

            Categories: General Inquiries, Order, Issue, Complains.
            Sentiment: Happy, Neutral, Angry.
            Type: Bugs, Features, Refunds,Payment, Fraud, Inquiry, Feedback, Request, Order.
            Department: ${business.departments}.
            Escalation Department: ${business.departments}.
            `,
    },
    {
      role: "system",
      content: `The company or business name: ${delimiter3}${JSON.stringify(
        business.businessName
      )}${delimiter3}.
      Should the user message include the business or company name, know that they are referring to you.
      `,
    },
    {
      role: "system",
      content: `Company faqs to answer related questions: ${delimiter3}${JSON.stringify(
        faqs
      )}${delimiter3}.`,
    },
    {
      role: "system",
      content: `
            Inventory to answer from: ${JSON.stringify(knowledge_base)}.
            If customer service query is regarding a product in your inventory you must include the image of that product from your inventory in your response key in text format.
            If customer service query is not related to your inventory then inform the customer that you will escalate their query then set escalated key to true and classify the escalation_department key in your json response.
            Use the response key to return all the content of your response of the customer query including content from your inventory.
            `,
    },
  ];
  const mailExists = await GoogleMail.findOne({ gmailId: mail.emailId });
  if (mailExists) {
    console.log("Mail record exists, returning");
    return;
  }
  if (!business.aiMode || business.aiMode == "auto") {
    let reply = await autoReply(
      refinedMail,
      systemKnowledge,
      ticketId,
      ticket,
      email,
      customer
    );

    return reply;
  } else if (business.aiMode == "supervised") {
    let reply = await supervisedReply(
      refinedMail,
      systemKnowledge,
      ticketId,
      ticket,
      email,
      customer
    );

    return reply;
  }
};

const sendEmail = async (mailData) => {
  // console.log("got to send mail");
  const [name, mail] = extractNameAndEmail(mailData["to"]);
  // console.log(name, mail, mailData);
  let business = await Business.findOne({ businessId: mailData.businessId });
  // console.log(business);
  const isAccessTokenValid = await validateToken(business.gmail.access_token);
  let newAccessToken;
  if (isAccessTokenValid === false) {
    newAccessToken = await getNewAccessToken(business.gmail.refresh_token);
  }
  // console.log("isAccessTokenValid: ", isAccessTokenValid, newAccessToken);
  // return;
  const oauth2Client = {
    user: mail,
    clientId: CLIENT_ID,
    clientSecret: CLEINT_SECRET,
    refreshToken: business.gmail.refresh_token,
    accessToken: isAccessTokenValid
      ? business.gmail.access_token
      : newAccessToken,
  };
  // let transporter = nodemailer.createTransport({
  //   host: "smtp.gmail.com",
  //   port: 465,
  //   secure: true,
  //   auth: {
  //     type: "OAuth2",
  //     user: oauth2Client.user,
  //     accessToken: oauth2Client.accessToken,
  //     refreshToken: oauth2Client.refreshToken,
  //     clientId: oauth2Client.clientId,
  //     clientSecret: oauth2Client.clientSecret,
  //   },
  // });

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: oauth2Client.user,
      accessToken: oauth2Client.accessToken,
      refreshToken: oauth2Client.refreshToken,
      clientId: oauth2Client.clientId,
      clientSecret: oauth2Client.clientSecret,
    },
  });

  const sender = mailData["from"];
  const subject = "Re: " + mailData["subject"];
  //   const message = `Thank you for your email. Your message was: \n\n${mailData.assistantResponse}`;
  const message = `Hi ${name ? name : "there"} 
  \n\n 
  Thank you for reaching out to ${business.businessName} 
  \n\n 
  ${mailData.assistantResponse} 
  \n\n 
  Best regards, 
  \n
   ${business.businessName} Support Team`;

  // Compose the response email
  const mailOptions = {
    from: mail,
    to: sender,
    subject: subject,
    text: message,
    inReplyTo: mailData["gmailId"],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error("Error sending email:", error);
    }
    console.log("Response email sent:", info.response);
  });
};

// module.exports.sendEmail = sendEmail;

const autoReply = async (
  mail,
  systemKnowledge,
  ticketId,
  ticket,
  businessId,
  email,
  customer
) => {
  // const mailExists = await GoogleMail.findOne({ gmailId: mail["gmailId"] });

  // if (mailExists) {
  //   return;
  // }

  let reply = await replyEmailService(mail, systemKnowledge, ticketId, ticket);

  let content = reply.data.choices[0].message.content;
  let msg = reply.data.choices[0].message.content;
  let category = "";
  let type = "";
  let department = "";
  let sentiment = "";
  let escalated;
  let escalation_department = "";
  let title = "";
  let isCompleted;
  if (content.charAt(0) == "{") {
    if (content.charAt(content.length - 1) !== "}") content.push("}");
    let jsonResponse = JSON.parse(content);
    msg = jsonResponse.response;
    category = jsonResponse.category;
    type = jsonResponse.type;
    department = jsonResponse.department;
    sentiment = jsonResponse.sentiment;
    escalated = jsonResponse.escalated;
    escalation_department = jsonResponse.escalation_department;
    title = jsonResponse.title;
    isCompleted = jsonResponse.isCompleted;

    if (!jsonResponse.response && jsonResponse.placingOrder) {
      msg = "Created your order";
    }

    if (category && category.length > 0) ticket.category = category;
    if (type && type.length > 0) ticket.type = type;
    if (department && department.length > 0) ticket.department = department;
    if (sentiment && sentiment.length > 0) ticket.sentiment = sentiment;
    if (escalation_department && escalation_department.length > 0)
      ticket.escalation_department = escalation_department;
    if (title && title.length > 0) {
      let newTitles = ticket.titles;
      newTitles.push(title);
      ticket.titles = newTitles;
    }
    if (jsonResponse.escalated !== undefined) ticket.escalated = escalated;

    if (jsonResponse.isCompleted) ticket.isCompleted = isCompleted;

    if (jsonResponse.placingOrder && jsonResponse.items) {
      ticket.escalated = escalated;
      let newOrder = new Order({
        ticketId: ticketId,
        email: email,
        businessId: businessId,
        customer: customer,
        items: jsonResponse.items,
      });

      await newOrder.save();
    }
  }

  let mailId = uuid.v4() + uuid.v4();

  let customerReqMail = new GoogleMail({
    ticketId,
    mailId,
    gmailId: mail["gmailId"],
    content: mail["body"],
    from: mail["email"],
    to: mail["to"],
    mailSnippet: mail["snippet"],
    threadId: mail["threadId"],
    subject: mail["subject"],
    content: mail["content"],
    role: "user",
    originalMailDate: mail["originalMailDate"],
    businessId: mail["businessId"],
    customerName: customer,
  });

  await customerReqMail.save();

  // customerReqMail.assistantResponse =
  //   escalated == true
  //     ? "Your request has been escalated to the proper department"
  //     : msg;

  // customerReqMail.assistantResponse =
  // escalated == true && department
  //   ? `Your request has been escalated to the proper ${department}`
  //   : escalated == true && !department
  //   ? `Your request has been escalated to the proper department`
  //   : msg;

  // customerReqMail.assistantResponseDate = new Date();

  // await customerReqMail.save();

  customerReqMail = await GoogleMail.findByIdAndUpdate(
    customerReqMail._id,
    {
      assistantResponse:
        escalated == true && department
          ? `Your request has been escalated to the ${department} department, I'll be in touch with you shortly`
          : escalated == true && !department
          ? `Your request has been escalated to the proper department, I'll be in touch with you shortly`
          : msg,
      assistantResponseDate: new Date(),
    },
    { new: true }
  );
  console.log("mail saved");
  await sendEmail(customerReqMail);

  if (ticket.titles.length > 0) {
    let overall = await metricsService(ticket.titles);
    console.log(overall.data.choices[0].message);

    let overallMetrics = overall.data.choices[0].message.content;

    let title = "";
    let common_title = "";
    if (overallMetrics.charAt(0) == "{") {
      if (overallMetrics.charAt(overallMetrics.length - 1) !== "}")
        overallMetrics.push("}");
      let jsonResponse = JSON.parse(overallMetrics);
      title = jsonResponse.title;
      common_title = jsonResponse.common_title;

      if (title && title.length > 0) ticket.title = title;

      if (common_title && common_title.length > 0) ticket.title = common_title;
    }
  }

  await ticket.save();
  let data = {
    replyMode: "auto",
    message: customerReqMail,
    ticketId,
    // reply: assistantResponse,
  };

  return data;
};

const supervisedReply = async (
  mail,
  systemKnowledge,
  ticketId,
  ticket,
  businessId,
  email,
  customer
) => {
  // const mailExists = await GoogleMail.findOne({ gmailId: mail["gmailId"] });

  // if (mailExists) {
  //   return;
  // }
  let reply = await replyEmailService(mail, systemKnowledge, ticketId, ticket);
  console.log(reply.data.choices[0].message);

  let content = reply.data.choices[0].message.content;
  let msg = reply.data.choices[0].message.content;
  let category = "";
  let type = "";
  let department = "";
  let sentiment = "";
  let escalated;
  let escalation_department = "";
  let title = "";
  let isCompleted;
  if (content.charAt(0) == "{") {
    if (content.charAt(content.length - 1) !== "}") content.push("}");
    let jsonResponse = JSON.parse(content);
    msg = jsonResponse.response;
    category = jsonResponse.category;
    type = jsonResponse.type;
    department = jsonResponse.department;
    sentiment = jsonResponse.sentiment;
    escalated = jsonResponse.escalated;
    escalation_department = jsonResponse.escalation_department;
    title = jsonResponse.title;
    isCompleted = jsonResponse.isCompleted;

    if (!jsonResponse.response && jsonResponse.placingOrder) {
      msg = "Created your order";
    }

    if (category && category.length > 0) ticket.category = category;
    if (type && type.length > 0) ticket.type = type;
    if (department && department.length > 0) ticket.department = department;
    if (sentiment && sentiment.length > 0) ticket.sentiment = sentiment;
    if (escalation_department && escalation_department.length > 0)
      ticket.escalation_department = escalation_department;
    if (title && title.length > 0) {
      let newTitles = ticket.titles;
      newTitles.push(title);
      ticket.titles = newTitles;
    }
    if (jsonResponse.escalated !== undefined) ticket.escalated = escalated;

    if (jsonResponse.isCompleted) ticket.isCompleted = isCompleted;

    if (jsonResponse.placingOrder && jsonResponse.items) {
      ticket.escalated = escalated;
      let newOrder = new Order({
        ticketId: ticketId,
        email: email,
        businessId: businessId,
        customer: customer,
        items: jsonResponse.items,
      });

      await newOrder.save();
    }
  }

  let mailId = uuid.v4() + uuid.v4();

  const customerReqMail = new GoogleMail({
    ticketId,
    mailId,
    gmailId: mailId["gmailId"],
    content: mail["body"],
    from: mail["email"],
    to: mail["to"],
    mailSnippet: mail["snippet"],
    threadId: mail["threadId"],
    subject: mail["subject"],
    content: mail["content"],
    role: "user",
    originalMailDate: mail["originalMailDate"],
    businessId: mail["businessId"],
    status: "draft",
    customerName: customer,
  });

  await customerReqMail.save();

  // customerReqMail.assistantResponse =
  //   escalated == true && department
  //     ? `Your request has been escalated to the proper ${department}`
  //     : escalated == true && !department
  //     ? `Your request has been escalated to the proper department`
  //     : msg;

  // await customerReqMail.save();

  customerReqMail = await GoogleMail.findByIdAndUpdate(
    customerReqMail._id,
    {
      assistantResponse:
        escalated == true && department
          ? `Your request has been escalated to the ${department} department, I'll be in touch with you shortly`
          : escalated == true && !department
          ? `Your request has been escalated to the proper department, I'll be in touch with you shortly`
          : msg,
      assistantResponseDate: new Date(),
    },
    { new: true }
  );

  if (ticket.titles.length > 0) {
    let overall = await metricsService(ticket.titles);
    console.log(overall.data.choices[0].message);

    let overallMetrics = overall.data.choices[0].message.content;

    let title = "";
    let common_title = "";
    if (overallMetrics.charAt(0) == "{") {
      if (overallMetrics.charAt(overallMetrics.length - 1) !== "}")
        overallMetrics.push("}");
      let jsonResponse = JSON.parse(overallMetrics);
      title = jsonResponse.title;
      common_title = jsonResponse.common_title;

      if (title && title.length > 0) ticket.title = title;

      if (common_title && common_title.length > 0) ticket.title = common_title;
    }
  }

  await ticket.save();
  let data = {
    replyMode: "supervised",
    message: customerReqMail,
    ticketId: ticketId,
  };

  return data;
};

const replyEmailService = async (mail, messages, ticketId, ticket) => {
  const promptMsg = mail["content"];
  let previousMailsArray = [];
  let previousMails = await GoogleMail.find({ ticketId });
  previousMails = previousMails.map((msg) => {
    previousMailsArray.push({ role: msg.role, content: msg.content });
    previousMailsArray.push({
      role: "assistance",
      content: msg.assistantResponse,
    });
  });
  let delimiter = "#####";
  let delimiter2 = "####";
  previousMails = {
    role: "system",
    content: `Previous messages between you and the customer${delimiter2}${JSON.stringify(
      previousMailsArray
    )}${delimiter2}`,
  };
  let newMail = {
    role: "user",
    content: `${delimiter}${promptMsg}${delimiter}`,
  };
  messages.push(previousMails);
  messages.push(newMail);

  try {
    // console.log({ previousMails, messages, ticketId });
    let completion = await javis(messages, ticketId);
    return completion;
  } catch (e) {
    console.log(e);
    return e;
  }
};

const javis = async (messages, ticketId = null) => {
  let data = {
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0.4,
    frequency_penalty: 0.3,
    presence_penalty: 0.7,
  };

  if (ticketId) data["user"] = ticketId;

  const completion = await openai.createChatCompletion(data);
  // console.log(completion)
  return completion;
};

const createEmailService = async (mail, email, channel, customer) => {
  // let id = uuid.v4() + uuid.v4();

  let newTicket = new Ticket({
    // ticketId: id,
    email: email,
    businessId: mail["businessId"],
    emailThread: mail["threadId"],
    customer: customer,
    channel: channel,
  });
  try {
    await newTicket.save();
  } catch (e) {
    console.log(e);
    return e;
  }
  // return id;
  return newTicket["_id"];
};

const metricsService = async (titles) => {
  let delimiter = "#####";
  let messages = [
    {
      role: "system",
      content: `
            You are an analyst.
            You will be provided with a list of titles.
            The titles will be delimited with ${delimiter} characters.
            Determine the common title from the list of titles. 
            Make sure you don't add any other key aside this key title in your json response.

            Titles: ${delimiter}${JSON.stringify(titles)}${delimiter}.
            `,
    },
  ];

  try {
    let completion = await javis(messages);
    return completion;
  } catch (e) {
    console.log(e);
    return e;
  }
};
const spreadGmailInitialArrayAddBusinessId = (
  dataArray,
  businessId,
  refreshToken
) => {
  let newDataArray = [];
  for (const data of dataArray) {
    newDataArray = [
      ...newDataArray,
      { emailId: data.id, threadId: data.threadId, businessId, refreshToken },
    ];
  }
  return newDataArray;
};

const getObjectFromDataArray = (name, objectArray) => {
  let choice = objectArray.find(
    (object) => object.name.toLocaleLowerCase() === name.toLowerCase()
  );
  return choice?.value;
};

const getGmailTo = (emailData) => {
  const headers = emailData.payload.headers;
  const toHeader = headers.find((header) => header.name.toLowerCase() === "to");
  return toHeader ? toHeader.value : "";
};

const getGmailFrom = (emailData) => {
  const headers = emailData.payload.headers;
  const fromHeader = headers.find(
    (header) => header.name.toLowerCase() === "from"
  );
  return fromHeader ? fromHeader.value : "";
};

const getGmailSubject = (emailData) => {
  const headers = emailData.payload.headers;
  const fromHeader = headers.find(
    (header) => header.name.toLowerCase() === "subject"
  );
  return fromHeader ? fromHeader.value : "";
};

const getGmailDate = (emailData) => {
  const headers = emailData.payload.headers;
  const fromHeader = headers.find(
    (header) => header.name.toLowerCase() === "date"
  );
  return fromHeader.value;
};

// const getGmailBody(emailData)=> {
//   const message = emailData.payload;
//   if (message) {
//     if (message.body) {
//       if (message.body.size && message.body.size > 0) {
//         // If the email has a body with a size greater than 0, it's not empty
//         return Buffer.from(message.body.data, "base64").toString();
//       } else if (message.body.attachmentId) {
//         // If the email has an attachmentId, you can fetch the body separately
//         const attachment = emailData.payload.attachments.find(
//           (attachment) =>
//             attachment.body.attachmentId === message.body.attachmentId
//         );
//         if (attachment) {
//           return Buffer.from(attachment.body.data, "base64").toString();
//         }
//       }
//     }
//   }

//   return ""; // No valid body found
// }

// export function getPlainTextFromBody(message: any): string {
//   const parts = message.payload.parts;
//   if (!parts) {
//     // If there are no parts, return an empty string
//     return "";
//   }

//   for (const part of parts) {
//     if (part.mimeType === "text/plain") {
//       const base64Data = part.body.data;
//       const decodedData = Buffer.from(base64Data, "base64").toString("utf-8");
//       return decodedData;
//     }
//   }

//   // If no plain text part is found, return an empty string
//   return "";
// }

const getMailBody = (emailData) => {
  const decodedBody = emailData.data.payload?.parts?.find(
    (part) => part.mimeType === "text/plain" || part.mimeType === "text/html"
  );

  if (decodedBody && decodedBody.body && decodedBody.body.data) {
    return base64.default.decode(decodedBody?.body?.data);
    // console.log(base64.default.decode(decodedBody?.body?.data));
  } else {
    return "";
  }
};

// every 1s - */1 * * * * *
// run 8am, 1pm and 6pm daily, - * * 8,13,18 * * * ✔️
// every 50s - */50 * * * * *
// cron.schedule("*/50 * * * * *", async () => {
//   let currentDate;
//   let messages = [];
//   let messagesLv2 = [];
//   try {
//     // console.log("Cron running...");
//     const businesses = await Business.find({ gmail: { $exists: true } });

//     for (const business of businesses) {
//       currentDate = new Date(business.created_date);

//       // format => MM/DD/YYYY || YYYY/MM/DD
//       let formattedDate = `${currentDate.getFullYear()}/${String(
//         currentDate.getMonth() + 1
//       ).padStart(2, "0")}/${String(currentDate.getDate()).padStart(2, "0")}`;

//       oAuth2Client.setCredentials({
//         refresh_token: business.gmail.refresh_token,
//       });
//       const gmailClient = google.gmail({ version: "v1", auth: oAuth2Client });
//       const res = await gmailClient.users.messages.list({
//         userId: "me",
//         q: `after:${formattedDate} is:inbox`,
//       });
//       // console.log(res.data.messages);
//       messages = [
//         ...messages,
//         ...spreadGmailInitialArrayAddBusinessId(
//           res.data.messages,
//           business.businessId,
//           business.gmail.refresh_token
//         ),
//       ];
//     }

//     // console.log(`looped ${loop + 1}`);

//     for (const message of messages) {
//       oAuth2Client.setCredentials({
//         refresh_token: message.refreshToken,
//       });
//       const gmailClient = google.gmail({ version: "v1", auth: oAuth2Client });
//       const messageDetail = await gmailClient.users.messages.get({
//         userId: "me",
//         id: message.emailId,
//         format: "full",
//       });

//       if (messageDetail.status === 200) {
//         const from = getGmailFrom(messageDetail.data);
//         const date = getGmailDate(messageDetail.data);
//         const subject = getGmailSubject(messageDetail.data);
//         const to = getGmailTo(messageDetail.data);
//         const body = stripSpecialCharacters(getMailBody(messageDetail));
//         messagesLv2.push({
//           emailId: message.emailId,
//           businessId: message.businessId,
//           threadId: message.threadId,
//           refreshToken: message.refreshToken,
//           snippet: messageDetail.data.snippet,
//           from: from,
//           to: to,
//           mailSentDate: new Date(date),
//           subject: subject,
//           body: body,
//         });
//         // console.log(to, from);
//       }
//       // console.log(messagesLv2);
//     }

//     // console.log("Got here");

//     // console.log(messagesLv2);
//     // await http.post("/gmail", { emails: messagesLv2 });

//     console.log("got here");

//     for (let mail of messagesLv2) {
//       const ticket = await Ticket.findOne({ emailThread: mail.threadId });
//       console.log("Phase 1", ticket);
//       await processEmailService(ticket?.id, "gmail", mail);
//     }
//   } catch (error) {
//     console.log("Email fetching cron error: " + error);
//   }
// });

// it is required that all accounts are watched every 7 days, this is put up to tackle that
async function setWatchForAccounts() {
  // Fetch all accounts from the database
  const businesses = await Business.find({ gmail: { $exists: true } }).select(
    "gmail"
  );

  // For each account, set up the watch
  for (let business of businesses) {
    try {
      oAuth2Client.setCredentials({
        access_token: business.gmail.access_token,
        refresh_token: business.gmail.refresh_token,
      });

      const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

      const { data, status } = await gmail.users.watch({
        userId: "me",
        requestBody: {
          topicName: `projects/${process.env.PROJECT_ID}/topics/${process.env.TOPIC}`,
          labelIds: ["INBOX"],
          labelFilterBehavior: "INCLUDE",
        },
      });

      if (status === 200) {
        business.gmail.historyId = data.historyId;
        await business.save();
      }

      console.log(`Watch set up successfully for account ID: ${business}`);
    } catch (error) {
      console.error(
        `Failed to set up watch for account ID: ${business}. Error: ${error.message}`
      );
    }
  }
}

cron.schedule(" 0 0 */5 * *", async () => {
  await setWatchForAccounts();
});

const validateToken = async (accessToken) => {
  const tokenInfoUrl = `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`;
  const response = await fetch(tokenInfoUrl);
  const data = await response.json();

  if (data.error_description) {
    // console.error("Invalid Token:", data.error_description);
    return false;
  }

  // console.log("Token is valid for user:", data.email);
  return true;
};

const fetchEmailDetails = async (messageId, gmail, business) => {
  try {
    const mail = {};
    const res = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });
    if (res.status != 200) {
      console.log("An error occurred ", messageId);
      return;
    }
    mail["emailId"] = res.data.id;
    mail["businessId"] = business.businessId;
    mail["threadId"] = res.data.threadId;
    mail["refreshToken"] = business.gmail.refresh_token;
    mail["snippet"] = res.data.snippet;
    mail["from"] = getGmailFrom(res.data);
    mail["to"] = getGmailTo(res.data);
    mail["mailSentDate"] = new Date(getGmailDate(res.data));
    mail["subject"] = getGmailSubject(res.data);
    // mail["body"] = stripSpecialCharacters(getMailBody(res));
    mail["body"] = getMailBody(res);
    console.log(mail);
    // return;
    const ticket = await Ticket.findOne({ emailThread: mail.threadId });
    await processEmailService(ticket?.id, "gmail", mail);
  } catch (error) {
    if (error instanceof MongooseError) {
      console.log(`Mongoose error occurred udom ${error?.code}`, error);
    } else {
      console.log("Error occured", error);
    }
  }
};

async function getNewAccessToken(refreshToken) {
  oAuth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const response = await oAuth2Client.refreshAccessToken();
  return response.res.data.access_token;
}

module.exports = {
  sendEmail,
  processEmailService,
  spreadGmailInitialArrayAddBusinessId,
  getObjectFromDataArray,
  getGmailTo,
  getGmailFrom,
  getGmailSubject,
  getGmailDate,
  getMailBody,
  fetchEmailDetails,
};
