const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    receive_notifications: {
        type: Boolean,
        default: true
    },
    dark_mode: {
        type: Boolean,
        default: false
    },
    language: {
        type: String,
        enum: ['en', 'vi'],
        default: 'en'
    },
    autoplay_videos: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserSettings', userSettingsSchema); 