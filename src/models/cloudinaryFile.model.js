const mongoose = require('mongoose');

const cloudinaryFileSchema = new mongoose.Schema({
    file_url: {
        type: String,
        required: true
    },
    file_type: {
        type: String,
        enum: ['image', 'video', 'document'],
        required: true
    },
    uploaded_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CloudinaryFile', cloudinaryFileSchema); 