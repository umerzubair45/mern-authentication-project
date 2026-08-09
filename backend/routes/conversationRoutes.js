const express = require("express");
const verifyToken = require("../middleware/AuthMiddleware");
const {
  createConversation,
  getConversations,
  resetUnreadCount,
} = require("../controllers/conversationController");

const router = express.Router();

router.post("/", verifyToken, createConversation);
router.get("/", verifyToken, getConversations);
router.patch("/:conversationId/unread", verifyToken, resetUnreadCount);

module.exports = router;
