const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  invitationId: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
  },
  email: {
    type: String,
    minlength: 3,
    maxlength: 255,
    required: true,
  },
  businessId: {
    type: String,
    required: true,
    minlength: 1,
  },
  inviter: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  created_date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  update_date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

schema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const Invitation = new mongoose.model("Invitation", schema);

module.exports = Invitation;
