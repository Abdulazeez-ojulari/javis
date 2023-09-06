const paystack = require("paystack")(process.env.PAYSTACK_SECRET);

module.exports = paystack;
