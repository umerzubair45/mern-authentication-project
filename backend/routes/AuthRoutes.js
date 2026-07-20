const express = require("express");
const router = express.Router();

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

module.exports = router;
