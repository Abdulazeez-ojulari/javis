const nodeMailer = require("nodemailer");
const { mailTransporterObj, mailSource, sourceMail } = require("../helper");
const Email = require("email-templates");
const Path = require("path");
const { dirname } = require("path");
const transporter = nodeMailer.createTransport(mailTransporterObj);
const email = new Email({
  views: {
    root: Path.join(__dirname, "email_templates"),
    options: { extension: "ejs" },
  },
  message: {
    from: `${mailSource}`,
  },
  transport: transporter,
  send: true,
  preview: true,
  // preview: {
  //   open: {
  //     app: "firefox",
  //     wait: false,
  //   },
  // },
  preview: false,
});

class Mailer {
  static sendInvitationMail({
    recipient,
    hasAccount,
    businessName,
    inviterName,
    inviteeEmail,
  }) {
    email
      .send({
        template: Path.join(__dirname, "email_templates", "invitation"),
        message: { to: recipient },
        locals: {
          recipient: recipient,
          frontendUrl: process.env.FRONTEND_URL,
          hasAccount,
          businessName,
          inviterName,
          inviteeEmail,
        },
      })
      .then((res) => console.log(res))
      .catch((res) => console.log(res));
  }
}

module.exports = Mailer;
