const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/AuthMiddleware");
const authorizePermission = require("../middleware/authorizePermission");

const PERMISSIONS = require("../config/permissions");

const {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
} = require("../controllers/userController");

// GET ALL USERS
router.get(
  "/",
  verifyToken,
  authorizePermission(PERMISSIONS.USERS_READ),
  getAllUsers,
);

// GET SINGLE USER
router.get(
  "/:id",
  verifyToken,
  authorizePermission(PERMISSIONS.USERS_READ),
  getUserById,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission(PERMISSIONS.USERS_UPDATE),
  updateUser,
);
router.patch(
  "/:id/role",
  verifyToken,
  authorizePermission(PERMISSIONS.USERS_ROLE_UPDATE),
  updateUserRole,
);
module.exports = router;
