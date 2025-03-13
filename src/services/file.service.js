const CloudinaryService = require("../services/cloudinary.service");
const File = require("../models/cloudinary_file.model");
const { BadRequestError, NotFoundError } = require("../utils/errors");

class FileService {
  /**
   * Upload file lên Cloudinary và lưu vào MongoDB
   * @param {ObjectId} ownerId - ID của đối tượng sở hữu file
   * @param {String} ownerType - Loại đối tượng sở hữu file (User, Course, Exam, Lesson)
   * @param {Object} file - File cần upload
   * @param {String} purpose - Mục đích sử dụng file
   * @returns {Object} - File đã upload
   */
  async uploadFile(ownerId, ownerType, file, purpose) {
    if (!file) throw new BadRequestError("File không được để trống");

    const folder = `${ownerType}/${ownerId}/${purpose}`;
    const uploadResponse = await CloudinaryService.upload(file.path, {
      resource_type: "auto",
      folder,
    });

    const newFile = new File({
      owner_id: ownerId,
      owner_type: ownerType,
      file_type: uploadResponse.resource_type,
      purpose,
      original_name: file.originalname,
      file_url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      size: uploadResponse.bytes,
      format: uploadResponse.format,
      metadata: {
        width: uploadResponse.width || null,
        height: uploadResponse.height || null,
        duration: uploadResponse.duration || null,
        pages: uploadResponse.pages || null,
      },
    });

    await newFile.save();
    return newFile;
  }

  /**
   * Lấy danh sách file theo owner
   * @param {ObjectId} ownerId - ID của đối tượng sở hữu file
   * @param {String} ownerType - Loại đối tượng sở hữu file (User, Course, Exam, Lesson)
   * @param {String} [purpose] - Lọc theo mục đích sử dụng file
   * @returns {Array} - Danh sách file
   */
  async getFiles(ownerId, ownerType, purpose) {
    const query = { owner_id: ownerId, owner_type: ownerType, status: "active" };
    if (purpose) query.purpose = purpose;
    return File.find(query).select("-file_url");
  }

  /**
   * Lấy chi tiết file theo ID
   * @param {ObjectId} fileId - ID file
   * @returns {Object} - File tìm thấy
   */
  async getFileById(fileId) {
    const file = await File.findById(fileId);
    if (!file) throw new NotFoundError("File không tồn tại");
    return file;
  }

  /**
   * Xóa file khỏi Cloudinary và cập nhật trạng thái MongoDB
   * @param {ObjectId} fileId - ID file
   * @returns {Object} - Thông báo xóa file thành công
   */
  async deleteFile(fileId) {
    const file = await File.findById(fileId);
    if (!file) throw new NotFoundError("File không tồn tại");

    await CloudinaryService.delete(file.public_id);
    file.status = "deleted";
    await file.save();

    return { message: "File đã bị xóa thành công" };
  }

  /**
   * Cập nhật file (thay thế file cũ)
   * @param {ObjectId} fileId - ID file
   * @param {Object} newFile - File mới
   * @returns {Object} - File sau khi cập nhật
   */
  async updateFile(fileId, newFile) {
    const existingFile = await File.findById(fileId);
    if (!existingFile) throw new NotFoundError("File không tồn tại");

    // Xóa file cũ trên Cloudinary
    await CloudinaryService.delete(existingFile.public_id);

    const folder = `${existingFile.owner_type}/${existingFile.owner_id}/${existingFile.purpose}`;
    const uploadResponse = await CloudinaryService.upload(newFile.path, {
      resource_type: "auto",
      folder,
    });

    // Cập nhật thông tin file
    Object.assign(existingFile, {
      original_name: newFile.originalname,
      file_url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      size: uploadResponse.bytes,
      format: uploadResponse.format,
      metadata: {
        width: uploadResponse.width || null,
        height: uploadResponse.height || null,
        duration: uploadResponse.duration || null,
        pages: uploadResponse.pages || null,
      },
    });

    await existingFile.save();
    return existingFile;
  }
}

module.exports = new FileService();