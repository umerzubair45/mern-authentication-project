const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/AdminMiddleware");
const adminDashboard = require("../controllers/AdminController");

const {
  register,
  login,
  profile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerification,
} = require("../controllers/AuthController");

const verifyToken = require("../middleware/AuthMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, profile);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/resend-verification", resendVerification);
router.get("/admin-dashboard", verifyToken, requireAdmin, adminDashboard);

module.exports = router;
