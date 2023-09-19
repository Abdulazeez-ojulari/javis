const mongoose = require('mongoose');
const message = new mongoose.Schema({ 
    role: String, 
    content: String,
    status: {
        type: String,
        required: true,
        default: 'sent'
    }, 
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
    email: {
        type: String,
        minlength: 3,
        maxlength: 255,
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
    phoneNo: {
        type: String,
        minlength: 7,
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
        default: null
    },
    type: {
        type: String,
        default: null
    },
    department: {
        type: String,
        default: null
    },
    escalation_department: {
        type: String,
        default: null
    },
    titles: {
        type: [String],
    },
    title: {
        type: String,
    },
    isCompleted: {
        type: Boolean,
        default: false
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
}, { timestamps: true });

schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Chat = mongoose.model('Chat', schema);

exports.Chat = Chat;