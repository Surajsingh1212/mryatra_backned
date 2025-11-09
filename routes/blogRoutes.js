const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware"); 
const blogController = require("../controllers/blogController");

// Create blog (with image upload)
router.post("/", upload.single("image"), blogController.createBlog);

// Get all blogs
router.get("/", blogController.getBlogs);

// Get single blog
router.get("/:id", blogController.getBlogById);

// Update blog (with image upload)
router.put("/:id", upload.single("image"), blogController.updateBlog);

// Delete blog
router.delete("/:id", blogController.deleteBlog);

module.exports = router;
