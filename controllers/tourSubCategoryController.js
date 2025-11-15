const TourSubCategory = require("../models/TourSubCategory");
const TourCategory = require("../models/TourCategory");

// Add Sub Category
exports.addSubCategory = async (req, res) => {
  try {
    const { categoryId, name, description, status } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!categoryId || !image) {
      return res.status(400).json({ success: false, message: "Category ID and image are required" });
    }

    // Check if category exists
    const category = await TourCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const subCategory = new TourSubCategory({ categoryId, name, description, image, status });
    await subCategory.save();

    res.status(201).json({ 
      success: true, 
      message: "Sub Category added successfully", 
      data: subCategory 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding sub category", error: error.message });
  }
};

// Get All Sub Categories with Search
exports.getSubCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const categoryId = req.query.categoryId;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by category if provided
    if (categoryId) {
      searchQuery.categoryId = categoryId;
    }

    const subCategories = await TourSubCategory.find(searchQuery)
      .populate("categoryId", "name image description")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await TourSubCategory.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: subCategories,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalSubCategories: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching sub categories", error: error.message });
  }
};

// Get Sub Categories by Category ID
exports.getSubCategoriesByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    let searchQuery = { categoryId: req.params.categoryId };
    
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const subCategories = await TourSubCategory.find(searchQuery)
      .populate("categoryId", "name image")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await TourSubCategory.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: subCategories,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalSubCategories: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching sub categories", error: error.message });
  }
};

// Search Sub Categories
exports.searchSubCategories = async (req, res) => {
  try {
    const search = req.query.search || "";
    const categoryId = req.query.categoryId;
    
    if (!search) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    let searchQuery = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ]
    };

    // Filter by category if provided
    if (categoryId) {
      searchQuery.categoryId = categoryId;
    }

    const subCategories = await TourSubCategory.find(searchQuery)
      .populate("categoryId", "name image description")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: subCategories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error searching sub categories", error: error.message });
  }
};

// Update Sub Category
exports.updateSubCategory = async (req, res) => {
  try {
    const { name, description, status, categoryId } = req.body;
    const updateData = { name, description, status };
    
    if (categoryId) updateData.categoryId = categoryId;
    if (req.file) updateData.image = req.file.filename;

    const subCategory = await TourSubCategory.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate("categoryId", "name image");

    if (!subCategory) {
      return res.status(404).json({ success: false, message: "Sub Category not found" });
    }

    res.status(200).json({ success: true, message: "Sub Category updated", data: subCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating sub category", error: error.message });
  }
};

// Delete Sub Category
exports.deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await TourSubCategory.findByIdAndDelete(req.params.id);
    if (!subCategory) {
      return res.status(404).json({ success: false, message: "Sub Category not found" });
    }
    res.status(200).json({ success: true, message: "Sub Category deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting sub category", error: error.message });
  }
};