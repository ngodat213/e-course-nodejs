const cloudinary = require("../config/cloudinary.config");
const { BadRequestError } = require("../utils/errors");
const i18next = require("i18next");
class CloudinaryService {
  async uploadImage(filePath, options = {}) {
    try {
      // Validate file size
      if (
        options.file &&
        options.file.size > process.env.MAX_IMAGE_SIZE * 1024 * 1024
      ) {
        // 5MB
        throw new BadRequestError(i18next.t("upload.tooLarge"));
      }

      const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: options.resource_type,
        ...(Object.keys(options).length === 0 ? this._getDefaultOptions() : {}),
        ...options,
      });

      return uploadResult;
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError(i18next.t("upload.failed"));
    }
  }

  async uploadVideo(filePath, options = {}) {
    try {
      // Validate file size
      if (
        options.file &&
        options.file.size > process.env.MAX_VIDEO_SIZE * 1024 * 1024
      ) {
        // 100MB
        throw new BadRequestError(i18next.t("upload.tooLarge"));
      }

      const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: "video",
        ...this._getDefaultOptions(),
        ...options,
      });

      return uploadResult;
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError(i18next.t("upload.failed"));
    }
  }

  async uploadDocument(filePath, options = {}) {
    try {
      // Validate file size
      if (
        options.file &&
        options.file.size > process.env.MAX_FILE_SIZE * 1024 * 1024
      ) {
        // 10MB
        throw new BadRequestError(i18next.t("upload.tooLarge"));
      }

      const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: "raw",
        ...this._getDefaultOptions(),
        ...options,
      });

      return uploadResult;
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError(i18next.t("upload.failed"));
    }
  }

  async delete(publicId, options = {}) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, options);
      return result;
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      // Không throw error vì đây là operation cleanup
    }
  }

  async generateSignedUrl(publicId, options = {}) {
    const defaultOptions = {
      secure: process.env.SECURE_URL === "true",
      sign_url: process.env.SIGN_URL === "true",
      expires_at: Math.floor(Date.now() / 1000) + process.env.SIGN_URL_EXPIRES,
    };

    return cloudinary.utils.url(publicId, {
      ...defaultOptions,
      ...options,
    });
  }

  _getDefaultOptions() {
    return {
      folder: `${process.env.NODE_ENV}/uploads`,
      unique_filename: process.env.UNIQUE_FILENAME === "true",
      overwrite: process.env.OVERWRITE === "true",
      format: process.env.FORCE_FORMAT,
      quality: process.env.QUALITY,
      fetch_format: process.env.FETCH_FORMAT,
    };
  }
}

module.exports = new CloudinaryService();
