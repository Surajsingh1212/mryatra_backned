const ImageGallery = require("../models/ImageGallery");
const fs = require("fs");
const path = require("path");

// Add Image to Gallery
exports.addImage = async (req, res) => {
  try {
    const { title, status } = req.body;
    const imageFile = req.file ? req.file.filename : null;
  
    if (!imageFile) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const image = new ImageGallery({
      title,
      imageFile,
      status: status || "Active"
    });
    
    await image.save();

    res.status(201).json({ 
      success: true, 
      message: "Image uploaded successfully", 
      data: image 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error uploading image", 
      error: error.message 
    });
  }
};

// Get All Gallery Images
exports.getImages = async (req, res) => {
  try {
    const images = await ImageGallery.find().sort({ uploadDate: -1 });
    res.status(200).json({ 
      success: true, 
      data: images,
      total: images.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching images", 
      error: error.message 
    });
  }
};

// Get Single Image
exports.getImageById = async (req, res) => {
  try {
    const image = await ImageGallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ 
        success: false, 
        message: "Image not found" 
      });
    }
    res.status(200).json({ 
      success: true, 
      data: image 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching image", 
      error: error.message 
    });
  }
};

// Update Image
exports.updateImage = async (req, res) => {
  try {
    const { title, status } = req.body;
    const updateData = { title, status };

    if (req.file) {
      // Delete old image file if exists
      const oldImage = await ImageGallery.findById(req.params.id);
      if (oldImage && oldImage.imageFile) {
        const oldImagePath = path.join(__dirname, '../uploads/', oldImage.imageFile);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.imageFile = req.file.filename;
    }

    const image = await ImageGallery.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );

    if (!image) {
      return res.status(404).json({ 
        success: false, 
        message: "Image not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Image updated successfully", 
      data: image 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error updating image", 
      error: error.message 
    });
  }
};

// Delete Image
exports.deleteImage = async (req, res) => {
  try {
    const image = await ImageGallery.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ 
        success: false, 
        message: "Image not found" 
      });
    }
    
    // Delete the image file
    if (image.imageFile) {
      const imagePath = path.join(__dirname, '../uploads/', image.imageFile);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await ImageGallery.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ 
      success: true, 
      message: "Image deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error deleting image", 
      error: error.message 
    });
  }
};

// Toggle Image Status
exports.toggleStatus = async (req, res) => {
  try {
    const image = await ImageGallery.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ 
        success: false, 
        message: "Image not found" 
      });
    }
    
    image.status = image.status === "Active" ? "Inactive" : "Active";
    await image.save();
    
    res.status(200).json({ 
      success: true, 
      message: `Image status updated to ${image.status}`,
      data: image 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error toggling status", 
      error: error.message 
    });
  }
};