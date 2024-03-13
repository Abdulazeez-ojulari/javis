// const { Business } = require("../business/businessModel");
// const errorMiddleware = require("../middlewares/error");
// const { Chat } = require("./chatModel");
const { processMail, emailCategorization } = require("./gmailService");
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
      content: msg.content
    }));
    // console.log(previousMsg);
  }

  // const ticket = {"_id":"65608337a7444e8682584d3c","email":"no-reply@accounts.google.com","emailThread":"18c0100304ad7194","businessId":"2ff104de-d77f-4933-920f-790cb7a8ea28430948ca-f9f8-4fbb-9b1d-1aea97374a67","customer":"Google","escalated":false,"sentiment":"Neutral","channel":"gmail","category":null,"type":null,"department":"Customer Support","escalation_department":null,"titles":[],"placingOrder":false,"isCompleted":true,"isActive":false,"read":false,"aiMode":"auto","escalatedResolvedTimer":{"$date":{"$numberLong":"1700821673655"}},"closed":false,"created_date":{"$date":{"$numberLong":"1700821673655"}},"update_date":{"$date":{"$numberLong":"1700821673655"}},"createdAt":{"$date":{"$numberLong":"1700823863867"}},"updatedAt":{"$date":{"$numberLong":"1708100188220"}},"__v":{"$numberInt":"0"},"isAdminMessageRead":false,"isResolved":false,"newMessage":false,"latestMessageDate":{"$date":{"$numberLong":"1702035557656"}},"userId":{"$oid":"65c244e5cc51987ba6e1cf80"}}

  // previousMsg = [
  //   {"_id":{"$oid":"65df60d78e4ead3f8138f1f1"},
  //   "ticketId":{"$oid":"65df60d68e4ead3f8138f1ec"},
  //   "mailId":"4481eca9-0488-4bdc-81f0-53552b86dca2165c477e-ef29-4e88-ae33-6cffa1732d42",
  //   "emailId":"<CAGeb=ajCq1R-Pmhcb=vc4ENgY96USj9L7SV+NFSQ+jNJ+O7ZAA@mail.gmail.com>",
  //   "from":"diviner.f@credpal.com",
  //   "to":"adeniyivictorayomide@gmail.com",
  //   "customerName":"Diviner Fiah ",
  //   "threadId":"<CAGeb=ajCq1R-Pmhcb=vc4ENgY96USj9L7SV+NFSQ+jNJ+O7ZAA@mail.gmail.com>",
  //   "subject":"My Investment is locked",
  //   "content":"Hello Victor,\r\n\r\nI have been trying to access my funds for a while now and it's proving\r\nabortive.\r\n\r\n-- \r\n\r\nWarm Regards,\r\n\r\n\r\n*Diviner Fiah*\r\n*Account manager Credit Builder*\r\n*+2349123335618*\r\n[image: CredPal Signature.png]\r\n[image: unnamed (2).png] <https://linktr.ee/credpal>\r\n",
  //   "status":"sent","role":"user","businessId":"3421a016-ef8b-4c1d-9ced-34147e11e158bfc90848-721c-40d4-b535-b1ef7054f145","originalMailDate":{"$date":{"$numberLong":"1709138133000"}},"read":false,"createdAt":{"$date":{"$numberLong":"1709138135090"}},"updatedAt":{"$date":{"$numberLong":"1709138167662"}},"__v":{"$numberInt":"0"},"assistantResponse":"Hi there,\n\n\n  We've received your request/concern.\n\n\n  If it's urgent, providing supporting evidence will greatly expedite the resolution process.\n\n\n  Rest assured, we'll prioritize sorting it out within the next 48hr.\n\n\n  Thank you for your patience and understanding.\n\n\n  Best regards,\n\n  CredPal.\n  ","assistantResponseDate":{"$date":{"$numberLong":"1709138166678"}},"responseEmailId":"<20240228163607.1adfc73386cee014@enif.ai>"}
  // ]

  const departments = await Department.find({ businessId: business._id }).select("department -_id");

  emailCategorization(promptMsg, departments, previousMsg, newres, res, ticket, business._id)

  // res.send(faqs)
  return;
};
