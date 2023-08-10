const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    businessId: {
        type: String,
        required: true,
        minlength: 1,
        unique: true
    },
    companyName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        unique: true
    },
    departments: {
        type: [String],
        required: true,
        minlength: 1,
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

const Business = mongoose.model('Business', schema);

exports.Business = Business;