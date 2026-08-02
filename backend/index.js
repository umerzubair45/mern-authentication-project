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
const helmet = require("helmet");
const errorHandler = require("./middleware/errorHandler");
require("./workers/emailWorker");
const http = require("http");
const { Server } = require("socket.io");
const initializeSocket = require("./sockets/socket");

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request payload is too large.",
    });
  }

  next(err);
});

app.use(errorHandler);
/*app.listen(5051, () => {
  console.log("server is running on port number:5051");
});*/
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

initializeSocket(io);

server.listen(5051, () => {
  console.log("Server running on port 5051");
});

DbConnection();
