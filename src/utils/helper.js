exports.mailSource = '"Enif" <enif@hello.com>';
exports.sourceMail = "enif@hello.com";
exports.mailTransporterObj = {
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
};
