const BaseController = require("./base.controller");
const UserService = require("../services/user.service");
const { BadRequestError } = require("../utils/errors");

class DevController extends BaseController {
  constructor() {
    super();
  }

  async registerAdmin(req, res, next) {
    try {
      const { dev_secret_key, ...userData } = req.body;

      if (dev_secret_key !== process.env.DEV_SECRET_KEY) {
        throw new BadRequestError("Invalid dev secret key");
      }

      const adminData = {
        ...userData,
        role: "admin",
        status: "active",
      };

      const admin = await UserService.createUser(adminData);

      this.logInfo("Dev admin created", {
        adminId: admin._id,
        email: admin.email,
      });

      this.successResponse(res, admin);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const { dev_secret_key } = req.query;

      if (dev_secret_key !== process.env.DEV_SECRET_KEY) {
        throw new BadRequestError("Invalid dev secret key");
      }

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sort: req.query.sort || '-created_at',
        search: req.query.search
      };

      const users = await UserService.getAll(options);

      this.logInfo("Dev fetched all users", {
        totalUsers: users.pagination.total,
        page: options.page,
        limit: options.limit
      });

      this.successResponse(res, users);
    } catch (error) {
      this.handleError(error, next);
    }
  }
}

module.exports = new DevController();
