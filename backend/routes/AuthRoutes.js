const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/AdminMiddleware");
const adminDashboard = require("../controllers/AdminController");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../schemas/authSchema");
const {
  loginLimiter,
  passwordResetLimiter,
  verificationLimiter,
  registerLimiter,
} = require("../middleware/rateLimiter");

const {
  register,
  login,
  refreshToken,
  profile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerification,
  logout,
} = require("../controllers/AuthController");

const verifyToken = require("../middleware/AuthMiddleware");

router.post("/register", registerLimiter, validate(registerSchema), register);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/refresh-token", refreshToken);
router.get("/profile", verifyToken, profile);
router.get("/verify-email/:token", verificationLimiter, verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", passwordResetLimiter, resetPassword);
router.post("/resend-verification", resendVerification);
router.get("/admin-dashboard", verifyToken, requireAdmin, adminDashboard);
router.post("/logout", logout);

module.exports = router;
