const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const subCategoryController = require("../controllers/tourSubCategoryController");

router.post("/", upload.single("image"), subCategoryController.addSubCategory);
router.get("/", subCategoryController.getSubCategories);
router.get("/search", subCategoryController.searchSubCategories);
router.get("/by-category/:categoryId", subCategoryController.getSubCategoriesByCategory);
router.put("/:id", upload.single("image"), subCategoryController.updateSubCategory);
router.delete("/:id", subCategoryController.deleteSubCategory);

module.exports = router;