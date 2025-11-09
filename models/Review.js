const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  review: { type: String, required: true },
  rating: { type: Number, required: true },
  touristName: { type: String, required: true },
  touristDesignation: { type: String, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  profileImage: { type: String }, 
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);
