const Cart = require("../models/cart.model");
const Course = require("../models/course.model");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const i18next = require("i18next");

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
}

module.exports = new CartService();
