const express = require("express");
const router = express.Router();
const uploadVideo = require("../middleware/videoUploadMiddleware");
const videoGalleryController = require("../controllers/videoGalleryController");

// Routes
router.post("/", uploadVideo.single("video"), videoGalleryController.addVideo);
router.get("/", videoGalleryController.getVideos);
router.get("/:id", videoGalleryController.getVideoById);
router.put("/:id", uploadVideo.single("video"), videoGalleryController.updateVideo);
router.delete("/:id", videoGalleryController.deleteVideo);
router.patch("/:id/toggle-status", videoGalleryController.toggleStatus);

module.exports = router;
