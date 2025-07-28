const { Product } = require("../models"); // Asumsi Anda memiliki model 'Product' dari Sequelize
const { Op } = require("sequelize");
const { searchProducts } = require("./tiktokShop");

const { TIKPED_WAREHOUSE_ID } = process.env;

if (!TIKPED_WAREHOUSE_ID) {
  throw new Error("TIKPED_WAREHOUSE_ID is not defined in your .env file.");
}

/**
 * Mengambil semua produk dari TikTok Shop, menangani paginasi.
 * @returns {Promise<Array>} Array dari semua produk di TikTok Shop.
 */
async function fetchAllTiktokProducts() {
  let allProducts = [];
  let nextPageToken = "";
  let hasMore = true;
  let page = 1;

  console.log("[Stock Sync] Mengambil semua produk dari TikTok Shop...");

  while (hasMore) {
    try {
      console.log(`[Stock Sync] Mengambil halaman ${page}...`);
      const response = await searchProducts({
        page_size: 100,
        page_token: nextPageToken,
      });

      if (response?.data?.products) {
        allProducts = allProducts.concat(response.data.products);
      }

      if (response?.data?.next_page_token) {
        nextPageToken = response.data.next_page_token;
        page++;
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(
        `[Stock Sync] ❌ Gagal mengambil produk dari TikTok pada halaman ${page}:`,
        error
      );
      hasMore = false; // Hentikan jika terjadi error
    }
  }

  console.log(
    `[Stock Sync] ✅ Total ${allProducts.length} produk berhasil diambil dari TikTok Shop.`
  );
  return allProducts;
}

/**
 * Mengambil stok produk dari TikTok Shop dan membandingkannya dengan database lokal.
 * Mencatat setiap perbedaan yang ditemukan ke dalam log.
 */
const syncAndCompareStock = async () => {
  console.log(
    "[Stock Sync] Memulai proses sinkronisasi dan perbandingan stok..."
  );
  try {
    // 1. Ambil semua produk dari TikTok dan buat map berdasarkan SKU
    const tiktokProducts = await fetchAllTiktokProducts();
    const tiktokSkuMap = new Map();
    for (const product of tiktokProducts) {
      if (product.skus) {
        for (const sku of product.skus) {
          if (sku.id) {
            tiktokSkuMap.set(sku.id, sku);
          }
        }
      }
    }

    if (tiktokSkuMap.size === 0) {
      console.log("[Stock Sync] Tidak ada SKU yang ditemukan di TikTok Shop.");
      return;
    }

    // 2. Ambil semua produk dari database lokal yang terhubung dengan TikTok
    const localProducts = await Product.findAll({
      where: {
        product_tiktok_id: {
          [Op.ne]: null,
        },
      },
      attributes: ["product_id", "product_stock", "product_tiktok_sku_id"],
    });

    if (!localProducts || localProducts.length === 0) {
      console.log(
        "[Stock Sync] Tidak ada produk lokal yang terhubung dengan TikTok untuk disinkronkan."
      );
      return;
    }

    console.log(
      `[Stock Sync] Ditemukan ${localProducts.length} produk lokal untuk diperiksa.`
    );

    // 3. Iterasi setiap produk lokal dan bandingkan stoknya menggunakan map
    for (const localProduct of localProducts) {
      const tiktokSku = tiktokSkuMap.get(localProduct.product_tiktok_sku_id);

      if (tiktokSku && tiktokSku.inventory) {
        // Ambil stok dari gudang yang sesuai
        const tiktokInventory = tiktokSku.inventory.find(
          (inv) => inv.warehouse_id === TIKPED_WAREHOUSE_ID
        );
        const tiktokStock = tiktokInventory?.quantity ?? 0;
        const localStock = localProduct.product_stock;

        console.log(
          `[Stock Sync] Memeriksa SKU: ${localProduct.product_tiktok_sku_id} | Stok Lokal: ${localStock}, Stok TikTok: ${tiktokStock}`
        );

        if (localStock !== tiktokStock) {
          console.log(
            `[Stock Sync] ❗ DITEMUKAN PERBEDAAN untuk SKU: ${localProduct.product_tiktok_sku_id} (ID Lokal: ${localProduct.product_id})`
          );
          console.log(
            `  -> Stok di DB Lokal: ${localStock}, Stok di TikTok Shop: ${tiktokStock}`
          );
          // Mengupdate stok lokal agar sesuai dengan stok di TikTok Shop
          try {
            await Product.update(
              { product_stock: tiktokStock },
              { where: { product_id: localProduct.product_id } }
            );
            console.log(
              `  -> ✅ Stok lokal untuk SKU ${localProduct.product_tiktok_sku_id} berhasil diupdate menjadi ${tiktokStock}.`
            );
          } catch (updateError) {
            console.error(
              `  -> ❌ Gagal mengupdate stok lokal untuk SKU ${localProduct.product_tiktok_sku_id}:`,
              updateError
            );
          }
        }
      } else {
        console.warn(
          `[Stock Sync] PERINGATAN: SKU '${localProduct.product_tiktok_sku_id}' (ID Lokal: ${localProduct.product_id}) tidak ditemukan di data TikTok Shop.`
        );
      }
    }

    console.log("[Stock Sync] Proses sinkronisasi stok selesai.");
  } catch (error) {
    console.error(
      "[Stock Sync] ❌ Terjadi kesalahan tak terduga selama proses sinkronisasi stok:",
      error.message || error
    );
  }
};

// syncAndCompareStock();

module.exports = { syncAndCompareStock };
