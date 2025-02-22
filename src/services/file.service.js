const CloudinaryFile = require("../models/cloudinary_file.model");
const CloudinaryService = require("./cloudinary.service");
const { BadRequestError, NotFoundError } = require("../utils/errors");
const i18next = require("i18next");

class FileService {
  async uploadFile(file, options = {}) {
    const {
      owner_id,
      owner_type,
      purpose,
      file_type = this._detectFileType(file.mimetype),
      folder = this._getFolderPath(owner_type, purpose),
    } = options;

    // Validate file type
    if (!this._isValidFileType(file.mimetype, file_type)) {
      throw new BadRequestError(i18next.t("upload.invalidFormat"));
    }

    // Upload to Cloudinary
    const uploadResult = await this.upload(file_type, file, {
      folder,
      resource_type: this._getResourceType(file_type),
      ...this._getTransformOptions(file_type, purpose),
    });

    // Create file record
    const cloudinaryFile = await CloudinaryFile.create({
      owner_id,
      owner_type,
      purpose,
      file_type,
      original_name: file.originalname,
      file_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      size: file.size,
      format: uploadResult.format,
      metadata: {
        width: uploadResult.width,
        height: uploadResult.height,
        duration: uploadResult.duration,
        pages: uploadResult.pages,
      },
    });

    return cloudinaryFile;
  }

  async upload(file_type, file, options = {}) {
    const { folder, purpose } = options;

    switch (file_type) {
      case "image":
        return await CloudinaryService.uploadImage(file.path, {
          folder,
          resource_type: this._getResourceType(file_type),
          ...this._getTransformOptions(file_type, purpose),
        });
      case "video":
        return await CloudinaryService.uploadVideo(file.path, {
          folder,
          resource_type: this._getResourceType(file_type),
          ...this._getTransformOptions(file_type, purpose),
        });
      case "document":
        return await CloudinaryService.uploadDocument(file.path, {
          folder,
          resource_type: this._getResourceType(file_type),
          ...this._getTransformOptions(file_type, purpose),
        });
      default:
        throw new BadRequestError(i18next.t("upload.invalidFormat"));
    }
  }

  async getSignedUrl(fileId, userId) {
    const file = await CloudinaryFile.findOne({
      _id: fileId,
      user_id: userId,
    }).select("+secure_url");

    if (!file) {
      throw new NotFoundError("File not found");
    }

    // Tạo signed URL với thời hạn ngắn
    const signedUrl = await CloudinaryService.generateSignedUrl(
      file.public_id,
      { expires_in: 3600 } // 1 hour
    );

    return signedUrl;
  }

  async deleteFile(fileId) {
    const file = await CloudinaryFile.findById(fileId);
    if (!file) return;

    // Delete from Cloudinary
    await CloudinaryService.delete(file.public_id);

    // Mark as deleted in database
    file.status = "deleted";
    await file.save();
  }

  _getResourceType(fileType) {
    switch (fileType) {
      case "video":
        return "video";
      case "document":
        return "pdf";
      case "pdf":
        return "pdf";
      case "word":
      case "excel":
      case "ppt":
        return "application";
      default:
        return "image";
    }
  }

  _detectFileType(mimetype) {
    if (mimetype.startsWith("image/")) return "image";
    if (mimetype.startsWith("video/")) return "video";
    return "document";
  }

  _isValidFileType(mimetype, expectedType) {
    switch (expectedType) {
      case "image":
        return mimetype.startsWith("image/");
      case "video":
        return mimetype.startsWith("video/");
      case "document":
        return ["application/pdf", "application/msword"].includes(mimetype);
      default:
        return false;
    }
  }

  _getFolderPath(ownerType, purpose) {
    return `${process.env.NODE_ENV}/${ownerType.toLowerCase()}s/${purpose}s`;
  }

  _getTransformOptions(fileType, purpose) {
    const options = {
      quality: "auto",
    };

    if (fileType === "image") {
      if (purpose === "avatar") {
        options.transformation = [
          { width: 400, height: 400, crop: "fill" },
          { quality: "auto" },
        ];
      } else if (purpose === "thumbnail") {
        options.transformation = [
          { width: 720, height: 480, crop: "fill" },
          { quality: "auto" },
        ];
      }
    } else if (fileType === "video") {
      options.resource_type = "video";

      if (purpose === "content") {
        options.transformation = [
          { width: 720, height: 480, crop: "limit" },
          { quality: "auto" },
          { format: "mp4" },
        ];
      } else if (purpose === "optimized") {
        options.transformation = [
          { width: 1280, height: 720, crop: "limit" },
          { quality: "auto" },
          { format: "mp4" },
          { flags: "progressive" },
        ];
      }
    } else if (purpose === "attachment") {
      options.transformation = [{ format: "pdf" }];
    }

    return options;
  }
}

module.exports = new FileService();
