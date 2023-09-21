const event = require("events");
const Invitation = require("../user/invitationModel");
const { Business } = require("../business/businessModel");
const Notification = require("../notification/notification.model");
const { v4 } = require("uuid");

const eventEmitter = new event.EventEmitter();

eventEmitter.on("acknowledgeInvitation", async (user) => {
  const { _id, email } = user;
  const invitations = await Invitation.find({ email });
  let business;
  // console.log(_id, invitations);
  for (const invitation of invitations) {
    business = await Business.findOne({ businessId: invitation.businessId });
    // console.log(business);
    business.teams.push({ userId: _id.toString(), role: "member" });
    await business.save();
  }
});

eventEmitter.on(
  "notifyNewChat",
  async ({ businessId, customer, email, channel, phoneNo }) => {
    const business = await Business.findOne({ businessId: businessId });
    const recipients = business.teams.map((team) => team.userId);
    const id = v4() + "-" + v4();
    const notification = new Notification({
      notificationId: id,
      message: "A new chat has just been initiated",
      metaData: JSON.stringify({
        businessId,
        customer,
        email,
        channel,
        phoneNo,
      }),
      recipients: recipients,
    });
    notification.save();
  }
);

eventEmitter.on(
  "notifyNewChatMessage",
  async ({ ticketId, email, businessId, channel, customer, promptMsg }) => {
    const business = await Business.findOne({ businessId: businessId });
    const recipients = business.teams.map((team) => {
      // console.log(team);
      return team.userId;
    });
    const id = v4() + "-" + v4();
    const notification = new Notification({
      notificationId: id,
      message: "A new chat has just been initiated",
      metaData: JSON.stringify({
        ticketId,
        email,
        businessId,
        channel,
        customer,
        promptMsg,
      }),
      recipients: recipients,
    });
    await notification.save();
  }
);

module.exports = eventEmitter;
