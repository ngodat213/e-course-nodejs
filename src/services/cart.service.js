const Cart = require("../models/cart.model");
const Course = require("../models/course.model");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const i18next = require("i18next");
const MoMoService = require("./momo.service");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const { v4: uuidv4 } = require("uuid");

class CartService {
  async getCart(userId) {
    let cart = await Cart.findOne({ user_id: userId })
      .populate({
        path: "items.course_id",
        populate: [
          {
            path: "instructor_id",
            select: "-password -__v -role -status -certificate_count -followers -notifications -unread_notifications -created_at -updated_at"
          },
          {
            path: "thumbnail_id"
          },
          {
            path: "categories",
            select: "name slug"
          }
        ]
      });

    if (!cart) {
      cart = await Cart.create({ user_id: userId });
    }

    return cart;
  }

  async addToCart(userId, courseId) {
    // Kiểm tra khóa học tồn tại
    const course = await Course.findOne({ 
      _id: courseId,
      status: "published"
    },);
    
    if (!course) {
      throw new NotFoundError(i18next.t("course.notFound"));
    }

    // // Kiểm tra xem user có phải instructor của khóa học không
    // if (course.instructor_id.toString() === userId) {
    //   throw new BadRequestError(i18next.t("cart.cannotAddOwnCourse"));
    // }

    let cart = await Cart.findOne({ user_id: userId });
    
    // Tạo giỏ hàng mới nếu chưa có
    if (!cart) {
      cart = new Cart({ user_id: userId });
    }

    // Kiểm tra khóa học đã có trong giỏ hàng chưa
    const existingItem = cart.items.find(
      item => item.course_id.toString() === courseId
    );

    if (existingItem) {
      throw new BadRequestError(i18next.t("cart.courseAlreadyInCart"));
    }

    // Thêm khóa học vào giỏ hàng
    cart.items.push({
      course_id: courseId,
      price: course.price
    });

    await cart.save();
    return this.getCart(userId);
  }

  async removeFromCart(userId, courseId) {
    const cart = await Cart.findOne({ user_id: userId });
    
    if (!cart) {
      throw new NotFoundError(i18next.t("cart.notFound"));
    }

    const itemIndex = cart.items.findIndex(
      item => item.course_id.toString() === courseId
    );

    if (itemIndex === -1) {
      throw new NotFoundError(i18next.t("cart.courseNotInCart"));
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    
    return this.getCart(userId);
  }

  async clearCart(userId) {
    const cart = await Cart.findOne({ user_id: userId });
    
    if (!cart) {
      throw new NotFoundError(i18next.t("cart.notFound"));
    }

    cart.items = [];
    await cart.save();
    
    return cart;
  }

  async checkout(userId, paymentMethod) {
    // Lấy giỏ hàng của user
    const cart = await Cart.findOne({ user_id: userId });
    
    if (!cart || cart.items.length === 0) {
      throw new BadRequestError(i18next.t("cart.empty"));
    }

    // Lấy thông tin chi tiết các khóa học
    const courseIds = cart.items.map(item => item.course_id);
    const courses = await Course.find({ 
      _id: { $in: courseIds },
      status: "published"
    });

    // Kiểm tra xem tất cả khóa học có tồn tại và đang published không
    if (courses.length !== courseIds.length) {
      throw new BadRequestError(i18next.t("cart.invalidCourses"));
    }

    // Lấy thông tin user
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError(i18next.t("user.notFound"));
    }

    // Tạo order ID
    const orderId = `ORDER_${Date.now()}_${userId.substring(0, 6)}`;
    const requestId = `REQ_${uuidv4()}`;

    // Chuẩn bị thông tin khóa học cho đơn hàng
    const orderCourses = cart.items.map(item => ({
      course_id: item.course_id,
      price: item.price
    }));

    // Xử lý theo phương thức thanh toán
    switch (paymentMethod) {
      case "momo":
        // Tạo URL thanh toán MoMo
        const paymentResponse = await MoMoService.createPaymentUrl({
          amount: cart.total_amount,
          orderId: orderId,
          requestId: requestId,
          orderInfo: `Thanh toán ${cart.items.length} khóa học`,
          userId: userId,
          courses: orderCourses // Truyền mảng các object
        });

        return {
          order_id: orderId,
          payment_url: paymentResponse.payUrl,
          amount: cart.total_amount,
          courses: courses.map(course => ({
            _id: course._id,
            title: course.title,
            price: course.price
          }))
        };

      default:
        throw new BadRequestError(i18next.t("payment.invalidMethod"));
    }
  }

  async processSuccessfulPayment(orderId) {
    // Tìm order
    const order = await Order.findOne({ order_id: orderId });
    if (!order) {
      throw new NotFoundError(i18next.t("order.notFound"));
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.status !== "paid") {
      throw new BadRequestError(i18next.t("order.notPaid"));
    }

    // Lấy thông tin user
    const user = await User.findById(order.user_id);
    if (!user) {
      throw new NotFoundError(i18next.t("user.notFound"));
    }

    // Thêm khóa học vào danh sách đã đăng ký của user
    const courseIds = order.courses.map(item => item.course_id);
    
    // Cập nhật enrolled_courses của user
    await User.findByIdAndUpdate(
      order.user_id,
      { $addToSet: { enrolled_courses: { $each: courseIds } } }
    );

    // Cập nhật student_count của các khóa học
    await Course.updateMany(
      { _id: { $in: courseIds } },
      { $inc: { student_count: 1 } }
    );

    // Xóa giỏ hàng
    await this.clearCart(order.user_id);

    return {
      message: i18next.t("payment.success"),
      order_id: orderId,
      courses: courseIds
    };
  }
}

module.exports = new CartService();
