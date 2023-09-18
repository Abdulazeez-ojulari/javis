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
exports.generateTransactionReference = (prefix = "TXN") => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `${prefix}-${timestamp}-${randomNum}`;
};

exports.calculateExpirationDate = (frequency, currentDate) => {
  let result;

  if (frequency.toLowerCase() === "annually") {
    // Calculate the annual date (1 year from the current date)
    const annualDate = new Date(currentDate);
    annualDate.setFullYear(currentDate.getFullYear() + 1);
    result = annualDate.toDateString();
  } else if (frequency.toLowerCase() === "quarterly") {
    // Calculate quarterly dates (3 months from the current date)
    for (let i = 0; i < 4; i++) {
      const quarterDate = new Date(currentDate);
      quarterDate.setMonth(currentDate.getMonth() + i * 3);
      result = quarterDate.toDateString();
    }
  } else if (frequency.toLowerCase() === "monthly") {
    // Calculate the monthly date (1 month from the current date)
    const monthlyDate = new Date(currentDate);
    monthlyDate.setMonth(currentDate.getMonth() + 1);
    result = monthlyDate.toDateString();
  } else {
    throw new Error(
      'Invalid frequency. Please use "annual", "quarterly", or "monthly".'
    );
  }

  return result;
};

exports.getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

exports.stringToLowerCase = (string) => {
  if (typeof string === "string") {
    return string.toLowerCase();
  }
  return "";
};

exports.extractNameAndEmail = (str) => {
  if (!str || str === "") {
    return ["", ""];
  }
  let split = str.split("<");
  let name = split[0];
  let email = split[1].slice(0, -1);

  return [name, email];
};
