const event = require("events");
const Invitation = require("../user/invitationModel");
const { Business } = require("../business/businessModel");

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

eventEmitter.on("notifyNewChat", async (data) => {
  const team = data.team;

});

module.exports = eventEmitter;
