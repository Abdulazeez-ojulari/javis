const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    businessId: {
        type: String,
        required: true,
        minlength: 1,
        unique: true
    },
    faqs: {
        type: [Object],
    },
    knowledgeBase: {
        type: Object,
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

const KnowledgeBase = mongoose.model('KnowledgeBase', schema);

exports.KnowledgeBase = KnowledgeBase;