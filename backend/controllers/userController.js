const User = require("../models/User");
const mongoose = require("mongoose");
const generateVerificationToken = require("../utils/generateVerificationToken");
const {
  newEmailVerificationTemplate,
  oldEmailNotificationTemplate,
} = require("../utils/emailTemplates");

const sendEmail = require("../utils/sendEmail");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user.userId },
    }).select("-userPassword -verificationToken -resetPasswordToken");

    return res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }
    const user = await User.findById(id).select(
      "-userPassword -verificationToken -resetPasswordToken",
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { userName, userEmail } = req.body;

    // =========================
    // FIND USER
    // =========================

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // =========================
    // CHECK EMAIL CHANGE
    // =========================

    const newEmail = userEmail?.trim().toLowerCase();

    const oldEmail = user.userEmail.toLowerCase();

    const emailChanged = newEmail && newEmail !== oldEmail;

    // =========================
    // CHECK NEW EMAIL EXISTS
    // =========================

    if (emailChanged) {
      const existingUser = await User.findOne({
        userEmail: newEmail,
        _id: { $ne: id },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "This email address is already registered.",
        });
      }
    }

    // =========================
    // UPDATE USERNAME
    // =========================

    if (userName) {
      user.userName = userName.trim();
    }

    // =========================
    // EMAIL CHANGE
    // =========================

    if (emailChanged) {
      // Update email
      user.userEmail = newEmail;

      // New email is not verified
      user.isVerified = false;

      // Generate new verification token
      const { verificationToken, verificationTokenExpires } =
        generateVerificationToken();

      // Save verification token
      user.verificationToken = verificationToken;
      user.verificationTokenExpires = verificationTokenExpires;
      // Verification URL
      const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

      // =========================
      // SAVE USER
      // =========================

      await user.save();

      // =========================
      // SEND EMAIL TO NEW EMAIL
      // =========================

      const verificationEmail = newEmailVerificationTemplate({
        userName: user.userName,
        verificationLink,
      });

      await sendEmail({
        to: newEmail,

        subject: "Verify Your New Email Address",

        html: verificationEmail,
      });

      // =========================
      // SEND SECURITY EMAIL
      // TO OLD EMAIL
      // =========================

      const securityEmail = oldEmailNotificationTemplate({
        userName: user.userName,
        newEmail,
      });

      // Don't fail user update if
      // security notification fails
      try {
        await sendEmail({
          to: oldEmail,

          subject: "Your Account Email Address Was Changed",

          html: securityEmail,
        });
      } catch (emailError) {
        console.error("Old email notification failed:", emailError);
      }

      return res.status(200).json({
        message:
          "User email updated. Verification email sent to the new address.",

        user: {
          _id: user._id,
          userName: user.userName,
          userEmail: user.userEmail,
          role: user.role,
          isVerified: user.isVerified,
        },
      });
    }

    // =========================
    // SAVE USERNAME ONLY
    // =========================

    await user.save();

    return res.status(200).json({
      message: "User updated successfully.",

      user: {
        _id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Validate role
    const allowedRoles = ["user", "manager", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Prevent admin from changing their own role
    if (req.user.userId === id) {
      return res.status(403).json({
        message: "You cannot change your own role",
      });
    }

    // Update role
    user.role = role;

    await user.save();

    return res.status(200).json({
      message: "User role updated successfully",
      user: {
        _id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
};
