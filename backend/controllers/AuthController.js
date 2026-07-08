const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const GenerateToken = require("../utils/GenerateToken");

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

    // Hash password
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Save user
    const user = new User({
      userName,
      userEmail,
      userPassword: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      message: "Registration Successful",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Internal Server Error",
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
};
