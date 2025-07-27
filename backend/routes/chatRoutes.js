const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getOrCreateConversation,
  sendMessage,
  getAllConversationsAdmin,
  getMessagesForConversationAdmin,
  sendMessageAdmin,
  markConversationAsRead,
  markConversationAsReadAdmin,
} = require("../controllers/chatController");

// User routes
router.get("/conversation", getOrCreateConversation);
router.post("/messages", sendMessage);
router.put("/conversations/:conversationId/read", markConversationAsRead);

// Admin routes
router.get("/admin/conversations", authMiddleware, getAllConversationsAdmin);
router.get("/admin/conversations/:conversationId/messages", authMiddleware, getMessagesForConversationAdmin);
router.post("/admin/messages", authMiddleware, sendMessageAdmin);
router.put("/admin/conversations/:conversationId/read", authMiddleware, markConversationAsReadAdmin);

module.exports = router;