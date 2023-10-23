const mongoose = require("mongoose");

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
  historyId: {
    type: String,
  },
});

const BusinessSchema = new mongoose.Schema(
  {
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
    supportEmail: {
      type: String,
      minlength: 3,
      maxlength: 255,
      unique: true,
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
    aiMode: {
      type: String,
      default: "auto",
      enum: ["auto", "hybrid", "supervised"],
    },
    plan: {
      type: String,
      enum: ["monthly", "quaterly", "annually"],
    },
    paid: {
      type: Boolean,
      default: false
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
    id: {}
  },
  { timestamps: true }
);

BusinessSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const Business = mongoose.model("Business", BusinessSchema);

// const Team = model("Team", teamSchema);

// exports.Team = Team;

BusinessSchema.virtual("agents", {
  ref: "Agent",
  localField: "_id",
  options: { sort: { createdAt: -1 } },
  // justOne: true,
  limit: 5,
  foreignField: "businessId",
});

exports.Business = Business;
