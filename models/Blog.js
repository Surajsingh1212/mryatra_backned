const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    image: { type: String }, 
    date: { type: Date, default: Date.now },
    title: { type: String, required: true },
    metaKeyword: { type: String },
    metaDescription: { type: String },
    blogDescription: { type: String },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
