const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadFolder = path.join(__dirname, "..", "uploads", "videos");


if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    const randomName = crypto.randomBytes(16).toString("hex"); 
    const fileExt = path.extname(file.originalname); 
    const finalName = randomName + fileExt;
    cb(null, finalName);
  },
});

const uploadVideo = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    // Allow only video formats
    if (!file.originalname.match(/\.(mp4|avi|mov|mkv|wmv|flv)$/i)) {
      return cb(new Error("Only video files are allowed!"), false);
    }
    cb(null, true);
  },
});

module.exports = uploadVideo;
