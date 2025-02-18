const cloudinary = require('../config/cloudinary.config');
const { BadRequestError } = require('../utils/errors');
const i18next = require('i18next');

class CloudinaryService {
    async uploadImage(file, folder = 'avatars') {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: `ecourse/${folder}`,
                allowed_formats: ['jpg', 'png', 'jpeg'],
                transformation: [
                    { width: 500, height: 500, crop: 'fill' },
                    { quality: 'auto' }
                ]
            });

            return {
                url: result.secure_url,
                public_id: result.public_id
            };
        } catch (error) {
            throw new BadRequestError(i18next.t('upload.failed'));
        }
    }

    async deleteImage(publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error('Error deleting image from Cloudinary:', error);
        }
    }
}

module.exports = new CloudinaryService(); 