const BaseController = require('./base.controller');
const Course = require('../models/course.model');
const Order = require('../models/order.model');
const MoMoService = require('../services/momo.service');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const i18next = require('i18next');

class OrderController extends BaseController {
  constructor() {
    super();
  }

  async create(req, res, next) {
    try {
      const { courseIds } = req.body;
      const userId = req.user.id;

      // Validate courseIds
      if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
        throw new BadRequestError(i18next.t('order.invalidCourseIds'));
      }

      // Get courses and calculate total amount
      const courses = await Course.find({ _id: { $in: courseIds } });

      if (courses.length !== courseIds.length) {
        throw new NotFoundError(i18next.t('order.courseNotFound'));
      }

      const totalAmount = courses.reduce((sum, course) => sum + course.price, 0);

      // Create order ID
      const orderId = `${Date.now()}_${userId}`;
      const requestId = orderId;

      // Create MoMo payment URL
      const paymentResponse = await MoMoService.createPaymentUrl({
        amount: totalAmount,
        orderId,
        requestId,
        orderInfo: `Payment for ${courses.length} course(s)`,
        userId,
        courses: courseIds
      });

      this.logInfo('Order created', {
        userId,
        courseIds,
        amount: totalAmount,
        orderId
      });

      return this.successResponse(res, {
        orderId,
        amount: totalAmount,
        courses: courses.map(c => ({
          id: c._id,
          name: c.name,
          price: c.price
        })),
        paymentUrl: paymentResponse.payUrl
      });

    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getAll(req, res, next) {
    try {
      const userId = req.user.id;
      const { status, page = 1, limit = 10 } = req.query;

      const query = { user_id: userId };
      if (status) {
        query.status = status;
      }

      // Đếm tổng số documents
      const total = await Order.countDocuments(query);

      // Lấy danh sách orders với pagination
      const orders = await Order.find(query)
        .populate({
          path: 'courses.course_id',
          select: 'title price thumbnail_id'
        })
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      return this.successResponse(res, {
        data: orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const order = await Order.findOne({ 
        _id: id,
        user_id: userId 
      }).populate({
        path: 'courses.course_id',
        select: 'title price thumbnail_id'
      });

      if (!order) {
        throw new NotFoundError(i18next.t('order.notFound'));
      }

      return this.successResponse(res, order);

    } catch (error) {
      this.handleError(error, next);
    }
  }
}

module.exports = new OrderController(); 