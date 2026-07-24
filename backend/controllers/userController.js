const User = require("../models/User");
const mongoose = require("mongoose");

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

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check whether email is being changed
    const emailChanged =
      userEmail &&
      userEmail.toLowerCase().trim() !== user.userEmail.toLowerCase().trim();

    // Update username
    if (userName) {
      user.userName = userName;
    }

    // Update email
    if (emailChanged) {
      user.userEmail = userEmail.toLowerCase().trim();

      // New email must be verified
      user.isVerified = false;
    }

    await user.save();

    return res.status(200).json({
      message: emailChanged
        ? "User updated. New email requires verification."
        : "User updated successfully.",

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
