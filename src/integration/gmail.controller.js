const errorMiddleware = require("../middlewares/error");
const Gmail = require("./gmailModel");
const { v4: uuidV4 } = require("uuid");
const { LIMIT } = require("../utils/const");
const { getPagination } = require("../utils/helper");

exports.persistGoogleMails = errorMiddleware(async (req, res) => {
  const { emails } = req.body;
  const uuid = uuidV4();
  console.log(emails);
  for (const mail of emails) {
    new Gmail({
      emailId: uuid,
      gmailMailId: mail.emailId,
      to: mail.to,
      from: mail.from,
      subject: mail.subject,
      mailContent: mail.body,
      businessId: mail.businessId,
      mailSnippet: mail.snippet,
      enifResponseDate: mail.mailSentDate,
      mailThreadId: mail.threadId,
      mailSentDate: mail.mailSentDate,
      channel: "gmail",
    });
  }
});

exports.getBusinessGmails = errorMiddleware(async (req, res) => {
  const { page } = req.query;
  const { businessId } = req.params;
  const pageNumber = page || 0;
  const limit = LIMIT || 10;
  const result = {};
  const totalMails = await Gmail.find({ businessId }).count();
  let startIndex = pageNumber * limit;
  const endIndex = (pageNumber + 1) * limit;
  result.totalMails = totalMails;
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
    .json({ message: "Mails fetched successfully", data: result });
});
