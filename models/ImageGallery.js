const mongoose = require("mongoose");

const imageGallerySchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  imageFile: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["Active", "Inactive"], 
    default: "Active" 
  },
  uploadDate: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Virtual for formatted upload date
imageGallerySchema.virtual('formattedUploadDate').get(function() {
  return this.uploadDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

module.exports = mongoose.model("ImageGallery", imageGallerySchema);