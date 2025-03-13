const crypto = require("crypto");
const https = require("https");
const momoConfig = require("../config/momo.config");
const { success, error } = require("../utils/logger");
const Order = require("../models/order.model");

class MoMoService {
  constructor() {
    this.config = momoConfig;
  }

  _createRedirectUrl(params) {
    const { amount, orderId } = params;

    if (process.env.NODE_ENV === "development") {
      return `${this.config.ipnUrl}/dev?orderIdResult=${orderId}`;
    }

    return this.config.ipnUrl;
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
    // Get signature from request
    const receivedSignature = momoParams.signature;

    // Remove signature from params to verify
    delete momoParams.signature;

    // Sort params by key and create raw signature
    const rawSignature = Object.keys(momoParams)
      .sort()
      .map((key) => `${key}=${momoParams[key]}`)
      .join("&");

    // Create signature to compare
    const signature = crypto
      .createHmac("sha256", this.config.secretKey)
      .update(rawSignature)
      .digest("hex");

    return signature === receivedSignature;
  }

  async processIPNDev(momoParams) {
    try {
      // Update order status
      const order = await Order.findOne({ _id: momoParams.orderIdResult });

      if (!order) {
        return {
          status: "error",
          message: "Order not found",
        };
      }
      order.status = "paid";

      order.payment_info = {
        ...order.payment_info,
        ipnResponse: momoParams,
      };

      await order.save();

      success.info("MoMo payment processed", {
        orderId: order.order_id,
      });

      return {
        status: "success",
        message: "MoMo payment processed",
      };
    } catch (err) {
      error("Error processing MoMo payment:", err);
      throw err;
    }
  }

  async processPaymentResult(momoParams) {
    try {
      // Verify signature
      if (!this.verifyIPN(momoParams)) {
        return { status: "error", message: "Invalid signature" };
      }
  
      // Xác định trạng thái đơn hàng dựa vào `resultCode`
      const newStatus = momoParams.resultCode === 0 ? "paid" : "failed";
  
      // Cập nhật trực tiếp bằng `findOneAndUpdate()`
      const order = await Order.findOneAndUpdate(
        { order_id: momoParams.orderId },
        {
          status: newStatus,
          payment_info: { ipnResponse: momoParams }
        },
        { new: true } // Trả về dữ liệu đã cập nhật
      );
  
      if (!order) {
        return { status: "error", message: "Order not found" };
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
        },
      };
    } catch (err) {
      error("Error processing MoMo payment:", err);
      throw err;
    }
  }
}

module.exports = new MoMoService();
