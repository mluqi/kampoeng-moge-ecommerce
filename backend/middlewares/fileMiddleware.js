const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads/products");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// [BARU] Map mimetypes ke ekstensi file untuk validasi dan penamaan yang andal.
const mimeToExt = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/jpg": ".jpg",
};

const fileFilter = (req, file, cb) => {
  // [DIUBAH] Validasi berdasarkan mimetype untuk keandalan, karena originalname bisa saja 'blob'.
  if (mimeToExt[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, .png files are allowed!"), false);
  }
};

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // [DIUBAH] Tentukan ekstensi file dari mimetype secara andal.
    const ext = mimeToExt[file.mimetype] || path.extname(file.originalname);
    cb(
      null,
      `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    );
  },
});

const upload = multer({
  storage: diskStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = upload;
