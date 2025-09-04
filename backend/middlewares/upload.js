const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads/chat");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// [BARU] Konfigurasi untuk gambar chat
const chatStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Buat folder 'chat' di dalam 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, `chat_${Date.now()}${path.extname(file.originalname)}`);
  },
});


const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  if (
    allowedTypes.test(ext.replace(".", "")) &&
    (mime === "image/jpeg" || mime === "image/png" || mime === "image/jpg")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, .png files are allowed!"));
  }
};


exports.uploadChatImage = multer({ storage: chatStorage, fileFilter });
