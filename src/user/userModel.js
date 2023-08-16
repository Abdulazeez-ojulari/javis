const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minlength: 3,
        maxlength: 50,
        required: true
    },
    lastName: {
        type: String,
        minlength: 3,
        maxlength: 50,
        required: true
    },
    email: {
        type: String,
        minlength: 3,
        maxlength: 255,
        required: true
    },
    role: {
        type: String,
        minlength: 3,
        maxlength: 255,
        // required: true,
    //     enum: ['executive creative director', 
    //     'creative director', 
    //     'deputy creative director',
    //     'head of design',
    //     'group head team lead',
    //     'senior manager',
    //     'manager',
    //     'deputy manager',
    //     'assistant manager',
    //     'assistant manager trainee',
    //     'management trainee',
    //     'intern',
    // ]
    },
    // department: {
    //     type: String,
    //     minlength: 3,
    //     maxlength: 255,
    //     required: true,
    //     // enum: ['creative', 'brand', 'hr admin', 'finance', 'media 100']
    // },
    password: {
        type: String,
        minlength: 8,
        maxlength: 1024,
        required: true
    },
    // passwordResetToken: {
    //     type: String,
    //     minlength: 8,
    //     maxlength: 1024
    // },
    // password: {
    //     type: Date
    // },
    // userAddress: {
    //     type: String,
    //     minlength: 10,
    //     maxlength: 1024
    // },
    // userPhoneNo: {
    //     type: String,
    //     minlength: 7,
    //     maxlength: 15
    // },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAdmin: {
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
    isActive: {
        type: Boolean,
        default: true
    },
})

userSchema.method('toJson',function() {
    const {__v, _id, ...object } = this.toObject();
    object.id = _id;
    return object
});

userSchema.methods.generateToken = function() {
    const token = jwt.sign({ id: this.id, isVerified: this.isVerified, isAdmin: this.isAdmin}, process.env.ENIF_SECRET)
    return token;
}

const User = mongoose.model('User', userSchema);

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        default: Date.now(),
        index: {
            expires: 86400000
        }
    }
})

userSchema.method('toJson',function() {
    const {__v, _id, ...object } = this.toObject();
    object.id = _id;
    return object
});

const Token = mongoose.model('Token', tokenSchema);



exports.User = User;
exports.Token = Token;