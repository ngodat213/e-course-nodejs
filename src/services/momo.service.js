const crypto = require("crypto");
const https = require("https");
const momoConfig = require("../config/momo.config");
const { success, error } = require("../utils/logger");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const Course = require("../models/course.model");

class MoMoService {
  constructor() {
    this.config = momoConfig;
  }

  _createRedirectUrl(params) {
    const { amount, orderId } = params;

    if (process.env.NODE_ENV === "development") {
      return `${this.config.ipnUrl}/dev?orderIdResult=${orderId}`;
    }

    return this.config.redirectUrl;
  }

  async createPaymentUrl(params) {
    try {
      const {
        amount,
        orderId,
        requestId,
        orderInfo = "Pay with MoMo",
        userId,
        courses,
      } = params;

      // Create raw signature
      const rawSignature = [
        `accessKey=${this.config.accessKey}`,
        `amount=${amount}`,
        `extraData=`,
        `ipnUrl=${this.config.ipnUrl}`,
        `orderId=${orderId}`,
        `orderInfo=${orderInfo}`,
        `partnerCode=${this.config.partnerCode}`,
        `redirectUrl=${this._createRedirectUrl(params)}`,
        `requestId=${requestId}`,
        `requestType=${this.config.requestType}`,
      ].join("&");

      success.info("Raw signature:", rawSignature);

      // Create signature
      const signature = crypto
        .createHmac("sha256", this.config.secretKey)
        .update(rawSignature)
        .digest("hex");

      success.info("Signature:", signature);

      // Create request body
      const requestBody = JSON.stringify({
        partnerCode: this.config.partnerCode,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: this._createRedirectUrl(params),
        ipnUrl: this.config.ipnUrl,
        lang: this.config.lang,
        requestType: this.config.requestType,
        autoCapture: this.config.autoCapture,
        extraData: "",
        orderGroupId: "",
        signature: signature,
      });

      // Create HTTPS request options
      const options = {
        hostname: "test-payment.momo.vn",
        port: 443,
        path: "/v2/gateway/api/create",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody),
        },
      };

      // Send request to MoMo
      const response = await this._sendHttpsRequest(options, requestBody);

      // Save order to DB
      try {
        await Order.create({
          order_id: orderId,
          amount: amount,
          courses: courses,
          status: "pending",
          payment_method: "momo",
          user_id: userId,
          response: response.payUrl,
          payment_info: {
            requestBody: JSON.parse(requestBody),
            responseBody: response,
          },
        });
        
        success.info("Order saved successfully", { orderId });
      } catch (orderError) {
        error("Save order to DB is error", orderError);
        // Vẫn tiếp tục trả về response để người dùng có thể thanh toán
      }

      success.info("MoMo payment created", {
        orderId,
        amount,
        resultCode: response.resultCode,
      });

      return response;
    } catch (err) {
      error("Error creating MoMo payment:", err);
      throw err;
    }
  }

  _sendHttpsRequest(options, body) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const response = JSON.parse(data);
            success.info("MoMo API Response:", {
              statusCode: res.statusCode,
              resultCode: response.resultCode,
            });
            resolve(response);
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on("error", (err) => {
        error("MoMo API Request Error:", err);
        reject(err);
      });

      req.write(body);
      req.end();
    });
  }

  verifyIPN(momoParams) {
    try {
      // Log các tham số nhận được để debug
      success.info("MoMo IPN received params:", momoParams);
      
      // Get signature from request
      const receivedSignature = momoParams.signature;
      if (!receivedSignature) {
        error("Missing signature in MoMo IPN");
        return false;
      }

      // Tạo bản sao của params để không ảnh hưởng đến object gốc
      const params = { ...momoParams };
      
      // Remove signature from params to verify
      delete params.signature;

      // MoMo IPN có các tham số cụ thể cần được sử dụng để tạo chữ ký
      // Dựa trên ví dụ IPN thực tế từ MoMo
      const rawSignature = [
        `accessKey=${this.config.accessKey}`,
        `amount=${params.amount}`,
        `extraData=${params.extraData || ""}`,
        `message=${params.message}`,
        `orderId=${params.orderId}`,
        `orderInfo=${params.orderInfo || ""}`,
        `orderType=${params.orderType}`,
        `partnerCode=${params.partnerCode}`,
        `payType=${params.payType}`,
        `requestId=${params.requestId}`,
        `responseTime=${params.responseTime}`,
        `resultCode=${params.resultCode}`,
        `transId=${params.transId}`
      ].join("&");

      success.info("Raw signature for verification:", rawSignature);

      // Create signature to compare
      const signature = crypto
        .createHmac("sha256", this.config.secretKey)
        .update(rawSignature)
        .digest("hex");

      success.info("Calculated signature:", signature);
      success.info("Received signature:", receivedSignature);

      // Trong môi trường development hoặc test, có thể bỏ qua việc xác thực chữ ký
      if (process.env.MOMO_SKIP_SIGNATURE_VERIFY === 'true') {
        success.info("Skipping signature verification as per configuration");
        return true;
      }

      const isValid = signature === receivedSignature;
      
      if (!isValid) {
        error("Signature verification failed", {
          calculated: signature,
          received: receivedSignature,
          rawSignature: rawSignature
        });
        
        // Thử tạo chữ ký theo cách khác (sắp xếp tham số theo alphabet)
        const sortedParams = {};
        Object.keys(params).sort().forEach(key => {
          sortedParams[key] = params[key];
        });
        
        const sortedRawSignature = Object.keys(sortedParams)
          .map(key => `${key}=${sortedParams[key]}`)
          .join("&");
          
        const sortedSignature = crypto
          .createHmac("sha256", this.config.secretKey)
          .update(sortedRawSignature)
          .digest("hex");
          
        success.info("Alternative signature calculation (sorted params):", {
          rawSignature: sortedRawSignature,
          signature: sortedSignature
        });
      }
      
      return isValid;
    } catch (err) {
      error("Error verifying MoMo IPN signature:", err);
      return false;
    }
  }

  async processIPNDev(momoParams) {
    try {
      success.info("Processing MoMo payment in dev mode:", momoParams);
      
      // Tìm đơn hàng theo orderId
      const order = await Order.findOne({ order_id: momoParams.orderIdResult });

      if (!order) {
        error("Order not found:", momoParams.orderIdResult);
        return {
          status: "error",
          message: "Order not found",
        };
      }
      
      // Trong môi trường development, luôn cập nhật trạng thái thành "paid"
      order.status = "paid";
      order.payment_info = {
        ...order.payment_info,
        ipnResponse: momoParams,
        devMode: true,
        processedAt: new Date()
      };

      await order.save();

      // Xử lý đăng ký khóa học cho người dùng
      try {
        // Lấy thông tin user
        const user = await User.findById(order.user_id);
        if (!user) {
          error("User not found:", order.user_id);
        } else {
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
          const Cart = require("../models/cart.model");
          await Cart.findOneAndUpdate(
            { user_id: order.user_id },
            { $set: { items: [] } }
          );
          
          success.info("User enrolled in courses successfully in dev mode", {
            userId: order.user_id,
            courses: courseIds
          });
        }
      } catch (enrollError) {
        error("Error processing enrollment after payment in dev mode:", enrollError);
        // Không ảnh hưởng đến việc xử lý thanh toán, chỉ ghi log lỗi
      }

      success.info("MoMo payment processed in dev mode", {
        orderId: order.order_id,
      });

      return {
        status: "success",
        message: "MoMo payment processed in development mode",
        data: {
          orderId: order.order_id,
          amount: order.amount,
          status: order.status,
          enrolledCourses: order.courses.map(c => c.course_id)
        }
      };
    } catch (err) {
      error("Error processing MoMo payment in dev mode:", err);
      throw err;
    }
  }

  async processPaymentResult(momoParams) {
    try {
      success.info("Processing MoMo payment result:", momoParams);
      
      // Trong môi trường development hoặc test, có thể bỏ qua việc xác thực chữ ký
      let isValidSignature = true;
      
      // Kiểm tra cấu hình bỏ qua xác thực chữ ký
      if (process.env.MOMO_SKIP_SIGNATURE_VERIFY !== 'true') {
        // Verify signature
        isValidSignature = this.verifyIPN(momoParams);
      } else {
        success.info("Skipping signature verification as per configuration");
      }
  
      // Nếu chữ ký không hợp lệ và không được cấu hình bỏ qua
      if (!isValidSignature && process.env.MOMO_SKIP_SIGNATURE_VERIFY !== 'true') {
        error("Invalid signature in MoMo IPN");
        return { 
          status: "error", 
          message: "Invalid signature",
          details: {
            orderId: momoParams.orderId,
            resultCode: momoParams.resultCode
          }
        };
      }
  
      // Xác định trạng thái đơn hàng dựa vào `resultCode`
      // resultCode = 0: Thành công, resultCode khác 0: Thất bại
      const newStatus = momoParams.resultCode === 0 ? "paid" : "failed";
  
      // Tìm đơn hàng theo orderId
      const order = await Order.findOne({ order_id: momoParams.orderId });
      
      if (!order) {
        error("Order not found:", momoParams.orderId);
        return { 
          status: "error", 
          message: "Order not found",
          details: {
            orderId: momoParams.orderId
          }
        };
      }
      
      // Cập nhật trạng thái đơn hàng
      order.status = newStatus;
      order.payment_info = {
        ...order.payment_info,
        ipnResponse: momoParams,
        processedAt: new Date()
      };
      
      await order.save();
  
      // Nếu thanh toán thành công (resultCode = 0), thực hiện các bước sau
      if (newStatus === "paid") {
        try {
          // Lấy thông tin user
          const user = await User.findById(order.user_id);
          if (!user) {
            error("User not found:", order.user_id);
          } else {
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
            const Cart = require("../models/cart.model");
            await Cart.findOneAndUpdate(
              { user_id: order.user_id },
              { $set: { items: [] } }
            );
            
            success.info("User enrolled in courses successfully", {
              userId: order.user_id,
              courses: courseIds
            });
          }
        } catch (enrollError) {
          error("Error processing enrollment after payment:", enrollError);
          // Không ảnh hưởng đến việc xử lý thanh toán, chỉ ghi log lỗi
        }
      }
  
      success.info("MoMo payment processed", {
        orderId: order.order_id,
        amount: order.amount,
        status: order.status,
        resultCode: momoParams.resultCode,
      });
  
      return {
        status: "success",
        data: {
          orderId: order.order_id,
          amount: order.amount,
          status: order.status,
          message: momoParams.message,
          resultCode: momoParams.resultCode
        },
      };
    } catch (err) {
      error("Error processing MoMo payment:", err);
      throw err;
    }
  }

  async processSimpleIPN(momoParams) {
    try {
      success.info("Processing MoMo IPN with simple method:", momoParams);
      
      // Kiểm tra các tham số bắt buộc
      if (!momoParams.orderId || !momoParams.resultCode) {
        error("Missing required parameters in MoMo IPN");
        return { 
          status: "error", 
          message: "Missing required parameters" 
        };
      }
      
      // Xác định trạng thái đơn hàng dựa vào resultCode
      // resultCode = 0: Thành công, resultCode khác 0: Thất bại
      const newStatus = momoParams.resultCode === 0 ? "paid" : "failed";
      
      // Tìm đơn hàng theo orderId
      const order = await Order.findOne({ order_id: momoParams.orderId });
      
      if (!order) {
        error("Order not found:", momoParams.orderId);
        return { 
          status: "error", 
          message: "Order not found" 
        };
      }
      
      // Cập nhật trạng thái đơn hàng
      order.status = newStatus;
      order.payment_info = {
        ...order.payment_info,
        ipnResponse: momoParams,
        processedAt: new Date(),
        simpleProcessing: true
      };
      
      await order.save();
      
      // Nếu thanh toán thành công (resultCode = 0), thực hiện các bước sau
      if (newStatus === "paid") {
        try {
          // Lấy thông tin user
          const user = await User.findById(order.user_id);
          if (!user) {
            error("User not found:", order.user_id);
          } else {
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
            const Cart = require("../models/cart.model");
            await Cart.findOneAndUpdate(
              { user_id: order.user_id },
              { $set: { items: [] } }
            );
            
            success.info("User enrolled in courses successfully with simple method", {
              userId: order.user_id,
              courses: courseIds
            });
          }
        } catch (enrollError) {
          error("Error processing enrollment after payment with simple method:", enrollError);
          // Không ảnh hưởng đến việc xử lý thanh toán, chỉ ghi log lỗi
        }
      }
      
      success.info("MoMo payment processed with simple method", {
        orderId: order.order_id,
        amount: order.amount,
        status: order.status,
        resultCode: momoParams.resultCode
      });
      
      return {
        status: "success",
        data: {
          orderId: order.order_id,
          amount: order.amount,
          status: order.status,
          message: momoParams.message || "Processed with simple method"
        }
      };
    } catch (err) {
      error("Error processing MoMo IPN with simple method:", err);
      throw err;
    }
  }

  async forceProcessPayment(orderId, status = "paid") {
    try {
      success.info(`Force processing payment for order: ${orderId} with status: ${status}`);
      
      // Tìm đơn hàng theo orderId
      const order = await Order.findOne({ order_id: orderId });
      
      if (!order) {
        error("Order not found:", orderId);
        return { 
          status: "error", 
          message: "Order not found" 
        };
      }
      
      // Cập nhật trạng thái đơn hàng
      order.status = status;
      order.payment_info = {
        ...order.payment_info,
        forceProcessed: true,
        processedAt: new Date(),
        forcedStatus: status
      };
      
      await order.save();
      
      // Nếu trạng thái là "paid", thực hiện các bước sau
      if (status === "paid") {
        try {
          // Lấy thông tin user
          const user = await User.findById(order.user_id);
          if (!user) {
            error("User not found:", order.user_id);
            return {
              status: "error",
              message: "User not found"
            };
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
          const Cart = require("../models/cart.model");
          await Cart.findOneAndUpdate(
            { user_id: order.user_id },
            { $set: { items: [] } }
          );
          
          success.info("User enrolled in courses successfully with force method", {
            userId: order.user_id,
            courses: courseIds
          });
        } catch (enrollError) {
          error("Error processing enrollment after forced payment:", enrollError);
          return {
            status: "partial_success",
            message: "Payment processed but enrollment failed",
            error: enrollError.message
          };
        }
      }
      
      success.info("Payment force processed successfully", {
        orderId: order.order_id,
        status: status
      });
      
      return {
        status: "success",
        data: {
          orderId: order.order_id,
          amount: order.amount,
          status: order.status,
          message: `Payment ${status === "paid" ? "completed" : "updated"} successfully`
        }
      };
    } catch (err) {
      error("Error force processing payment:", err);
      throw err;
    }
  }
}

module.exports = new MoMoService();
