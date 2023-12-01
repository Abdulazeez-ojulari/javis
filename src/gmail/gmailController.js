// const { Business } = require("../business/businessModel");
// const errorMiddleware = require("../middlewares/error");
// const { Chat } = require("./chatModel");
const { processMail } = require("./gmailService");
// const eventEmitter = require("../event/events");
// const { Ticket } = require("../models/ticket.model");
// const { Agent } = require("../business/agent.model");
const { KnowledgeBase } = require("../model/knowledgeBaseModel");
const { Faq } = require("../model/faqModel");
const { Business } = require("../model/businessModel");
const { Department } = require("../model/departmentModel");
const { Gmail } = require("../model/gmailModel");
const { Ticket } = require("../model/ticket.model");
const { Inventory } = require("../model/inventoryModel");

module.exports.processMail = async (req, res) => {
  let { promptMail, ticketId } = req.body;
  let { businessId } = req.params;

  const knowledge = await KnowledgeBase.findOne({ businessId: businessId });

  if (!knowledge) {
    return res
      .status(404)
      .send({ message: "This business doesn't have a knowledge base" });
  }

  const business = await Business.findOne({ businessId: businessId });
  if(!business){
    return res
      .status(404)
      .send({ message: "business not found" });
  }

  let mails;
  let previousMails;
  if (ticketId) {
    mails = await Gmail.find({ ticketId: ticketId })
      .sort({ createdAt: -1 })
      .limit(3);
    previousMails = mails
      .map((msg) => [
        { role: msg.role, content: msg.content },
        {
          role: "assistance",
          content: msg.assistantResponse,
        },
      ])
      .reduce((init, obj) => init.concat(obj), []);
    console.log("udom - prevMails", previousMails);
  }

  const departments = await Department.find({
    businessId: business._id,
  }).select("department -_id");

  console.log(ticketId, "ticketID")

  const ticket = await Ticket.findById(ticketId).select("customer -_id");

  let faqs = await Faq.find({ knowledgeBaseId: knowledge._id }).select(
    "question response embeddings -_id"
  ).where("embeddings").exists().ne(null);

  // console.log(faqs)
  let inventories = await Inventory.find({ knowledgeBaseId: knowledge._id }).select(
    "name image quantity category price status more embeddings -_id"
  ).where("embeddings").exists().ne(null);

  // console.log(inventories)

  console.log("udom - promptMail", promptMail);
  await processMail(
    promptMail, res, faqs, departments, business, previousMails, ticket, inventories
  );

  return;
};

module.exports.mailCategorization = async (req, res) => {
  let { promptMsg, ticketId, newres, businessId } = req.body;

  const ticket = await Ticket.findById(ticketId);

  const business = await Business.findOne({ businessId: businessId });

  let mail;
  let previousMsg;
  if (ticketId) {
    mail = await Gmail.find({ ticketId: ticketId })
      .sort({ createdAt: -1 })
      // .limit(20);
    previousMsg = mail.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
    // console.log(previousMsg);
  }

  const departments = await Department.find({ businessId: business._id }).select("department -_id");

  emailCategorization(promptMsg, departments, previousMsg, newres, res, ticket, business._id)

  // res.send(faqs)
  return;
};
