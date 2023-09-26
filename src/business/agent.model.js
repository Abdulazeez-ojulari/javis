const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Business",
    },
    agentName: {
      type: String,
      minlength: 1,
      maxlength: 50,
    },
  },
  { timestamps: true }
);

schema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const Agent = mongoose.model("Agent", schema);

Agent.syncIndexes();

module.exports.Agent = Agent;
