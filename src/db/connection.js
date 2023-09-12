require("dotenv").config();
const mongoose = require("mongoose");
module.exports = function () {
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to mongo db");
    })
    .catch((err) => {
      console.log("could not connect to db " + err);
      console.log(err);
    });
};
