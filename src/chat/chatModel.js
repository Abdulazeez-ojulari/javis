const mongoose = require('mongoose');
const message = new mongoose.Schema({ 
    role: String, 
    content: String, 
    created_date: {
        type: Date,
        required: true,
        default: Date.now()
    } 
})

let schema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true,
        minlength: 1,
        unique: true
    },
    businessId: {
        type: String,
        required: true,
        minlength: 1
    },
    customer: {
        type: String,
        minlength: 3,
        maxlength: 50,
    },
    messages: {
        type: [message],
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    escalated:{
        type: Boolean,
        default: false
    },
    sentiment: {
        type: String,
        default: 'Neutral'
    },
    channel: {
        type: String,
        required: true,
        minlength: 1,
    },
    category: {
        type: String,
    },
    type: {
        type: String,
    },
    department: {
        type: String,
    },
    escalation_department: {
        type: String,
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

const Chat = mongoose.model('Chat', schema);

exports.Chat = Chat;