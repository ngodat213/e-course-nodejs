const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class HashService {
  async hashData(data) {
    return await bcrypt.hash(data, 10);
  }

  async verifyData(data, hashedData) {
    return await bcrypt.compare(data, hashedData);
  }
}

module.exports = new HashService();
