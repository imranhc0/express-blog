const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'is invalid']
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);

