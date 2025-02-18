const mongoose = require('mongoose');

const cloudinaryFileSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    file_type: {
        type: String,
        enum: ['image', 'video', 'document'],
        required: true
    },
    original_name: {
        type: String,
        required: true
    },
    file_url: {
        type: String,
        required: true,
        select: false // Không trả về URL trong queries mặc định
    },
    public_id: {
        type: String,
        required: true,
        unique: true
    },
    secure_url: {
        type: String,
        required: true,
        select: false
    },
    thumbnail_url: {
        type: String,
        select: false
    },
    size: {
        type: Number,
        required: true
    },
    format: {
        type: String,
        required: true
    },
    resource_type: {
        type: String,
        required: true
    },
    folder: {
        type: String,
        required: true
    },
    is_avatar: {
        type: Boolean,
        default: false
    },
    metadata: {
        width: Number,
        height: Number,
        duration: Number, // For videos
        pages: Number // For documents
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Index để tìm kiếm nhanh
cloudinaryFileSchema.index({ user_id: 1, file_type: 1 });
cloudinaryFileSchema.index({ public_id: 1 }, { unique: true });

// Virtual để tạo signed URL an toàn
cloudinaryFileSchema.virtual('signed_url').get(function() {
    // Tạo signed URL với thời hạn
    return `${process.env.API_URL}/api/files/${this._id}`;
});

// Middleware để đảm bảo chỉ có 1 avatar
cloudinaryFileSchema.pre('save', async function(next) {
    if (this.is_avatar) {
        await this.constructor.updateMany(
            { 
                user_id: this.user_id,
                is_avatar: true,
                _id: { $ne: this._id }
            },
            { is_avatar: false }
        );
    }
    next();
});

module.exports = mongoose.model('CloudinaryFile', cloudinaryFileSchema); 