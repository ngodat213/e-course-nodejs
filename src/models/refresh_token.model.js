const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expires_at: {
        type: Date,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    revoked: {
        type: Boolean,
        default: false
    },
    replaced_by: {
        type: String,
        default: null
    }
});

// Index để tìm kiếm và cleanup tokens hết hạn
refreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user_id: 1, revoked: 1 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema); 