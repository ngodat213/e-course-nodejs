const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} = require("../utils/errors");
const { error: logger } = require("../utils/logger");
const i18next = require("i18next");

const authMiddleware = {
  // Verify JWT token
  verifyToken: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new UnauthorizedError("No token provided");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      next(new UnauthorizedError("Invalid token"));
    }
  },

  // Kiểm tra role
  restrictTo: (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError("Insufficient permissions");
      }
      next();
    };
  },

  // Kiểm tra owner của resource
  isOwnerOrAdmin: (Model, id) => async (req, res, next) => {
    try {
      const doc = await Model.findById(id);
      if (!doc) {
        return next(new NotFoundError("Document not found"));
      }

      const isOwner = doc.instructor_id.toString() === req.user.id;
      const isAdmin = ["admin", "super_admin"].includes(req.user.role);

      if (!isOwner && !isAdmin) {
        throw new ForbiddenError(
          "You do not have permission to perform this action"
        );
      }

      // Lưu document để tránh query lại trong controller
      req.document = doc;
      next();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authMiddleware;
