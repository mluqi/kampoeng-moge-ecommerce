const {
  Conversation,
  Message,
  User,
  Product,
  sequelize,
} = require("../models");
const { getToken } = require("next-auth/jwt");
const { Op } = require("sequelize");

const parseProductPictures = (product) => {
  if (
    product &&
    product.product_pictures &&
    typeof product.product_pictures === "string"
  ) {
    try {
      product.product_pictures = JSON.parse(product.product_pictures);
    } catch (e) {
      product.product_pictures = [];
    }
  }
};

const getUserIdFromToken = async (req) => {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
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
          include: [
            { model: User, as: "sender" },
            {
              model: Product,
              as: "product",
            },
          ],
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

    // Parse product JSON fields if they exist in messages
    const conversationJSON = conversation.toJSON();
    if (conversationJSON.messages) {
      conversationJSON.messages = conversationJSON.messages.map((msg) => {
        if (msg.product) {
          parseProductPictures(msg.product);
        }
        return msg;
      });
    }
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

    const { conversationId, content, product_id } = req.body;

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

    // [BARU] Cek apakah ada file gambar yang diunggah
    const imageUrl = req.file ? `/uploads/chat/${req.file.filename}` : null;

    const message = await Message.create(
      {
        conversationId,
        senderId,
        content,
        sender_role: "admin",
        product_id: product_id || null, // Pesan dari admin tidak terkait produk
        image_url: imageUrl, // Simpan URL gambar
      },
      { transaction: t }
    );

    conversation.lastMessageAt = new Date();
    await conversation.save({ transaction: t });

    await t.commit();

    // Ambil kembali pesan yang baru dibuat dengan data produknya untuk dikirim ke client
    const newMessage = await Message.findByPk(message.id, {
      include: [
        { model: User, as: "sender" },
        { model: Product, as: "product" },
      ],
    });

    const newMessageJSON = newMessage.toJSON();
    if (newMessageJSON.product) {
      parseProductPictures(newMessageJSON.product);
    }

    res.status(201).json(newMessageJSON);
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

    const { conversationId, content, product_id } = req.body;

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

    // [BARU] Cek apakah ada file gambar yang diunggah
    const imageUrl = req.file ? `/uploads/chat/${req.file.filename}` : null;

    const message = await Message.create(
      {
        conversationId,
        senderId,
        sender_role: "user",
        content,
        product_id: product_id || null,
        image_url: imageUrl, // Simpan URL gambar
      },
      { transaction: t }
    );

    // Update timestamp pesan terakhir
    conversation.lastMessageAt = new Date();
    await conversation.save({ transaction: t });

    await t.commit();

    // Ambil kembali pesan yang baru dibuat dengan data produknya untuk dikirim ke client
    const newMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["user_id", "user_name", "user_photo"],
        },
        {
          model: Product,
          as: "product",
        },
      ],
    });

    const newMessageJSON = newMessage.toJSON();
    if (newMessageJSON.product) {
      parseProductPictures(newMessageJSON.product);
    }

    res.status(201).json(newMessageJSON);
  } catch (error) {
    await t.rollback();
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * [BARU] Endpoint untuk Long Polling
 * Klien akan memanggil endpoint ini untuk memeriksa pesan baru.
 */
exports.getNewMessages = async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { conversationId, lastMessageId } = req.query;

    if (!conversationId || !lastMessageId) {
      return res
        .status(400)
        .json({ message: "Conversation ID dan Last Message ID diperlukan." });
    }

    // Cari pesan baru yang ID-nya lebih besar dari lastMessageId
    const newMessages = await Message.findAll({
      where: {
        conversationId: conversationId,
        id: { [Op.gt]: lastMessageId },
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["user_id", "user_name", "user_photo"],
        },
        {
          model: Product,
          as: "product",
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const messagesJSON = newMessages.map((msg) => {
      const msgJSON = msg.toJSON();
      if (msgJSON.product) parseProductPictures(msgJSON.product);
      return msgJSON;
    });

    res.status(200).json(messagesJSON);
  } catch (error) {
    console.error("Error polling for new messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getNewMessagesAdmin = async (req, res) => {
  try {
    // Admin ID sudah diverifikasi oleh authMiddleware, jadi tidak perlu cek manual.
    const { conversationId, lastMessageId } = req.query;

    if (!conversationId || !lastMessageId) {
      return res
        .status(400)
        .json({ message: "Conversation ID dan Last Message ID diperlukan." });
    }

    // Cari pesan baru yang ID-nya lebih besar dari lastMessageId
    const newMessages = await Message.findAll({
      where: {
        conversationId: conversationId,
        id: { [Op.gt]: lastMessageId },
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["user_id", "user_name", "user_photo"],
        },
        {
          model: Product,
          as: "product",
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const messagesJSON = newMessages.map((msg) => {
      const msgJSON = msg.toJSON();
      if (msgJSON.product) parseProductPictures(msgJSON.product);
      return msgJSON;
    });

    res.status(200).json(messagesJSON);
  } catch (error) {
    console.error("Error polling for new admin messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- ADMIN ---

exports.getConversationUpdatesAdmin = async (req, res) => {
  try {
    const { lastFetchTimestamp } = req.query;
    if (!lastFetchTimestamp) {
      return res
        .status(400)
        .json({ message: "lastFetchTimestamp is required." });
    }

    const unreadCountSubquery = sequelize.literal(`(
      SELECT COUNT(*)
      FROM \`Message\`
      WHERE
        \`Message\`.\`conversationId\` = \`Conversation\`.\`id\` AND
        \`Message\`.\`isRead\` = false AND
        \`Message\`.\`sender_role\` = 'user'
    )`);

    const updatedConversations = await Conversation.findAll({
      where: {
        lastMessageAt: {
          [Op.gt]: new Date(lastFetchTimestamp),
        },
      },
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
          include: [{ model: Product, as: "product" }],
        },
      ],
      order: [["lastMessageAt", "DESC"]],
    });

    const conversationsJSON = updatedConversations.map((convo) => {
      const convoJSON = convo.toJSON();
      if (
        convoJSON.messages &&
        convoJSON.messages[0] &&
        convoJSON.messages[0].product
      ) {
        parseProductPictures(convoJSON.messages[0].product);
      }
      return convoJSON;
    });

    res.status(200).json(conversationsJSON);
  } catch (error) {
    console.error("Error getting conversation updates for admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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
          include: [{ model: Product, as: "product" }],
        },
      ],
      order: [["lastMessageAt", "DESC"]],
    });

    const conversationsJSON = conversations.map((convo) => {
      const convoJSON = convo.toJSON();
      if (
        convoJSON.messages &&
        convoJSON.messages[0] &&
        convoJSON.messages[0].product
      ) {
        parseProductPictures(convoJSON.messages[0].product);
      }
      return convoJSON;
    });

    res.status(200).json(conversationsJSON);
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
        {
          model: Product,
          as: "product",
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const messagesJSON = messages.map((msg) => {
      const msgJSON = msg.toJSON();
      if (msgJSON.product) parseProductPictures(msgJSON.product);
      return msgJSON;
    });

    res.status(200).json(messagesJSON);
  } catch (error) {
    console.error("Error getting messages for admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
