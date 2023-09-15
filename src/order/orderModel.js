const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    businessId: {
        type: String,
        required: true,
        minlength: 1,
    },
    ticketId: {
        type: String,
        required: true,
        minlength: 1,
    },
    email: {
        type: String,
        required: true,
        minlength: 1,
    },
    customer: {
        type: String,
        required: true,
        minlength: 1,
    },
    items: {
        type: [Object],
    },
    status: {
        type: String,
        default: "pending"
    },
    created_date: {
		type: Date,
		required: true,
        default: Date.now()
	},
	update_date: {
		type: Date,
		required: true,
        default: Date.now()
	},
});

schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Order = mongoose.model('Order', schema);

exports.Order = Order;