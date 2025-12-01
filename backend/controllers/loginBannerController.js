const { login_banner: loginBanner } = require("../models");
const fs = require("fs");
const path = require("path");
const { createActivityLog } = require("../services/logService");

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
  const { display_order, is_active } = req.body;
  try {
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

    await createActivityLog(
      req,
      req.user,
      "CREATE",
      { type: "LoginBanner", id: newBanner.id },
      { newData: newBanner.toJSON() }
    );

    res
      .status(201)
      .json({ message: "Banner berhasil ditambahkan.", banner: newBanner });
  } catch (error) {
    console.error("Error creating login banner:", error);
    await createActivityLog(
      req,
      req.user,
      "CREATE",
      { type: "LoginBanner", id: "N/A" },
      { error: error.message, attemptedData: { display_order, is_active } },
      "FAILED"
    );
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.updateLoginBanner = async (req, res) => {
  const { id } = req.params;
  const { display_order, is_active } = req.body;
  try {
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
        const oldImagePath = path.join(
          __dirname,
          "..",
          banner.images.substring(1)
        );
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      updateData.images = `/uploads/login_banners/${req.file.filename}`;
    }

    const oldData = banner.toJSON();
    const changes = {};

    // Bandingkan data lama dan baru untuk mencatat perubahan
    for (const key in updateData) {
      if (String(updateData[key]) !== String(oldData[key])) {
        changes[key] = { before: oldData[key], after: updateData[key] };
      }
    }

    await banner.update(updateData);

    // Hanya catat log jika ada perubahan
    if (Object.keys(changes).length > 0) {
      await createActivityLog(
        req,
        req.user,
        "UPDATE",
        { type: "LoginBanner", id: id },
        changes
      );
    }
    res.status(200).json({ message: "Banner berhasil diperbarui.", banner });
  } catch (error) {
    console.error("Error updating login banner:", error);
    await createActivityLog(
      req,
      req.user,
      "UPDATE",
      { type: "LoginBanner", id: id },
      { error: error.message, attemptedChanges: { display_order, is_active } },
      "FAILED"
    );
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.deleteLoginBanner = async (req, res) => {
  const { id } = req.params;
  try {
    const banner = await loginBanner.findByPk(id);
    if (!banner)
      return res.status(404).json({ message: "Banner tidak ditemukan." });

    if (banner.images) {
      const imagePath = path.join(__dirname, "..", banner.images.substring(1));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    const deletedData = banner.toJSON();
    await banner.destroy();

    await createActivityLog(
      req,
      req.user,
      "DELETE",
      { type: "LoginBanner", id: id },
      { deletedData }
    );
    res.status(200).json({ message: "Banner berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting login banner:", error);
    await createActivityLog(
      req,
      req.user,
      "DELETE",
      { type: "LoginBanner", id: id },
      { error: error.message },
      "FAILED"
    );
    res.status(500).json({ message: "Internal server error." });
  }
};
