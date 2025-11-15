const TourCategory = require("../models/TourCategory");
const TourSubCategory = require("../models/TourSubCategory");

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

// Get All Categories with Search and Sub-Categories
exports.getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ]
      };
    }

    const categories = await TourCategory.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get sub-categories for each category
    const categoriesWithSubs = await Promise.all(
      categories.map(async (category) => {
        const subCategories = await TourSubCategory.find({ 
          categoryId: category._id,
          status: "active"
        });
        
        return {
          ...category.toObject(),
          subCategories: subCategories
        };
      })
    );

    const total = await TourCategory.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: categoriesWithSubs,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCategories: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching categories", error: error.message });
  }
};

// Get Single Category with Sub-Categories
exports.getCategoryById = async (req, res) => {
  try {
    const category = await TourCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Fetch sub-categories for this category
    const subCategories = await TourSubCategory.find({ 
      categoryId: req.params.id,
      status: "active"
    });

    // Combine category with sub-categories
    const categoryWithSubs = {
      ...category.toObject(),
      subCategories: subCategories
    };

    res.status(200).json({ 
      success: true, 
      data: categoryWithSubs 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching category", error: error.message });
  }
};

// Search Categories with Sub-Categories
exports.searchCategories = async (req, res) => {
  try {
    const search = req.query.search || "";
    
    if (!search) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    // Search in categories
    const categories = await TourCategory.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ],
      status: "active"
    });

    // Search in sub-categories
    const subCategories = await TourSubCategory.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ],
      status: "active"
    }).populate("categoryId", "name image");

    res.status(200).json({
      success: true,
      data: {
        categories: categories,
        subCategories: subCategories
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error searching categories", error: error.message });
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
    
    // Also delete all sub-categories associated with this category
    await TourSubCategory.deleteMany({ categoryId: req.params.id });
    
    res.status(200).json({ success: true, message: "Category and associated sub-categories deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting category", error: error.message });
  }
};