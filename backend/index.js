const express = require("express");
const mongoose = require("mongoose");
const DbConnection = require("./DbConnection");
const User = require("./models/User");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.listen(5051, () => {
  console.log("server is running on port number:5051");
});

DbConnection();

app.post("/register", async (req, res) => {
  console.log(req.body);
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
