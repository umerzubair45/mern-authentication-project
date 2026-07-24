const express = require("express");
const mongoose = require("mongoose");
const DbConnection = require("./config/DbConnection");
const User = require("./models/User");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const verifyToken = require("./middleware/AuthMiddleware");
const authRoutes = require("./routes/AuthRoutes");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.listen(5051, () => {
  console.log("server is running on port number:5051");
});

DbConnection();

/*app.post("/registerrr", async (req, res) => {
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
});

app.post("/login", async (req, res) => {
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

    const token = jwt.sign(
      {
        userId: user._id,
        userEmail: user.userEmail,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.status(200).json({
      message: "Login Successful",
      token,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});*/
app.get("/profile", verifyToken, (req, res) => {
  console.log(req.user);
  res.json({
    message: "Welcome to Profile",
  });
});

//app.use(authRoutes);
