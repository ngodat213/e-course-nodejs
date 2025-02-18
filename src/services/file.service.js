const CloudinaryFile = require('../models/cloudinary_file.model');
const CloudinaryService = require('./cloudinary.service');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const i18next = require('i18next');

class FileService {
    async uploadFile(file, userId, options = {}) {
        const {
            file_type = 'image',
            is_avatar = false,
            folder = 'uploads'
        } = options;

        // Upload to Cloudinary
        const uploadResult = await CloudinaryService.upload(file, {
            folder,
            resource_type: this._getResourceType(file_type),
            ...this._getTransformOptions(file_type, is_avatar)
        });

        // Save file info
        const fileDoc = await CloudinaryFile.create({
            user_id: userId,
            file_type,
            original_name: file.originalname,
            file_url: uploadResult.url,
            public_id: uploadResult.public_id,
            secure_url: uploadResult.secure_url,
            thumbnail_url: uploadResult.thumbnail_url,
            size: uploadResult.bytes,
            format: uploadResult.format,
            resource_type: uploadResult.resource_type,
            folder,
            is_avatar,
            metadata: {
                width: uploadResult.width,
                height: uploadResult.height,
                duration: uploadResult.duration,
                pages: uploadResult.pages
            }
        });

        // Không trả về URLs trực tiếp
        const safeFile = fileDoc.toObject();
        delete safeFile.file_url;
        delete safeFile.secure_url;
        delete safeFile.thumbnail_url;
        
        return {
            ...safeFile,
            signed_url: fileDoc.signed_url
        };
    }

    async getSignedUrl(fileId, userId) {
        const file = await CloudinaryFile.findOne({ 
            _id: fileId,
            user_id: userId
        }).select('+secure_url');

        if (!file) {
            throw new NotFoundError('File not found');
        }

        // Tạo signed URL với thời hạn ngắn
        const signedUrl = await CloudinaryService.generateSignedUrl(
            file.public_id,
            { expires_in: 3600 } // 1 hour
        );

        return signedUrl;
    }

    async deleteFile(fileId, userId) {
        const file = await CloudinaryFile.findOne({
            _id: fileId,
            user_id: userId
        });

        if (!file) {
            throw new NotFoundError('File not found');
        }

        // Delete from Cloudinary
        await CloudinaryService.delete(file.public_id, {
            resource_type: file.resource_type
        });

        // Delete from database
        await file.remove();

        return true;
    }

    _getResourceType(fileType) {
        switch (fileType) {
            case 'video':
                return 'video';
            case 'document':
                return 'raw';
            default:
                return 'image';
        }
    }

    _getTransformOptions(fileType, isAvatar) {
        const options = {};

        if (fileType === 'image') {
            options.allowed_formats = ['jpg', 'jpeg', 'png', 'webp'];
            if (isAvatar) {
                options.transformation = [
                    { width: 400, height: 400, crop: 'fill' },
                    { quality: 'auto' }
                ];
            } else {
                options.transformation = [
                    { width: 1920, crop: 'limit' },
                    { quality: 'auto' }
                ];
            }
        }

        if (fileType === 'video') {
            options.allowed_formats = ['mp4', 'webm'];
            options.transformation = [
                { quality: 'auto' },
                { format: 'mp4' }
            ];
        }

        return options;
    }
}

module.exports = new FileService(); 