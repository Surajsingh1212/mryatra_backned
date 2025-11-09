const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const imageGalleryController = require("../controllers/imageGalleryController");

// Routes
router.post("/", upload.single("image"), imageGalleryController.addImage);
router.get("/", imageGalleryController.getImages);
router.get("/:id", imageGalleryController.getImageById);
router.put("/:id", upload.single("image"), imageGalleryController.updateImage);
router.delete("/:id", imageGalleryController.deleteImage);
router.patch("/:id/toggle-status", imageGalleryController.toggleStatus);

module.exports = router;