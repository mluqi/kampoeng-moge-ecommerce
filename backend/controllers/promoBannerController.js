const { promo_banners: PromoBanner } = require("../models");
const fs = require('fs');
const path = require('path');

// Public: Get the first active promo banner
exports.getActiveBanner = async (req, res) => {
  try {
    const banner = await PromoBanner.findOne({
      where: { is_active: true },
    });
    // Tidak apa-apa jika banner tidak ditemukan, frontend akan menanganinya.
    res.status(200).json(banner);
  } catch (error) {
    console.error("Error fetching active promo banner:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// --- Admin Functions ---

// Admin: Get all promo banners
exports.getAllBanners = async (req, res) => {
    try {
        const banners = await PromoBanner.findAll({ order: [['createdAt', 'DESC']] });
        res.status(200).json(banners);
    } catch (error) {
        console.error('Error fetching all banners:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Admin: Create a new promo banner
exports.createBanner = async (req, res) => {
    try {
        const { title, description, button_text, button_link, is_active } = req.body;
        if (!title) return res.status(400).json({ message: 'Judul wajib diisi.' });

        const newBanner = await PromoBanner.create({
            title, description, button_text, button_link,
            image_left_url: req.files?.image_left?.[0] ? `/uploads/banners/${req.files.image_left[0].filename}` : null,
            image_right_url: req.files?.image_right?.[0] ? `/uploads/banners/${req.files.image_right[0].filename}` : null,
            image_mobile_url: req.files?.image_mobile?.[0] ? `/uploads/banners/${req.files.image_mobile[0].filename}` : null,
            is_active: is_active === 'true' || is_active === true,
        });

        res.status(201).json({ message: 'Banner berhasil ditambahkan.', banner: newBanner });
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Admin: Update a promo banner
exports.updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, button_text, button_link, is_active } = req.body;

        const banner = await PromoBanner.findByPk(id);
        if (!banner) return res.status(404).json({ message: 'Banner tidak ditemukan.' });

        const updateData = { title, description, button_text, button_link, is_active: is_active === 'true' || is_active === true };

        // Helper function to update image and delete old one
        const updateImage = (fieldName) => {
            if (req.files?.[fieldName]?.[0]) {
                const newImageUrl = `/uploads/banners/${req.files[fieldName][0].filename}`;
                // Delete old image if it exists
                if (banner[fieldName+'_url']) {
                    // Hapus / dari awal path untuk membuat path file sistem yang benar
                    const oldImagePath = path.join(__dirname, '..', banner[fieldName+'_url'].substring(1));
                    if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
                }
                updateData[fieldName+'_url'] = newImageUrl;
            }
        };

        updateImage('image_left');
        updateImage('image_right');
        updateImage('image_mobile');

        await banner.update(updateData);

        res.status(200).json({ message: 'Banner berhasil diperbarui.', banner });
    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Admin: Delete a promo banner
exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await PromoBanner.findByPk(id);
        if (!banner) return res.status(404).json({ message: 'Banner tidak ditemukan.' });

        // Delete all associated images
        ['image_left_url', 'image_right_url', 'image_mobile_url'].forEach(field => {
            if (banner[field]) {
                const imagePath = path.join(__dirname, '..', banner[field]);
                if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            }
        });

        await banner.destroy();
        res.status(200).json({ message: 'Banner berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
