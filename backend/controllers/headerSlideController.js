const { header_slides: HeaderSlide } = require("../models");
const fs = require("fs");
const path = require("path");

// Public: Get all active header slides
exports.getActiveHeaderSlides = async (req, res) => {
  try {
    const slides = await HeaderSlide.findAll({
      where: { is_active: true },
      order: [["display_order", "ASC"]],
    });
    res.status(200).json(slides);
  } catch (error) {
    console.error("Error fetching active header slides:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// --- Admin Functions ---

// Admin: Get all header slides
exports.getAllHeaderSlides = async (req, res) => {
  try {
    const slides = await HeaderSlide.findAll({
      order: [["display_order", "ASC"]],
    });
    res.status(200).json(slides);
  } catch (error) {
    console.error("Error fetching all header slides:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Admin: Create a new header slide
exports.createHeaderSlide = async (req, res) => {
  try {
    const {
      title,
      offer_text,
      button1_text,
      button1_link,
      button2_text,
      button2_link,
      display_order,
      is_active,
    } = req.body;

    if (!title || !req.file) {
      return res.status(400).json({ message: "Judul dan gambar wajib diisi." });
    }

    const image_url = `/uploads/slides/${req.file.filename}`;

    const newSlide = await HeaderSlide.create({
      title,
      offer_text,
      image_url,
      button1_text,
      button1_link,
      button2_text,
      button2_link,
      display_order: parseInt(display_order, 10) || 0,
      is_active: is_active === "true" || is_active === true,
    });

    res
      .status(201)
      .json({ message: "Slide berhasil ditambahkan.", slide: newSlide });
  } catch (error) {
    console.error("Error creating header slide:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Admin: Update a header slide
exports.updateHeaderSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      offer_text,
      button1_text,
      button1_link,
      button2_text,
      button2_link,
      display_order,
      is_active,
    } = req.body;

    const slide = await HeaderSlide.findByPk(id);
    if (!slide)
      return res.status(404).json({ message: "Slide tidak ditemukan." });

    const updateData = {
      title,
      offer_text,
      button1_text,
      button1_link,
      button2_text,
      button2_link,
      display_order: parseInt(display_order, 10) || 0,
      is_active: is_active === "true" || is_active === true,
    };

    if (req.file) {
      if (slide.image_url) {
        // Perbaikan: Hapus '/' dari awal path untuk membuat path file sistem yang benar
        const oldImagePath = path.join(
          __dirname,
          "..",
          slide.image_url.substring(1)
        );
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      updateData.image_url = `/uploads/slides/${req.file.filename}`;
    }

    // Lakukan update. Jika tidak ada file baru, image_url tidak akan diubah.
    await slide.update(updateData);

    res.status(200).json({ message: "Slide berhasil diperbarui.", slide });
  } catch (error) {
    console.error("Error updating header slide:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Admin: Delete a header slide
exports.deleteHeaderSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const slide = await HeaderSlide.findByPk(id);
    if (!slide)
      return res.status(404).json({ message: "Slide tidak ditemukan." });

    if (slide.image_url) {
      // Perbaikan: Hapus '/' dari awal path
      const imagePath = path.join(
        __dirname,
        "..",
        slide.image_url.substring(1)
      );
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    await slide.destroy();
    res.status(200).json({ message: "Slide berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting header slide:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
