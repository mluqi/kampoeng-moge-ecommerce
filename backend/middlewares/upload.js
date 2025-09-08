const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads/chat");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// [BARU] Map mimetypes ke ekstensi file untuk validasi dan penamaan yang andal.
const mimeToExt = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/jpg": ".jpg",
};

// [BARU] Konfigurasi untuk gambar chat
const chatStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Buat folder 'chat' di dalam 'uploads'
  },
  filename: (req, file, cb) => {
    // [DIUBAH] Gunakan mimetype untuk menentukan ekstensi file yang andal.
    const ext = mimeToExt[file.mimetype] || path.extname(file.originalname);
    cb(null, `chat_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // [DIUBAH] Validasi hanya berdasarkan mimetype untuk keandalan.
  if (mimeToExt[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, .png files are allowed!"), false);
  }
};

exports.uploadChatImage = multer({ storage: chatStorage, fileFilter });
