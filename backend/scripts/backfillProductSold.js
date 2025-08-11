const { Order, OrderItem, Product, sequelize } = require("../models");
const { Op } = require("sequelize");

const backfillProductSoldCount = async () => {
  const t = await sequelize.transaction();
  try {
    console.log("Memulai proses backfill untuk jumlah produk terjual...");

    // 1. Reset semua product_sold ke 0 untuk memastikan data bersih
    console.log("Mereset kolom product_sold menjadi 0...");
    await Product.update({ product_sold: 0 }, { where: {}, transaction: t });

    // 2. Ambil semua item dari pesanan yang sudah 'completed'
    console.log("Mengambil semua item dari pesanan yang telah selesai...");
    const completedOrderItems = await OrderItem.findAll({
      attributes: [
        "product_id",
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalSold"],
      ],
      include: [
        {
          model: Order,
          attributes: [],
          where: { status: "completed" },
        },
      ],
      group: ["product_id"],
      raw: true,
      transaction: t,
    });

    if (completedOrderItems.length === 0) {
      console.log(
        "Tidak ada produk terjual dari pesanan yang selesai. Proses selesai."
      );
      await t.commit();
      return;
    }

    console.log(
      `Ditemukan ${completedOrderItems.length} produk unik yang terjual. Memperbarui data...`
    );

    // 3. Update setiap produk dengan jumlah terjualnya
    for (const item of completedOrderItems) {
      await Product.update(
        { product_sold: item.totalSold },
        { where: { product_id: item.product_id }, transaction: t }
      );
      console.log(
        `- Produk ${item.product_id} diperbarui, terjual: ${item.totalSold}`
      );
    }

    await t.commit();
    console.log("✅ Proses backfill berhasil diselesaikan!");
  } catch (error) {
    await t.rollback();
    console.error("❌ Terjadi kesalahan saat proses backfill:", error);
  } finally {
    await sequelize.close();
  }
};

backfillProductSoldCount();
