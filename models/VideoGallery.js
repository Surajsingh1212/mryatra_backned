const mongoose = require("mongoose");

const videoGallerySchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  videoFile: { 
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
videoGallerySchema.virtual('formattedUploadDate').get(function() {
  return this.uploadDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

module.exports = mongoose.model("VideoGallery", videoGallerySchema);
