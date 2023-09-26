const { KnowledgeBase } = require("../knowledgeBase/knowledgeBaseModel");
const errorMiddleware = require("../middlewares/error");
const { User } = require("../user/userModel");
const { Business } = require("./businessModel");
const { Agent } = require("./agent.model");
const {
  createBusinessService,
  updateBusinessService,
} = require("./businessService");
const { isMemberOfBusiness } = require("../utils/helper");
const { validationResult } = require("express-validator");

module.exports.createBusiness = errorMiddleware(async (req, res) => {
  const {
    userId,
    businessName,
    industry,
    phoneNo,
    address,
    bankName,
    accountNo,
    description,
    ownerName,
    ownerPhoneNo,
    ownwerEmail,
    instagramHandle,
    facebookHandle,
    twitterHandle,
    companyInformation,
    departments,
    supportEmail,
  } = req.body;

  const user = await User.findOne({ userId: userId });
  if (!user) {
    return res.status(400).send({ message: "User doesn't exists" });
  }

  const business = await Business.findOne({ businessName: businessName });
  if (business) {
    return res.status(400).send({ message: "Business already exists" });
  }

  let newBusiness = await createBusinessService(
    businessName,
    industry,
    phoneNo,
    address,
    bankName,
    accountNo,
    description,
    ownerName,
    ownerPhoneNo,
    ownwerEmail,
    instagramHandle,
    facebookHandle,
    twitterHandle,
    companyInformation,
    departments,
    user,
    supportEmail
  );
  return res.send(newBusiness);
});

module.exports.updateBusiness = errorMiddleware(async (req, res) => {
  const {
    userId,
    businessId,
    industry,
    phoneNo,
    address,
    bankName,
    accountNo,
    description,
    ownerName,
    ownerPhoneNo,
    ownwerEmail,
    instagramHandle,
    facebookHandle,
    twitterHandle,
    departments,
    companyInformation,
    aiMode,
    plan,
    gmail,
    supportEmail,
  } = req.body;

  let data = {};

  const user = await User.findOne({ userId: userId });
  if (!user) {
    return res.status(400).send({ message: "User doesn't exists" });
  }

  const business = await Business.findOne({ businessId: businessId });
  if (!business) {
    return res.status(404).send({ message: "Business doesn't exists" });
  }

  let teams = business.teams.map((team) => {
    if (team.userId == user.id && team.role == "owner") return team;
  });

  if (teams.length <= 0) {
    return res.status(400).send({ message: "Team member not authorized" });
  }

  data["businessId"] = businessId;

  if (industry) data["industry"] = industry;

  if (phoneNo) data["phoneNo"] = phoneNo;

  if (address) data["address"] = address;

  if (bankName) data["bankName"] = bankName;

  if (accountNo) data["accountNo"] = accountNo;

  if (description) data["description"] = description;

  if (ownerName) data["ownerName"] = ownerName;

  if (ownerPhoneNo) data["ownerPhoneNo"] = ownerPhoneNo;

  if (ownwerEmail) data["ownwerEmail"] = ownwerEmail;

  if (instagramHandle) data["instagramHandle"] = instagramHandle;

  if (facebookHandle) data["facebookHandle"] = facebookHandle;

  if (twitterHandle) data["twitterHandle"] = twitterHandle;

  if (aiMode) data["aiMode"] = aiMode;

  if (departments && departments.length > 0) data["departments"] = departments;

  if (companyInformation) data["companyInformation"] = companyInformation;

  if (aiMode) data["aiMode"] = aiMode;

  if (plan) data["plan"] = plan;

  if (gmail) data["gmail"] = gmail;

  if (supportEmail) data["supportEmail"] = supportEmail;

  let updatedBusiness = await updateBusinessService(data);
  return res.send(updatedBusiness);
});

module.exports.getBusiness = errorMiddleware(async (req, res) => {
  let { businessId } = req.params;
  const user = await User.findOne({ userId: req.user.userId });
  if (!user) {
    return res.status(400).send({ message: "User doesn't exists" });
  }

  const business = await Business.findOne({ businessId: businessId });
  if (!business) {
    return res.status(404).send({ message: "Business doesn't exists" });
  }

  let teams = business.teams.map((team) => {
    if (team.userId == user.id && team.role == "owner") return team;
  });

  if (teams.length <= 0) {
    return res.status(400).send({ message: "Team member not authorized" });
  }

  let knowledgeBase = await KnowledgeBase.findOne({ businessId: businessId });

  // let teams = await business.populate(business.teams[0].userId)

  let data = {
    business: business,
    knowledgeBase: knowledgeBase,
  };

  return res.send(data);
});

module.exports.getBusinessFaqs = errorMiddleware(async (req, res) => {
  let { businessId } = req.params;

  const business = await Business.findOne({ businessId: businessId });
  if (!business) {
    return res.status(404).send({ message: "Business doesn't exists" });
  }

  let knowledgeBase = await KnowledgeBase.findOne({ businessId: businessId });

  return res.send(knowledgeBase.faqs);
});

module.exports.getAllBusiness = errorMiddleware(async (req, res) => {
  let { gmail } = req.query;
  let businesses = await Business.find();

  // gmail is true, only fetch business where the gmail field is valid or exists
  if (gmail && gmail.toLowerCase() === "true") {
    businesses = await Business.find({ gmail: { $exists: true } });
  }

  return res.send({
    message: "All businesses fetched successfully ",
    data: businesses,
  });
});

module.exports.createAgent = errorMiddleware(async (req, res) => {
  const { id } = req.user;
  let { businessId } = req.params;
  const { agentName } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors = [];
    for (const error of errors.array()) {
      validationErrors.push({ field: error.path, message: error.msg });
    }
    return res
      .status(400)
      .json({ message: "Bad request", data: validationErrors });
  }
  console.log(businessId);

  const business = await Business.findOne({ businessId });

  if (!business) {
    return res
      .status(404)
      .json({ message: "Business not found", data: business });
  }

  const isMember = isMemberOfBusiness(business, id);

  if (!isMember) {
    return res.status(403).json({
      message: "You do not possess the permission to access this resource",
    });
  }

  const agent = new Agent({ businessId: business._id, agentName });

  await agent.save();

  return res.send({
    message: "Agent created successfully",
    data: agent,
  });
});

module.exports.getAgents = errorMiddleware(async (req, res) => {
  const { id } = req.user;
  let { businessId } = req.params;
  // const business = await Business.findOne({ businessId }).populate("agents");
  const business = await Business.findOne({ businessId }).select("teams _id");

  if (!business) {
    return res
      .status(404)
      .json({ message: "Business not found", data: business });
  }
  const isMember = isMemberOfBusiness(business, id);

  if (!isMember) {
    return res.status(403).json({
      message: "You do not possess the permission to access this resource",
    });
  }

  const agents = await Agent.find({ businessId: business._id });

  return res.send({
    message: "All businesses fetched successfully ",
    data: agents,
  });
});
