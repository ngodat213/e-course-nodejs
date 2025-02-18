const mongoose = require('mongoose');

const socketSessionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    session_id: {
        type: String,
        required: true,
        unique: true
    },
    connected_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SocketSession', socketSessionSchema); 