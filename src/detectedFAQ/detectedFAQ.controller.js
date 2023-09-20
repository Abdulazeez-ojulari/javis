const errorMiddleware = require("../middlewares/error");
const { validationResult } = require("express-validator");
const { DetectedFAQ } = require("../models/detected-faq.model");
const { LIMIT } = require("../utils/const");
const { Business } = require("../business/businessModel");
const { isMemberOfBusiness } = require("../utils/helper");
const { KnowledgeBase } = require("../knowledgeBase/knowledgeBaseModel");

module.exports.getNewlyDetectedFAQ = errorMiddleware(async (req, res) => {
  const { businessId } = req.params;
  const Limit = LIMIT;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const faqs = await DetectedFAQ.find({ businessId }).skip(skip).limit(limit);
  const total = await DetectedFAQ.find({ businessId }).count();

  return res.status(200).json({
    message: "Records fetched",
    data: faqs,
    currentPage: page,
    limit,
    pages: Math.ceil(total / limit),
    total,
  });
});

module.exports.replyNewlyDetectedFAQ = errorMiddleware(async (req, res) => {
  let { faqId } = req.params;
  let { reply } = req.body;
  const { id } = req.user;
  let errors = validationResult(req);

  // req body validation
  if (!errors.isEmpty()) {
    let validationErrors = [];
    for (const error of errors.array()) {
      validationErrors.push({ field: error.path, message: error.msg });
    }

    return res
      .status(400)
      .json({ message: "Bad response", data: validationErrors });
  }

  const faq = await DetectedFAQ.findOne({ faqId });

  if (!faq) {
    return res.status(404).json({ message: "Record not found", data: faq });
  }

  const business = await Business.findOne({ businessId: faq.businessId });

  // check that this user is a member of the business team
  const isBusinessMember = isMemberOfBusiness(business, id);

  if (!isBusinessMember) {
    return res.status(403).json({
      message: "You do not possess the permission to access this route",
      data: null,
    });
  }

  faq.response = reply;

  await faq.save();

  const originalFaqs = await KnowledgeBase.findOne({
    businessId: faq.businessId,
  });

  // update knowledgebase existing FAQs with the new one
  originalFaqs.faqs = [
    ...originalFaqs.faqs,
    { question: faq.question, response: faq.response },
  ];

  await originalFaqs.save();

  // delete detected FAQ from collection
  await DetectedFAQ.findOneAndDelete({ faqId });

  return res.status(200).json({
    message: "Your new FAQ has been updated and moved to your knowledge base",
    data: originalFaqs,
  });
});
