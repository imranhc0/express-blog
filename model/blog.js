const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userID: { 
        type: mongoose.SchemaTypes.ObjectId, 
        ref: 'User', 
        required: true 
    },
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        required: true, 
    },
    imageUrl: { 
        type: String, 
        trim: true 
    },
    tags: [{ 
        type: String, 
        trim: true 
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
