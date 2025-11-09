const mongoose = require("mongoose");

const tourCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TourCategory", tourCategorySchema);
