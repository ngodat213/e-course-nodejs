const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { error: logger } = require("../utils/logger");

const verifyToken = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    logger('Socket authentication error:', error);
    next(new Error('Invalid token'));
  }
};

module.exports = verifyToken; 