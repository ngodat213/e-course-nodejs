const mongoose = require('mongoose');

const cloudinaryFileSchema = new mongoose.Schema({
    // ID của đối tượng sở hữu file (user_id, course_id, exam_id...)
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "owner_type",
    },

    // Loại đối tượng sở hữu file
    owner_type: {
        type: String,
        required: true,
        enum: ["User", "Course", "Exam", "Lesson"],
    },

    // Loại file
    file_type: {
        type: String,
        required: true,
        enum: ["image", "video", "document"],
    },

    // Mục đích sử dụng của file
    purpose: {
        type: String,
        required: true,
        enum: ["avatar", "thumbnail", "content", "attachment"],
    },

    // Tên gốc của file
    original_name: {
        type: String,
        required: true,
    },

    // URL của file trên Cloudinary
    file_url: {
        type: String,
        required: true,
        select: false // Không trả về trong response mặc định
    },

    // Public ID của file trên Cloudinary
    public_id: {
        type: String,
        required: true,
        unique: true,
    },

    // Kích thước file (bytes)
    size: {
        type: Number,
        required: true,
    },

    // Định dạng file
    format: {
        type: String,
        required: true,
    },

    // Metadata bổ sung
    metadata: {
        width: Number, // Cho ảnh
        height: Number, // Cho ảnh
        duration: Number, // Cho video
        pages: Number, // Cho document
    },

    // Trạng thái
    status: {
        type: String,
        enum: ["active", "deleted"],
        default: "active",
    },
}, {
    timestamps: true,
});

// Indexes
cloudinaryFileSchema.index({ owner_id: 1, owner_type: 1, purpose: 1 });
cloudinaryFileSchema.index({ public_id: 1 }, { unique: true });

// Đảm bảo mỗi đối tượng chỉ có 1 avatar/thumbnail
cloudinaryFileSchema.pre("save", async function (next) {
    if (this.purpose === "avatar" || this.purpose === "thumbnail") {
        await this.constructor.updateMany(
            {
                owner_id: this.owner_id,
                owner_type: this.owner_type,
                purpose: this.purpose,
                _id: { $ne: this._id },
                status: "active",
            },
            { status: "deleted" }
        );
    }
    next();
});

// Virtual để lấy URL đầy đủ
cloudinaryFileSchema.virtual("full_url").get(function () {
    return `${process.env.API_URL}/api/files/${this._id}`;
});

// Cập nhật reference khi file bị xóa
cloudinaryFileSchema.pre("save", async function (next) {
    if (this.isModified("status") && this.status === "deleted") {
        const Model = mongoose.model(this.owner_type);
        
        if (this.purpose === "avatar") {
            await Model.findByIdAndUpdate(this.owner_id, {
                profile_picture: null,
            });
        } else if (this.purpose === "thumbnail") {
            await Model.findByIdAndUpdate(this.owner_id, {
                thumbnail_file: null,
            });
        }
    }
    next();
});

module.exports = mongoose.model('CloudinaryFile', cloudinaryFileSchema); 