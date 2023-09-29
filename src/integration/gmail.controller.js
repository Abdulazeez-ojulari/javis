const errorMiddleware = require("../middlewares/error");
const Gmail = require("./gmailModel");
const { GoogleMail } = require("../models/gmail.model");
const { Ticket } = require("../models/ticket.model");
const { v4: uuidV4 } = require("uuid");
const { LIMIT } = require("../utils/const");
const {
  extractNameAndEmail,
  stripSpecialCharacters,
} = require("../utils/helper");
const {
  processEmailService,
  sendEmail,
  spreadGmailInitialArrayAddBusinessId,
  getObjectFromDataArray,
  getGmailTo,
  getGmailFrom,
  getGmailSubject,
  getGmailDate,
  getMailBody,
  fetchEmailDetails,
} = require("./gmailService");
const fs = require("node:fs");
const path = require("node:path");
const { google } = require("googleapis");
const { Business } = require("../business/businessModel");
const { MongooseError } = require("mongoose");
const OAuth2Client = google.auth.OAuth2;
const CLIENT_ID = process.env.CLIENT_ID;
const CLEINT_SECRET = process.env.CLEINT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLEINT_SECRET, REDIRECT_URI);

exports.persistGoogleMails = errorMiddleware(async (req, res) => {
  const { emails } = req.body;
  const uuid = uuidV4();
  let ticket, mail;
  // console.log(emails);
  for (const mail of emails) {
    const ticket = await Ticket.findOne({ emailThread: mail.threadId });
    await processEmailService(ticket?.ticketId, "gmail", mail);
  }
});

exports.getBusinessGmails = errorMiddleware(async (req, res) => {
  const { page } = req.query;
  const { businessId } = req.params;
  const pageNumber = page || 0;
  const limit = LIMIT || 10;
  const result = {};
  const ticket = await Ticket.findOne({ businessId });
  const totalTickets = await Gmail.find({ businessId }).count();
  let startIndex = pageNumber * limit;
  const endIndex = (pageNumber + 1) * limit;
  result.totalTickets = totalTickets;
  if (startIndex > 0) {
    result.previous = {
      pageNumber: pageNumber - 1,
      limit: limit,
    };
  }
  if (endIndex < (await Gmail.find({ businessId }).count())) {
    result.next = {
      pageNumber: pageNumber + 1,
      limit: limit,
    };
  }

  result.mails = await Gmail.find({ businessId })
    .sort(" mailSentDate ")
    .skip(pageNumber)
    .limit(limit);

  result.rowsPerPage = limit;

  // console.log(result);

  return res
    .status(200)
    .json({ message: "Records fetched successfully", data: result });
});

exports.getBusinessTickets = errorMiddleware(async (req, res) => {
  const { page } = req.query;
  const { businessId } = req.params;
  const pageNumber = page || 0;
  const limit = LIMIT || 10;
  const result = {};
  const totalTickets = await Ticket.find({
    businessId,
    channel: "gmail",
  }).count();
  let startIndex = pageNumber * limit;
  const endIndex = (pageNumber + 1) * limit;
  result.totalTickets = totalTickets;
  if (startIndex > 0) {
    result.previous = {
      pageNumber: pageNumber - 1,
      limit: limit,
    };
  } else {
    result.previous = {
      pageNumber,
      limit: limit,
    };
  }

  if (endIndex < totalTickets) {
    result.next = {
      pageNumber: pageNumber + 1,
      limit: limit,
    };
  } else {
    result.previous = {
      pageNumber,
      limit: limit,
    };
  }

  result.tickets = await Ticket.find({ businessId, channel: "gmail" })
    .sort(" created_date ")
    .skip(pageNumber)
    .limit(limit)
    .populate("gmail");

  result.rowsPerPage = limit;

  return res
    .status(200)
    .json({ message: "Records fetched successfully", data: result });
});

exports.getBusinessMailByTicketId = errorMiddleware(async (req, res) => {
  const { page } = req.query;
  const { ticketId } = req.params;
  const pageNumber = page || 0;
  const limit = LIMIT || 10;
  const result = {};
  const totalMails = await GoogleMail.find({ ticketId }).count();
  console.log(totalMails);
  let startIndex = pageNumber * limit;
  const endIndex = (pageNumber + 1) * limit;
  result.totalMails = totalMails;
  if (startIndex > 0) {
    result.previous = {
      pageNumber: pageNumber - 1,
      limit: limit,
    };
  } else {
    result.previous = {
      pageNumber,
      limit: limit,
    };
  }

  if (endIndex < totalMails) {
    result.next = {
      pageNumber: pageNumber + 1,
      limit: limit,
    };
  } else {
    result.previous = {
      pageNumber,
      limit: limit,
    };
  }

  result.mails = await GoogleMail.find({ ticketId })
    .sort({ originalMailDate: -1 })
    .skip(pageNumber)
    .limit(limit);

  result.rowsPerPage = limit;

  return res
    .status(200)
    .json({ message: "Records fetched successfully", data: result });
});

exports.replyMail = errorMiddleware(async (req, res) => {
  const { mailId } = req.params;
  const mail = await GoogleMail.findOne({ mailId });

  if (!mail) {
    return res.status(404).json({ message: "Mail not found", data: mail });
  }

  // const business = await Business.findOne({ businessId: mail.businessId });

  if (mail.status === "sent") {
    return res.status(200).json({
      message: "This mail status has moved from draft to sent",
      data: mail,
    });
  }

  mail.assistantResponseDate = new Date();
  await mail.save();

  await sendEmail(mail);

  return res.status(200).json({ message: "Mail ", data: result });
});

exports.pushNotification = errorMiddleware(async (req, res) => {
  const pubsubMessage = req.body.message;
  let emailData = Buffer.from(pubsubMessage.data, "base64").toString("utf-8");
  emailData = JSON.parse(emailData);
  console.log("got here", emailData, emailData.historyId);
  const business = await Business.findOne({
    supportEmail: emailData.emailAddress,
  });
  if (!business) {
    // return res.status(200).json({ message: "Record hit" });
    console.log(
      `Support email not found: ${emailData.emailAddress}, ${emailData.historyId}`
    );
    return res.status(404).json({ message: "Support email not found" });
  }
  oAuth2Client.setCredentials({ refresh_token: business.gmail.refresh_token });
  const gmailClient = google.gmail({ version: "v1", auth: oAuth2Client });
  const historyList = await gmailClient.users.history.list({
    userId: "me",
    startHistoryId: business.gmail.historyId,
    // labelId: ["INBOX"],
  });
  historyList.data.history.forEach((change) => {
    if (change.messagesAdded) {
      change.messagesAdded.forEach((messageInfo) => {
        fetchEmailDetails(messageInfo.message.id, gmailClient, business);
      });
    }
  });
  // console.log(business);
  business.gmail.historyId = emailData.historyId;
  await business.save();
  return res.status(200).json({ message: "Notification acted upon" });
});

exports.sendMail = errorMiddleware(async (req, res) => {
  await sendEmail(req.body);
  return res.sendStatus(200);
});
