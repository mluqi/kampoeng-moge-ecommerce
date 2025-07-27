const { Conversation, Message, User, sequelize } = require("../models");
const { getToken } = require("next-auth/jwt");
const { Op } = require("sequelize");

const getUserIdFromToken = async (req) => {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return null;
  const user = await User.findOne({ where: { user_email: token.email } });
  return user ? user.user_id : null;
};

exports.getOrCreateConversation = async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const [conversation] = await Conversation.findOrCreate({
      where: { userId },
      defaults: { userId, lastMessageAt: new Date() },
      include: [
        {
          model: Message,
          as: "messages",
          include: [{ model: User, as: "sender" }],
        },
      ],
      order: [[{ model: Message, as: "messages" }, "createdAt", "ASC"]],
    });

    const unreadCount = await Message.count({
      where: {
        conversationId: conversation.id,
        isRead: false,
        senderId: { [Op.ne]: userId }, // Hitung pesan yang dikirim oleh pihak lain
      },
    });

    const conversationJSON = conversation.toJSON();
    conversationJSON.unreadCount = unreadCount;

    res.status(200).json(conversationJSON);
  } catch (error) {
    console.error("Error getting or creating conversation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.sendMessageAdmin = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // Dapatkan ID admin dari middleware, bukan dari token
    const senderId = req.user.id;
    if (!senderId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Admin not found." });
    }

    const { conversationId, content } = req.body;

    if (!content || !conversationId) {
      return res
        .status(400)
        .json({ message: "Konten dan ID percakapan diperlukan." });
    }

    const conversation = await Conversation.findByPk(conversationId, {
      transaction: t,
    });
    if (!conversation) {
      return res.status(404).json({ message: "Percakapan tidak ditemukan." });
    }

    const message = await Message.create(
      { conversationId, senderId, content, sender_role: "admin" },
      { transaction: t }
    );

    conversation.lastMessageAt = new Date();
    await conversation.save({ transaction: t });

    await t.commit();

    const receiverId = conversation.userId;
    req.io
      .to(receiverId.toString())
      .emit("receive_message", { ...message.get(), conversationId });

    res.status(201).json(message);
  } catch (error) {
    await t.rollback();
    console.error("Error sending message from admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.markConversationAsRead = async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { conversationId } = req.params;

    await Message.update(
      { isRead: true },
      {
        where: {
          conversationId: conversationId,
          senderId: { [Op.ne]: userId }, // Tandai pesan dari pihak lain sebagai telah dibaca
        },
      }
    );

    res.status(200).json({ message: "Messages marked as read." });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mengirim pesan
exports.sendMessage = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const senderId = await getUserIdFromToken(req);
    if (!senderId) return res.status(401).json({ message: "Unauthorized" });

    const { conversationId, content } = req.body;
    const adminId = 1; // Asumsi ID admin selalu 1

    if (!content || !conversationId) {
      return res
        .status(400)
        .json({ message: "Konten dan ID percakapan diperlukan." });
    }

    const conversation = await Conversation.findByPk(conversationId, {
      transaction: t,
    });
    if (!conversation) {
      return res.status(404).json({ message: "Percakapan tidak ditemukan." });
    }

    const message = await Message.create(
      {
        conversationId,
        senderId,
        sender_role: "user",
        content,
      },
      { transaction: t }
    );

    // Update timestamp pesan terakhir
    conversation.lastMessageAt = new Date();
    await conversation.save({ transaction: t });

    await t.commit();

    // Emit pesan via Socket.IO
    const receiverId =
      senderId === conversation.userId ? adminId : conversation.userId;
    req.io
      .to(receiverId.toString())
      .emit("receive_message", { ...message.get(), conversationId });

    res.status(201).json(message);
  } catch (error) {
    await t.rollback();
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- ADMIN ---

exports.getAllConversationsAdmin = async (req, res) => {
  try {
    const unreadCountSubquery = sequelize.literal(`(
      SELECT COUNT(*)
      FROM \`Message\`
      WHERE
        \`Message\`.\`conversationId\` = \`Conversation\`.\`id\` AND
        \`Message\`.\`isRead\` = false AND
        \`Message\`.\`sender_role\` = 'user'
    )`);

    const conversations = await Conversation.findAll({
      attributes: { include: [[unreadCountSubquery, "unreadCount"]] },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "user_name", "user_email", "user_photo"],
        },
        {
          model: Message,
          as: "messages",
          limit: 1,
          order: [["createdAt", "DESC"]],
        },
      ],
      order: [["lastMessageAt", "DESC"]],
    });
    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error getting all conversations for admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.markConversationAsReadAdmin = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.update(
      { isRead: true },
      {
        where: {
          conversationId: conversationId,
          sender_role: "user",
        },
      }
    );

    res.status(200).json({ message: "Messages marked as read by admin." });
  } catch (error) {
    console.error("Error marking messages as read by admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMessagesForConversationAdmin = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.findAll({
      where: { conversationId },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["user_id", "user_name", "user_photo"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error getting messages for admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
