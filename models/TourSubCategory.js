const mongoose = require("mongoose");

const tourSubCategorySchema = new mongoose.Schema({
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "TourCategory", 
    required: true 
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TourSubCategory", tourSubCategorySchema);