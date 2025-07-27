const { site_content } = require("../models");

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
  try {
    const { id } = req.params;
    const { content_title, content_value } = req.body;

    if (!content_title || !content_value) {
      return res
        .status(400)
        .json({ message: "Judul dan isi konten tidak boleh kosong." });
    }

    const content = await site_content.findByPk(id);
    if (!content) {
      return res.status(404).json({ message: "Konten tidak ditemukan." });
    }

    content.content_title = content_title;
    content.content_value = content_value;
    await content.save();

    res.status(200).json({ message: "Konten berhasil diperbarui.", content });
  } catch (error) {
    console.error("Error in updateContent:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
