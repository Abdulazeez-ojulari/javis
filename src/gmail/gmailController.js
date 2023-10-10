// const { Business } = require("../business/businessModel");
// const errorMiddleware = require("../middlewares/error");
// const { Chat } = require("./chatModel");
const {
  processMl,
} = require("./gmailService");
// const eventEmitter = require("../event/events");
// const { Ticket } = require("../models/ticket.model");
// const { Agent } = require("../business/agent.model");
const { KnowledgeBase } = require("../model/knowledgeBaseModel");
const { Faq } = require("../model/faqModel");
const { Business } = require("../model/businessModel");
const { Department } = require("../model/departmentModel");
const { ChatMessage } = require("../model/chatModel");
const { Gmail } = require("../model/gmailModel");

module.exports.processMail = async (req, res) => {
  let { promptMail, ticketId } = req.body;
  let { businessId } = req.params;

  const knowledge = await KnowledgeBase.findOne({ businessId: businessId });
  if (!knowledge) {
    return res
      .status(404)
      .send({ message: "This business dosen't have a knowledge base" });
  }
  const business = await Business.findOne({ businessId: businessId });

  let mails;
  let previousMails = [];
  if (ticketId) {
    mails = await Gmail.find({ ticketId: ticketId })
      .sort({ createdAt: -1 })
      .limit(3);
    mails.map((msg) => {
      previousMails.push({ role: msg.role, content: msg.content });
      previousMails.push({
        role: "assistance",
        content: msg.assistantResponse,
      });
    });
    console.log(previousMails);
  }

  const departments = await Department.find({ businessId: business._id });

  let faqs = await Faq.find({ knowledgeBaseId: knowledge._id }).select(
    "question response embeddings -_id"
  );

  // console.log(promptMail);
  await processMl(promptMail, res, faqs, departments, business, previousMails);

  return;
};
