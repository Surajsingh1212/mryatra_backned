const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const categoryController = require("../controllers/tourCategoryController");

// Routes
router.post("/", upload.single("image"), categoryController.addCategory);
router.get("/", categoryController.getCategories);
router.get("/search", categoryController.searchCategories);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", upload.single("image"), categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;