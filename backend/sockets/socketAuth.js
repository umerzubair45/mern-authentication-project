const jwt = require("jsonwebtoken");
const User = require("../models/User");

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select(
      "_id userName userEmail role",
    );

    if (!user) {
      return next(new Error("User not found"));
    }

    //socket.user = decoded;
    socket.user = {
      userId: user._id.toString(),
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Socket Auth Error:", error);
    next(new Error("Socket authentication failed"));
  }
};

module.exports = socketAuth;
