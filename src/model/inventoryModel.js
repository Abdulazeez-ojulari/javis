const mongoose = require("mongoose");

let schema = new mongoose.Schema({
    knowledgeBaseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "KnowledgeBase",
      minlength: 1,
    },
    name: {
      type: String,
      required: true,
      minlength: 1,
    },
    image: {
      type: String,
      required: true,
      minLength: 1,
    },
    quantity: {
      type: String,
      required: true,
      minlength: 1,
    },
    category: {
      type: String,
      required: true,
      minlength: 1,
    },
    price: {
      type: String,
      required: true,
      minlength: 1,
    },
    currency: {
      type: String,
      // required: true,
      minlength: 1,
    },
    status: {
      type: String,
      required: true,
      minlength: 1,
    },
    more: {
      type: Object,
    },
    embeddings: {
        type: Object,
        required: true,
    },
    
},  {timestamps: true});

schema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const Inventory = mongoose.model("Inventory", schema);

exports.Inventory = Inventory;
