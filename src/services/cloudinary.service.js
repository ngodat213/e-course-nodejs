const cloudinary = require("../config/cloudinary.config");
const { BadRequestError } = require("../utils/errors");
const i18next = require("i18next");
class CloudinaryService {
  async upload(filePath, options = {}) {
    return cloudinary.uploader.upload(filePath, options);
  }

  async delete(publicId, options = {}) {
    return cloudinary.uploader.destroy(publicId, options);
  }

  generateSignedUrl(publicId, options = {}) {
    return cloudinary.utils.url(publicId, options);
  }
}


module.exports = new CloudinaryService();
