const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const GenerateToken = require("../utils/GenerateToken");
const generateVerificationToken = require("../utils/GenerateVerificationToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");
const {
  registerTemplate,
  passwordResetTemplate,
  resendVerificationTemplate,
} = require("../utils/emailTemplates");

const register = async (req, res) => {
  try {
    const { userName, userEmail, userPassword, userConfirmPassword } = req.body;

    // Check empty fields
    if (!userName || !userEmail || !userPassword || !userConfirmPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    if (userPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
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
      //verificationToken: verification.verificationToken,
      //verificationTokenExpires: verification.verificationTokenExpires,
    });
    Object.assign(user, verification);
    await user.save();

    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verification.verificationToken}`;

    await sendEmail({
      to: user.userEmail,
      subject: "Verify Your Email",
      html: registerTemplate(verificationLink),
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

    const { verificationToken, verificationTokenExpires } =
      generateVerificationToken();
    // Generate reset token
    const resetPasswordToken = verificationToken;
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`;
    // Save token and expiry
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordTokenExpires = verificationTokenExpires;

    await user.save();
    const userName = user.userName;
    // Send email
    await sendEmail({
      to: user.userEmail,
      subject: "Reset Your Password",
      html: passwordResetTemplate({ userName: user.userName, resetLink }),
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

    if (userPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
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
    if (
      !user.resetPasswordTokenExpires ||
      user.resetPasswordTokenExpires < new Date()
    ) {
      user.resetPasswordToken = null;
      user.resetPasswordTokenExpires = null;
      await user.save();
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
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const isMatch = await bcrypt.compare(userPassword, user.userPassword);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }
    //const token = GenerateToken(user);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login Successful",
      accessToken,
      user: {
        userId: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: user.role,
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    // Get refresh token from HTTP-only cookie
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        message: "Refresh token not found.",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findById(decoded.userId).select("-userPassword");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Generate new access token
    //const accessToken = generateAccessToken(user);
    const newAccessToken = GenerateToken({
      _id: decoded.userId,
    });
    return res.status(200).json({
      message: "Access token refreshed successfully.",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);

    return res.status(401).json({
      message: "Invalid or expired refresh token.",
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
        code: "VERIFICATION_TOKEN_EXPIRED",
      });
    }

    if (user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({
        message: "Verification link has expired.",
        code: "VERIFICATION_TOKEN_EXPIRED",
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

const resendVerification = async (req, res) => {
  try {
    // Get Email
    const userEmail = req.body.userEmail?.trim().toLowerCase();

    // Validate Email
    if (!userEmail) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    // Find User
    const user = await User.findOne({ userEmail });

    // Don't reveal whether email exists
    if (!user) {
      return res.status(200).json({
        message:
          "If an account with that email exists, we've sent a verification email.",
      });
    }

    // Already verified
    if (user.isVerified) {
      return res.status(400).json({
        message: "Your email is already verified. Please login.",
      });
    }

    // Generate New Token
    const verification = generateVerificationToken();

    Object.assign(user, verification);

    await user.save();

    // Send Verification Email
    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verification.verificationToken}`;

    await sendEmail({
      to: user.userEmail,
      subject: "Verify Your Email",
      html: resendVerificationTemplate(verificationLink),
    });

    return res.status(200).json({
      message:
        "If an account with that email exists, we've sent a verification email.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};
const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      message: "Internal Server Error.",
    });
  }
};

const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "userName userEmail role",
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Welcome to Profile",

      userData: {
        userId: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
module.exports = {
  register,
  login,
  profile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerification,
  refreshToken,
  logout,
};
