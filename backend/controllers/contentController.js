const { site_content } = require("../models");
const { createActivityLog } = require("../services/logService");

// Untuk Publik (mengambil satu konten)
exports.getContentByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const content = await site_content.findOne({ where: { content_key: key } });
    if (!content) {
      return res.status(404).json({ message: "Konten tidak ditemukan." });
    }
    res.status(200).json(content);
  } catch (error) {
    console.error("Error in getContentByKey:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// --- Fungsi untuk Admin CMS ---

// Mengambil semua konten untuk ditampilkan di CMS
exports.getAllContents = async (req, res) => {
  try {
    const contents = await site_content.findAll({
      order: [["content_title", "ASC"]],
    });
    res.status(200).json(contents);
  } catch (error) {
    console.error("Error in getAllContents:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Memperbarui konten
exports.updateContent = async (req, res) => {
  const { id } = req.params;
  const { content_title, content_value } = req.body;
  try {
    if (!content_title || !content_value) {
      return res
        .status(400)
        .json({ message: "Judul dan isi konten tidak boleh kosong." });
    }

    const content = await site_content.findByPk(id);
    if (!content) {
      return res.status(404).json({ message: "Konten tidak ditemukan." });
    }

    const oldData = content.toJSON();
    const newData = { content_title, content_value };
    const changes = {};

    for (const key in newData) {
      if (newData[key] !== oldData[key]) {
        changes[key] = { before: oldData[key], after: newData[key] };
      }
    }

    content.content_title = content_title;
    content.content_value = content_value;
    await content.save();

    if (Object.keys(changes).length > 0) {
      await createActivityLog(
        req,
        req.user,
        "UPDATE",
        { type: "SiteContent", id: id },
        changes
      );
    }

    res.status(200).json({ message: "Konten berhasil diperbarui.", content });
  } catch (error) {
    console.error("Error in updateContent:", error);
    await createActivityLog(
      req,
      req.user,
      "UPDATE",
      { type: "SiteContent", id: id },
      {
        error: error.message,
        attemptedChanges: { content_title, content_value },
      },
      "FAILED"
    );
    res.status(500).json({ message: "Internal server error." });
  }
};
