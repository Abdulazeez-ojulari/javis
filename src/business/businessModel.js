const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  department: {
    type: String,
  },
  role: {
    type: String,
    default: "member",
  },
}, { timestamps: true});

const gmailSchema = new mongoose.Schema({
  isConfigured: {
    type: Boolean,
    required: true,
    default: false,
  },
  code: {
    type: String,
  },
  access_token: {
    type: String,
  },
  refresh_token: {
    type: String,
  },
});

let schema = new mongoose.Schema({
  businessId: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  businessName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    unique: true,
  },
  industry: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  phoneNo: {
    type: String,
    minlength: 7,
  },
  address: {
    type: String,
    required: true,
    minlength: 3,
  },
  bankName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  accountNo: {
    type: String,
    required: true,
    minlength: 3,
  },
  description: {
    type: String,
    required: true,
    minlength: 3,
  },
  ownerName: {
    type: String,
    minlength: 3,
    maxlength: 50,
  },
  ownerPhoneNo: {
    type: String,
    minlength: 7,
  },
  ownwerEmail: {
    type: String,
    minlength: 3,
    maxlength: 255,
  },
  instagramHandle: {
    type: String,
    minlength: 3,
    maxlength: 255,
  },
  facebookHandle: {
    type: String,
    minlength: 3,
    maxlength: 255,
  },
  twitterHandle: {
    type: String,
    minlength: 3,
    maxlength: 255,
  },
  companyInformation: {
    type: Object,
  },
  teams: {
    type: [teamSchema],
    required: true,
  },
  aiMode: {
    type: String,
    default: "auto",
    enum: ["auto", "hybrid", "supervised"],
  },
  plan: {
    type: String,
    enum: ["monthly", "quaterly", "annually"],
  },
  departments: {
    type: [String],
    required: true,
    minlength: 1,
  },
  gmail: {
    type: gmailSchema,
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
}, { timestamps: true});

schema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const Business = mongoose.model("Business", schema);

// const Team = mongoose.model("Team", teamSchema);

// exports.Team = Team;

exports.Business = Business;
