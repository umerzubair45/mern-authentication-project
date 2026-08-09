const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,

  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,

  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many password reset requests. Please try again later.",
  },
});

const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,

  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many verification requests. Please try again later.",
  },
});
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,

  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many registration attempts. Please try again later.",
  },
});

module.exports = {
  loginLimiter,
  passwordResetLimiter,
  verificationLimiter,
  registerLimiter,
};
