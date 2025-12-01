const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");

async function compressImage(inputPath, quality = 80) {
  const ext = path.extname(inputPath).toLowerCase();
  const tempPath = `${inputPath}.tmp`;

  try {
    let pipeline = sharp(inputPath);

    // Resize gambar jika lebih besar dari 1200px
    pipeline = pipeline.resize(1200, 1200, {
      fit: "inside",
      withoutEnlargement: true,
    });

    if (ext === ".jpg" || ext === ".jpeg") {
      pipeline = pipeline.jpeg({ quality });
    } else if (ext === ".png") {
      pipeline = pipeline.png({
        compressionLevel: 9,
        adaptiveFiltering: true,
        quality,
      });
    } else if (ext === ".webp") {
      pipeline = pipeline.webp({ quality });
    }

    await pipeline.toFile(tempPath);
    await fs.unlink(inputPath);
    await fs.rename(tempPath, inputPath);

    return true;
  } catch (err) {
    console.error(`Failed to compress image: ${inputPath}`, err);
    if (
      await fs
        .access(tempPath)
        .then(() => true)
        .catch(() => false)
    ) {
      await fs.unlink(tempPath);
    }
    return false;
  }
}

module.exports = { compressImage };
