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
    const { link, display_order, is_active } = req.body;
    const { image_desktop, image_mobile } = req.files;

    if (!image_desktop || !image_mobile) {
      return res
        .status(400)
        .json({ message: "Gambar untuk desktop dan mobile wajib diisi." });
    }

    // Konsisten path
    const image_url_desktop = `/uploads/slides/image_desktop/${image_desktop[0].filename}`;
    const image_url_mobile = `/uploads/slides/image_mobile/${image_mobile[0].filename}`;

    const newSlide = await HeaderSlide.create({
      link: link,
      image_url_desktop,
      image_url_mobile,
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
    const { link, display_order, is_active } = req.body;
    const files = req.files;

    const slide = await HeaderSlide.findByPk(id);
    if (!slide)
      return res.status(404).json({ message: "Slide tidak ditemukan." });

    const updateData = {
      link: link || slide.link,
      display_order: parseInt(display_order, 10) || slide.display_order,
      is_active: is_active === "true" || is_active === true,
    };

    // Helper to delete old image
    const deleteOldImage = (imageUrl) => {
      if (imageUrl) {
        const oldImagePath = path.join(__dirname, "..", imageUrl.substring(1));
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
    };

    if (files.image_desktop) {
      deleteOldImage(slide.image_url_desktop);
      updateData.image_url_desktop = `/uploads/slides/image_desktop/${files.image_desktop[0].filename}`;
    }
    if (files.image_mobile) {
      deleteOldImage(slide.image_url_mobile);
      updateData.image_url_mobile = `/uploads/slides/image_mobile/${files.image_mobile[0].filename}`;
    }

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

    const deleteImage = (imageUrl) => {
      if (imageUrl) {
        const imagePath = path.join(__dirname, "..", imageUrl.substring(1));
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }
    };

    deleteImage(slide.image_url_desktop);
    deleteImage(slide.image_url_mobile);

    await slide.destroy();
    res.status(200).json({ message: "Slide berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting header slide:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
