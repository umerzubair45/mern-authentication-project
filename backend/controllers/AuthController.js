const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//const GenerateToken = require("../utils/GenerateToken");
const generateVerificationToken = require("../utils/GenerateVerificationToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");
const {
  registerTemplate,
  passwordResetTemplate,
  resendVerificationTemplate,
} = require("../utils/emailTemplates");
const AppError = require("../utils/AppError");
const { error } = require("console");
const emailQueue = require("../queues/emailQueue");

const register = async (req, res, next) => {
  try {
    const { userName, userEmail, userPassword, userConfirmPassword } = req.body;

    // Check existing email
    const existingUser = await User.findOne({
      userEmail,
    });

    if (existingUser) {
      throw new AppError("Email already exists", 409);
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

    /*  await sendEmail({
      to: user.userEmail,
      subject: "Verify Your Email",
      html: registerTemplate({ userName: user.userName, verificationLink }),
    });*/

    await emailQueue.add(
      "send-verification-email",
      {
        to: user.userEmail,
        userName: user.userName,
        verificationLink,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );
    console.log("Job added in QUEUE");
    res.status(201).json({
      message: "Registration successful. Please verify your email.",
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const userEmail = req.body.userEmail?.trim().toLowerCase();

    // Validate email
    if (!userEmail) {
      throw new AppError("Email is required.", 400);
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
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;

    const { userPassword, userConfirmPassword } = req.body;

    // Validate required fields
    if (!userPassword || !userConfirmPassword) {
      throw new AppError("All fields are required.", 400);
    }

    if (userPassword.length < 8) {
      throw new AppError("Password must be at least 8 characters.", 400);
    }

    // Check password match
    if (userPassword !== userConfirmPassword) {
      throw new AppError("Passwords do not match.", 400);
    }

    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: token,
    });

    if (!user) {
      throw new AppError("Invalid reset link.", 400);
    }

    // Check token expiry
    if (
      !user.resetPasswordTokenExpires ||
      user.resetPasswordTokenExpires < new Date()
    ) {
      user.resetPasswordToken = null;
      user.resetPasswordTokenExpires = null;
      await user.save();
      throw new AppError("Reset link has expired.", 400);
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
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { userEmail, userPassword } = req.body;

    if (!userEmail || !userPassword) {
      throw new AppError("All fields are required", 400);
    }

    const user = await User.findOne({
      userEmail,
    });

    /* if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }*/

    if (!user) {
      throw new AppError("User not found Error through.", 404);
    }

    if (!user.isVerified) {
      throw new AppError(
        "Please verify your email before logging in.",
        403,
        "EMAIL_NOT_VERIFIED",
      );
    }

    const isMatch = await bcrypt.compare(userPassword, user.userPassword);

    if (!isMatch) {
      throw new AppError("Invalid Password", 401);
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
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    // Get refresh token from HTTP-only cookie
    const token = req.cookies.refreshToken;

    if (!token) {
      throw new AppError("Refresh token not found.", 401);
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findById(decoded.userId).select("-userPassword");

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    // Generate new access token
    //const accessToken = generateAccessToken(user);
    // const newAccessToken = GenerateToken({
    //   _id: decoded.userId,
    //});
    const newAccessToken = generateAccessToken(user);
    return res.status(200).json({
      message: "Access token refreshed successfully.",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);

    next(
      new AppError(
        "Invalid or expired refresh token.",
        401,
        "INVALID_REFRESH_TOKEN",
      ),
    );
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError(
        "Invalid or expired verification link.",
        404,
        "VERIFICATION_TOKEN_EXPIRED",
      );
    }

    if (user.verificationTokenExpires < Date.now()) {
      throw new AppError(
        "Verification link has expired.",
        400,
        "VERIFICATION_TOKEN_EXPIRED",
      );
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (error) {
    console.log(err);
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    // Get Email
    const userEmail = req.body.userEmail?.trim().toLowerCase();

    // Validate Email
    if (!userEmail) {
      throw new AppError("Email is required.", 400);
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
      throw new AppError("Your email is already verified. Please login.", 400);
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
    next(error);
  }
};
const logout = async (req, res, next) => {
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
    next(error);
  }
};

const profile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "userName userEmail role",
    );

    if (!user) {
      throw new AppError("User not found", 404);
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
    next(error);
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
