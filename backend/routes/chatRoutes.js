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
  getNewMessages,
  getNewMessagesAdmin,
  getConversationUpdatesAdmin,
} = require("../controllers/chatController");

// User routes
router.get("/conversation", getOrCreateConversation);
router.post("/messages", sendMessage);
router.put("/conversations/:conversationId/read", markConversationAsRead);

// [BARU] Route untuk long polling pesan baru oleh user
router.get("/new-messages", getNewMessages);

// Admin routes
router.get("/admin/conversations", authMiddleware, getAllConversationsAdmin);
router.get(
  "/admin/conversations/updates",
  authMiddleware,
  getConversationUpdatesAdmin
);
router.get(
  "/admin/conversations/:conversationId/messages",
  authMiddleware,
  getMessagesForConversationAdmin
);
router.post("/admin/messages", authMiddleware, sendMessageAdmin);
router.put(
  "/admin/conversations/:conversationId/read",
  authMiddleware,
  markConversationAsReadAdmin
);
router.get("/admin/new-messages", authMiddleware, getNewMessagesAdmin);

module.exports = router;
