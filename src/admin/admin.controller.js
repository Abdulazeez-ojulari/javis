const { validationResult } = require("express-validator");
const { Business } = require("../business/businessModel");
const { User } = require("../user/userModel");
const { Chat } = require("../chat/chatModel");
const errorMiddleWare = require("../middlewares/error");
const Invitation = require("../user/invitationModel");
const uuid = require("uuid");
const Mailer = require("../utils/mailer/mailer");
const s3 = require("../utils/aws");

// const isThisAdminMemberOfBusiness = async function (businessId, adminId) {
//   return await business.teams.filter(
//     (team) =>
//       team.userId.toString() === user.id &&
//       (team.role === "admin" || team.role === "owner")
//   );
// };

exports.removeAdmin = errorMiddleWare(async (req, res) => {
  const { businessId, adminId } = req.params;
  const user = req.user;
  const business = await Business.findOne({ businessId: businessId });
  if (!business) {
    return res.status(404).json({ message: "Invalid business ID provided" });
  }

  /* checks that admin initiating the admin delete request is a member of the business
  and that role is either admin or owner*/
  const isThisAdminMemberOfBusiness = business.teams.filter(
    (team) =>
      team.userId.toString() === user.id &&
      (team.role === "admin" || team.role === "owner")
  );

  if (isThisAdminMemberOfBusiness.length <= 0) {
    return res.status(403).json({
      message: "You do not possess the permission to access this route",
    });
  }

  const adminIndex = business.teams.findIndex(
    (team) => team._id.toString() === adminId
  );

  if (adminIndex === -1) {
    // throw new Error("Team not found in the business");
    return res
      .status(404)
      .json({ message: "Admin is not a valid member on the team" });
  }

  // return res.send({
  //   isThisAdminMemberOfBusiness,
  //   userId: user.id,
  //   team: business.teams,
  // });

  // Remove the admin from the 'teams' array
  business.teams.splice(adminIndex, 1);

  // Save the updated business document
  await business.save();

  return res
    .status(200)
    .json({ message: "Team removed from the business successfully" });
});

exports.inviteMember = errorMiddleWare(async (req, res) => {
  const errors = validationResult(req);
  const { businessId } = req.params;
  const user = req.user;
  const business = await Business.findOne({ businessId: businessId }).populate(
    "teams.userId"
  );

  const { inviteeEmail } = req.body;

  if (!errors.isEmpty()) {
    let validationErrors = [];
    for (const error of errors.array()) {
      validationErrors.push({ field: error.path, message: error.msg });
    }

    return res
      .status(400)
      .json({ message: "Bad Request", data: validationErrors });
  }

  const inviter = await User.findOne({ userId: user.userId }).select(
    "firstName lastName"
  );

  if (!business) {
    return res.status(404).json({ message: "Invalid business ID provided" });
  }
  // return res.send(business);

  /* checks that admin initiating the admin delete request is a member of the business
  and that role is either admin or owner*/
  const isThisAdminMemberOfBusiness = business.teams.filter((team) => {
    // console.log(team.userId._id.toString());
    return (
      team.userId._id.toString() === user.id &&
      (team.role === "admin" || team.role === "owner")
    );
  });

  if (isThisAdminMemberOfBusiness.length <= 0) {
    return res.status(403).json({
      message: "You do not possess the permission to access this route",
    });
  }

  const isUserAlreadyTeamMember = business.teams.filter(
    (team) => team.userId.email.toLowerCase() === inviteeEmail.toLowerCase()
  );

  if (isUserAlreadyTeamMember.length > 0) {
    return res
      .status(200)
      .json({ message: "Invitee is already a member of the business" });
  }

  const isUserOnPlatform = await User.findOne({ email: inviteeEmail });

  if (isUserOnPlatform) {
    // teams = [
    //   ...business.teams,
    //   { userId: isUserOnPlatform._id, role: "member" },
    // ];
    business.teams.push({ userId: isUserOnPlatform._id, role: "member" });
    await business.save();
    Mailer.sendInvitationMail({
      recipient: inviteeEmail,
      hasAccount: true,
      businessName: business.businessName,
      inviterName: `${inviter.firstName} ${inviter.lastName}`,
      inviteeEmail,
    });
    return res.json({
      message: "New member added to business successfully",
      data: business,
    });
  }

  let invitation = await Invitation.findOne({
    email: inviteeEmail,
    businessId,
    // inviter: user.id,
  });

  if (invitation) {
    return res.status(422).json({
      message: "An invitation has already been sent to this email address",
      data: invitation,
    });
  }

  // console.log(inviteeEmail, req.user);
  const id = uuid.v4() + uuid.v4();

  invitation = new Invitation({
    invitationId: id,
    email: inviteeEmail,
    businessId,
    inviter: user.id,
  });

  await invitation.save();

  Mailer.sendInvitationMail({
    recipient: inviteeEmail,
    hasAccount: false,
    businessName: business.businessName,
    inviterName: `${inviter.firstName} ${inviter.lastName}`,
    inviteeEmail,
  });

  // send the invitation mail

  return res.status(200).json({
    message: "Invitation to business sent successfully",
    data: invitation,
  });
});

exports.inventoryImagesUpload = errorMiddleWare(async (req, res) => {
  const { businessId } = req.params;
  const user = req.user;
  const business = await Business.findOne({ businessId: businessId });
  const files = req.files;
  const folder = "inventory";
  const uploadedUrls = [];
  if (!business) {
    return res.status(404).json({ message: "Invalid business ID provided" });
  }

  /* checks that admin initiating the admin delete request is a member of the business
  and that role is either admin or owner*/
  const isThisAdminMemberOfBusiness = business.teams.filter(
    (team) =>
      team.userId.toString() === user.id &&
      (team.role === "admin" || team.role === "owner")
  );

  if (isThisAdminMemberOfBusiness.length <= 0) {
    return res.status(403).json({
      message: "You do not possess the permission to access this route",
    });
  }

  if (!files || files.length <= 0) {
    return res
      .status(400)
      .json({ message: "You must at least upload one image" });
  }

  // upload images to s3 bucket
  for (const file of files) {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: `${folder}/${user.userId}-${file.originalname}`,
      Body: file.buffer,
    };

    // const uploadResult = await s3.putObject(params).promise();
    const uploadResult = await s3.upload(params).promise();
    
    uploadedUrls.push(uploadResult.Location);
  }
  // console.log(uploadedUrls);

  // const s3Response = await Promise.all(promises);

  return res.status(200).json({
    message: "Inventory images uploaded successfully",
    data: uploadedUrls,
  });
});

exports.resolveTicket = errorMiddleWare(async (req, res) => {
  const { businessId, chatId } = req.params;
  const user = req.user;
  const business = await Business.findOne({ businessId: businessId });
  if (!business) {
    return res.status(404).json({ message: "Invalid business ID provided" });
  }

  /* checks that admin initiating the resolve ticket request is a member of the business
  and that role is either admin or owner*/
  const isThisAdminMemberOfBusiness = business.teams.filter(
    (team) =>
      team.userId.toString() === user.id &&
      (team.role === "admin" || team.role === "owner")
  );

  if (isThisAdminMemberOfBusiness.length <= 0) {
    return res.status(403).json({
      message: "You do not possess the permission to access this route",
    });
  }

  const chat = await Chat.findOne({ businessId, chatId });

  if (!chat) {
    return res.status(404).json({ message: "Chat not found", data: chat });
  }

  chat.escalated = false;

  await chat.save();

  return res
    .status(200)
    .json({ message: "Ticket resolved successfully", data: chat });
});
