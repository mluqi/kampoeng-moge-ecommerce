require("dotenv").config();
const fs = require("fs");
const path = require("path");
const {
  createProduct,
  updateProduct,
  uploadImage,
  getCategories,
  getCategoryAttributes,
  refreshToken
} = require("./services/tiktokShop");

// 1. Definisikan semua path gambar dalam sebuah array
const IMAGE_PATHS = [
  path.join(__dirname, "/uploads/products/pictures-1751012864049.jpg"),
  path.join(__dirname, "/uploads/products/pictures-1751012864052.jpg"),
  path.join(__dirname, "/uploads/products/pictures-1751012864053.jpg"),
];

const main = async () => {
  try {
    // 2. Upload semua gambar secara bersamaan menggunakan Promise.all
    console.log(`🚀 Mengunggah ${IMAGE_PATHS.length} gambar...`);
    const uploadPromises = IMAGE_PATHS.map((imagePath) => {
      if (!fs.existsSync(imagePath)) {
        throw new Error(`File tidak ditemukan: ${imagePath}`);
      }
      const imageBuffer = fs.readFileSync(imagePath);
      return uploadImage(imageBuffer, "MAIN_IMAGE");
    });

    const uploadResults = await Promise.all(uploadPromises);

    // 3. Kumpulkan semua URI dari hasil upload yang sukses
    const imageUris = uploadResults.map((res) => {
      if (!res?.data?.uri) {
        console.error("❌ Gagal upload salah satu gambar:", res);
        throw new Error("Gagal mengupload satu atau lebih gambar.");
      }
      console.log("🖼️  Gambar berhasil diupload, URI:", res.data.uri);
      return res.data.uri;
    });

    if (imageUris.length === 0) {
      throw new Error("Tidak ada gambar yang berhasil diupload.");
    }

    // Data produk dari database Anda
    const productName =
      "MUSTANG Double Diamond Squareback Seat with Smooth Passenger *New Style Fairing Models 2023-2024 HD Touring";
    const productDescription = `<p>MUSTANG Double Diamond Squareback Seat with Smooth Passenger *New Style Fairing Models 2023-2024 HD Touring</p>
        <p>One Piece 2-Up</p>
        <p><strong>Features:</strong></p>
        <ul>
        <li>Double diamond stitch pattern with colored thread options offer a new take on a classic favorite</li>
        <li>Crafted for rider comfort, the seat features a specially designed recessed cross section that alleviates tailbone pressure, offering both comfort and style in one sleek package</li>
        <li>Wide driver bucket seat positions the rider slightly back for optimal comfort while providing exceptional lower back support with its high-rising wall</li>
        <li>Wide squared-off tail section provides a stable foundation for passengers or luggage, ensuring a smooth and enjoyable ride for the 2-up rider</li>
        <li>Carefully curated tail section allows for comfortable 2-up riding</li>
        <li>Mustang's proprietary controlled-density foam formula requires no break-in and retains shape and support after years of use</li>
        <li>Marine-grade fiberglass baseplate for long lasting support and durability, with polyurethane bumpers to absorb vibration</li>
        </ul>
        <p><strong>Fitment For:</strong></p>
        <ul>
        <li>2023-2024 CVO Road Glide Custom FLTRXSE</li>
        <li>2024 CVO Road Glide ST FLTRXSTSE</li>
        <li>2023-2024 CVO Street Glide FLHXSE</li>
        <li>2024 Road Glide Custom FLTRX</li>
        <li>2024 Street Glide EFI FLHX</li>
        </ul>
        <p><strong>Note:</strong> Sebelum membeli harap konfirmasikan terlebih dahulu melalui chat.</p>
        <p>Follow juga instagram kita di:</p>
        <ul>
        <li>@Kampoengmoge</li>
        <li>@Kamo_parts</li>
        </ul>`;

    // Sesuaikan payload produk dengan struktur dari curl menggunakan data dari database
    const productPayload = {
      save_mode: "LISTING",
      title: productName,
      description: productDescription,
      category_id: "946184",
      // 4. Masukkan semua URI ke dalam array main_images
      main_images: imageUris.map((uri) => ({ uri: uri })),
      product_attributes: [
        {
          id: "100107", // ID untuk 'Jenis Garansi'
          values: [
            {
              id: "1000057",
              name: "Tanpa Garansi",
            },
          ],
        },
      ],
      external_urls: [""],
      is_cod_allowed: false,
      package_dimensions: {
        length: "10",
        width: "20",
        height: "20",
        unit: "CENTIMETER",
      },
      package_weight: {
        value: "10.0",
        unit: "KILOGRAM",
      },
      skus: [
        {
          price: {
            amount: "13500000",
            currency: "IDR",
          },
          // `sales_attributes` bisa dikosongkan jika produk tidak memiliki varian
          inventory: [
            {
              warehouse_id: process.env.TIKPED_WAREHOUSE_ID,
              quantity: 10,
            },
          ],
          seller_sku: "0801-1907",
        },
      ],
      external_product_id: "",
      minimum_order_quantity: 1,
    };
    // Buat produk
    const createRes = await createProduct(productPayload);
    console.log("✅ Produk berhasil dibuat:", createRes?.data || createRes);
  } catch (error) {
    console.error("❌ Terjadi kesalahan:", error.message || error);
  }
};

// main();

const testGetLeafCategories = async () => {
  try {
    console.log("🔍 Mencari kategori leaf dengan keyword 'Motor'...");
    const categoriesRes = await getCategories({
      keyword: "Sepeda Motor",
      //   listing_platform: "TIKTOK_SHOP",
    });
    console.log("✅ Kategori yang bisa dipilih (is_leaf: true):");
    console.log(JSON.stringify(categoriesRes.data, null, 2));
  } catch (error) {
    console.error("❌ Gagal mengambil kategori:", error);
  }
};

// testGetLeafCategories();

const testGetAttributes = async () => {
  try {
    const categoryId = "946440"; // Ganti dengan ID kategori yang ingin Anda cek
    console.log(`🔍 Mengambil atribut untuk kategori ID: ${categoryId}...`);
    const attributesRes = await getCategoryAttributes(categoryId);
    console.log("✅ Atribut yang tersedia:");
    console.log(JSON.stringify(attributesRes.data, null, 2));
  } catch (error) {
    console.error("❌ Gagal mengambil atribut:", error);
  }
};

// testGetAttributes();

const testUpdateProduct = async () => {
  try {
    // Ganti dengan ID produk yang valid dan ingin Anda update
    const productIdToUpdate = "1732024344869962961";
    console.log(`🚀 Mengupdate produk dengan ID: ${productIdToUpdate}...`);

    // Anda bisa mengupload gambar baru atau menggunakan URI yang sudah ada
    // Untuk contoh ini, kita asumsikan menggunakan URI yang sudah ada dari produk sebelumnya
    const existingImageUri =
      "tos-useast5-i-omjb5zjo8w-tx/feba0a07377544d985144b62b026a947";

    const productUpdatePayload = {
      title:
        "UPDATED: MUSTANG Double Diamond Squareback Seat 2023-2024 HD Touring",
      description:
        "<p>This product description has been updated via the API.</p>",
      category_id: "946184", // Pastikan ID kategori ini valid
      main_images: [
        {
          uri: existingImageUri,
        },
      ],
      package_dimensions: {
        length: "10",
        width: "20",
        height: "20",
        unit: "CENTIMETER",
      },
      package_weight: {
        value: "10.0",
        unit: "KILOGRAM",
      },
      skus: [
        {
          price: {
            amount: "14000000", // Harga baru
            currency: "IDR",
          },
          inventory: [
            {
              warehouse_id: process.env.TIKPED_WAREHOUSE_ID,
              quantity: 5, // Stok baru
            },
          ],
          seller_sku: "0801-1907", // Seller SKU harus cocok dengan yang ada
        },
      ],
    };

    const updateRes = await updateProduct(
      productIdToUpdate,
      productUpdatePayload
    );
    console.log("✅ Produk berhasil diupdate:", updateRes?.data || updateRes);
  } catch (error) {
    console.error("❌ Gagal mengupdate produk:", error);
  }
};

// testUpdateProduct();
refreshToken();
