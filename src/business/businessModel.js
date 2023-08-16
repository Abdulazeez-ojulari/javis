const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    department: {
        type: String,
    },
    role: {
        type: String,
        default: "Member"
    }
})

let schema = new mongoose.Schema({
    businessId: {
        type: String,
        required: true,
        minlength: 1,
        unique: true
    },
    businessName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        unique: true
    },
    teams: {
        type: [teamSchema],
        required: true,
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