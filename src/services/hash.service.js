const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class HashService {
  async hashData(data) {
    return await bcrypt.hash(data, 10);
  }

  async verifyData(data, hashedData) {
    return await bcrypt.compare(data, hashedData);
  }

  async jwtSign(payload, options) {
    return await jwt.sign(payload, process.env.JWT_SECRET, options);
  }

  async jwtVerify(token) {
    return await jwt.verify(token, process.env.JWT_SECRET);
  }

  async jwtDecode(token) {
    return await jwt.decode(token);
  }
}

module.exports = new HashService();
