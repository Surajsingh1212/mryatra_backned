const TourCategory = require("../models/TourCategory");

// Add Tour Category
exports.addCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!image) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const category = new TourCategory({ name, description, image, status });
    await category.save();

    res.status(201).json({
      success: true,
      message: "Tour Category added successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding category", error: error.message });
  }
};

// Get All Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await TourCategory.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching categories", error: error.message });
  }
};

// Get Single Category
exports.getCategoryById = async (req, res) => {
  try {
    const category = await TourCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching category", error: error.message });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const updateData = { name, description, status };

    if (req.file) updateData.image = req.file.filename;

    const category = await TourCategory.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, message: "Category updated", data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating category", error: error.message });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await TourCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting category", error: error.message });
  }
};
