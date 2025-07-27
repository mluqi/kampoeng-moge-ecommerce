const { featured_products: FeaturedProduct } = require('../models');
const fs = require('fs');
const path = require('path');

// Public: Get all active featured products
exports.getActiveFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await FeaturedProduct.findAll({
      where: { is_active: true },
      order: [['display_order', 'ASC']],
    });
    res.status(200).json(featuredProducts);
  } catch (error) {
    console.error('Error fetching active featured products:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// --- Admin Functions ---

// Admin: Get all featured products (active and inactive)
exports.getAllFeaturedProducts = async (req, res) => {
    try {
        const featuredProducts = await FeaturedProduct.findAll({
            order: [['display_order', 'ASC']],
        });
        res.status(200).json(featuredProducts);
    } catch (error) {
        console.error('Error fetching all featured products:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Admin: Create a new featured product
exports.createFeaturedProduct = async (req, res) => {
    try {
        const { title, description, button_text, button_link, display_order, is_active } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Judul dan deskripsi wajib diisi.' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Gambar wajib diunggah.' });
        }

        const image_url = `/uploads/featured/${req.file.filename}`;

        const newFeaturedProduct = await FeaturedProduct.create({
            title,
            description,
            image_url,
            button_text,
            button_link,
            display_order: parseInt(display_order, 10) || 0,
            is_active: is_active === 'true' || is_active === true,
        });

        res.status(201).json({ message: 'Produk unggulan berhasil ditambahkan.', product: newFeaturedProduct });
    } catch (error) {
        console.error('Error creating featured product:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Admin: Update a featured product
exports.updateFeaturedProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, button_text, button_link, display_order, is_active } = req.body;

        const product = await FeaturedProduct.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Produk unggulan tidak ditemukan.' });
        }

        const updateData = {
            title, description, button_text, button_link,
            display_order: parseInt(display_order, 10) || 0,
            is_active: is_active === 'true' || is_active === true,
        };

        if (req.file) {
            // Jika ada file baru, hapus file lama jika ada
            if (product.image_url) {
                // Hapus / dari awal path untuk membuat path file sistem yang benar
                const oldImagePath = path.join(__dirname, '..', product.image_url.substring(1));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            // Atur URL gambar baru
            updateData.image_url = `/uploads/featured/${req.file.filename}`;
        }

        // Jika tidak ada file baru, image_url tidak akan ada di updateData, sehingga tidak akan diubah.
        await product.update(updateData);

        res.status(200).json({ message: 'Produk unggulan berhasil diperbarui.', product });
    } catch (error) {
        console.error('Error updating featured product:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Admin: Delete a featured product
exports.deleteFeaturedProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await FeaturedProduct.findByPk(id);
        if (!product) return res.status(404).json({ message: 'Produk unggulan tidak ditemukan.' });

        if (product.image_url) {
            // Hapus / dari awal path untuk membuat path file sistem yang benar
            const imagePath = path.join(__dirname, '..', product.image_url.substring(1));
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }
        await product.destroy();
        res.status(200).json({ message: 'Produk unggulan berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting featured product:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
