const { login_banner: loginBanner } = require("../models");
const fs = require("fs");
const path = require("path");

exports.getActiveLoginBanners = async (req, res) => {
  try {
    const banners = await loginBanner.findAll({
      where: { is_active: true },
      order: [["display_order", "ASC"]],
    });
    res.status(200).json(banners);
  } catch (error) {
    console.error("Error fetching active login banners:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// --- Admin Functions ---

exports.getAllLoginBanners = async (req, res) => {
  try {
    const banners = await loginBanner.findAll({
      order: [["display_order", "ASC"]],
    });
    res.status(200).json(banners);
  } catch (error) {
    console.error("Error fetching all login banners:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.createLoginBanner = async (req, res) => {
  try {
    const { display_order, is_active } = req.body;
    if (!req.file)
      return res.status(400).json({ message: "Gambar wajib diunggah." });

    if (!display_order || !req.file) {
      return res.status(400).json({ message: "Data tidak lengkap." });
    }

    const image_url = `/uploads/login_banners/${req.file.filename}`;

    const newBanner = await loginBanner.create({
      images: image_url,
      display_order: parseInt(display_order, 10) || 0,
      is_active: is_active === "true" || is_active === true,
    });

    res
      .status(201)
      .json({ message: "Banner berhasil ditambahkan.", banner: newBanner });
  } catch (error) {
    console.error("Error creating login banner:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.updateLoginBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { display_order, is_active } = req.body;

    const banner = await loginBanner.findByPk(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner tidak ditemukan." });
    }

    const updateData = {
      display_order: parseInt(display_order, 10) || banner.display_order,
      is_active: is_active === "true" || is_active === true,
    };

    if (req.file) {
      // Hapus gambar lama jika ada
      if (banner.images) {
        const oldImagePath = path.join(__dirname, "..", banner.images.substring(1));
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      updateData.images = `/uploads/login_banners/${req.file.filename}`;
    }

    await banner.update(updateData);
    res.status(200).json({ message: "Banner berhasil diperbarui.", banner });
  } catch (error) {
    console.error("Error updating login banner:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.deleteLoginBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await loginBanner.findByPk(id);
    if (!banner)
      return res.status(404).json({ message: "Banner tidak ditemukan." });

    if (banner.images) {
      const imagePath = path.join(
        __dirname,
        "..",
        banner.images.substring(1)
      );
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await banner.destroy();
    res.status(200).json({ message: "Banner berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting login banner:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
