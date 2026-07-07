const express = require("express");

const router = express.Router();

const { register } = require("../controllers/AuthController");
const { login } = require("../controllers/AuthController");
const { profile } = require("../controllers/AuthController");
const verifyToken = require("../middleware/AuthMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, profile);

module.exports = router;
