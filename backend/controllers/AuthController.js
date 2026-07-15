const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const GenerateToken = require("../utils/GenerateToken");
const generateVerificationToken = require("../utils/GenerateVerificationToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

const register = async (req, res) => {
  try {
    const { userName, userEmail, userPassword, userConfirmPassword } = req.body;

    // Check empty fields
    if (!userName || !userEmail || !userPassword || !userConfirmPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Compare passwords
    if (userPassword !== userConfirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Check existing email
    const existingUser = await User.findOne({
      userEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }
    const verification = generateVerificationToken();
    // Hash password
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Save user
    const user = new User({
      userName,
      userEmail,
      userPassword: hashedPassword,
      isVerified: false,

      verificationToken: verification.verificationToken,

      verificationTokenExpires: verification.verificationTokenExpires,
    });

    await user.save();

    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verification.verificationToken}`;

    await sendEmail({
      to: user.userEmail,
      subject: "Verify Your Email",
      html: `
      <h2>Welcome!</h2>

      <p>Thank you for registering.</p>

      <p>Please click the button below to verify your email.</p>

      <a
        href="${verificationLink}"
        style="
          display:inline-block;
          padding:12px 24px;
          background:#2563eb;
          color:white;
          text-decoration:none;
          border-radius:6px;
        "
      >
        Verify Email
      </a>

      <p>This link expires in 24 hours.</p>
  `,
    });

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const userEmail = req.body.userEmail?.trim().toLowerCase();

    // Validate email
    if (!userEmail) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    // Find user
    const user = await User.findOne({ userEmail });

    // Don't reveal whether email exists
    if (!user) {
      return res.status(200).json({
        message:
          "If an account with that email exists, we've sent a password reset link.",
      });
    }

    // Generate reset token
    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`;
    // Save token and expiry
    user.resetPasswordToken = resetPasswordToken;
    const RESET_PASSWORD_EXPIRY = 15 * 60 * 1000;
    user.resetPasswordTokenExpires = Date.now() + RESET_PASSWORD_EXPIRY;

    await user.save();

    // Send email
    await sendEmail({
      to: user.userEmail,
      subject: "Reset Your Password",
      html: `
        <h2>Password Reset</h2>

        <p>Hello ${user.userName},</p>

        <p>Click the button below to reset your password.</p>

        <a
          href="${resetLink}"
          style="
            background:#2563eb;
            color:white;
            padding:12px 20px;
            text-decoration:none;
            border-radius:6px;
            display:inline-block;
          "
        >
          Reset Password
        </a>

        <p>This link expires in <strong>15 minutes</strong>.</p>

        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    return res.status(200).json({
      message:
        "If an account with that email exists, we've sent a password reset link.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const { userPassword, userConfirmPassword } = req.body;

    // Validate required fields
    if (!userPassword || !userConfirmPassword) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    // Check password match
    if (userPassword !== userConfirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: token,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid reset link.",
      });
    }

    // Check token expiry
    if (user.resetPasswordTokenExpires < Date.now()) {
      return res.status(400).json({
        message: "Reset link has expired.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Update password
    user.userPassword = hashedPassword;

    // Remove reset token
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;

    if (!userEmail || !userPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await User.findOne({
      userEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
      });
    }

    const isMatch = await bcrypt.compare(userPassword, user.userPassword);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }
    const token = GenerateToken(user);

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        _id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid or expired verification link.",
      });
    }

    if (user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({
        message: "Verification link has expired.",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const profile = (req, res) => {
  const userData = req.user;
  res.json({
    message: "Welcome to Profile",
    userData,
  });
};
module.exports = {
  register,
  login,
  profile,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
