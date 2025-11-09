const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto"); // For generating random names

// Fixed upload folder (no user-based subfolders)
const uploadFolder = path.join(__dirname, "..", "uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder); // All files go into 'uploads' directly
  },
  filename: function (req, file, cb) {
    // Generate a completely random filename (without user name)
    const randomName = crypto.randomBytes(16).toString("hex"); // 32-character random string
    const fileExt = path.extname(file.originalname); // .jpg, .png, etc.
    const finalName = randomName + fileExt;
    cb(null, finalName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit (optional)
  },
  fileFilter: (req, file, cb) => {
    // Allow only images (optional)
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

module.exports = upload;