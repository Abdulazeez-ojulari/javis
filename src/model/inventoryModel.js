const mongoose = require("mongoose");

let schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        unique: true,
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
    }
    
},  {timestamps: true});

schema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const Inventory = mongoose.model("Inventory", schema);

exports.Inventory = Inventory;
