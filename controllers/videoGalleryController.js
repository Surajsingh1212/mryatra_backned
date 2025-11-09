const VideoGallery = require("../models/VideoGallery");
const fs = require("fs");
const path = require("path");

// Add Video
exports.addVideo = async (req, res) => {
  try {
    const { title, status } = req.body;
    const videoFile = req.file ? req.file.filename : null;
  
    if (!videoFile) {
      return res.status(400).json({ success: false, message: "Video is required" });
    }

    const video = new VideoGallery({
      title,
      videoFile,
      status: status || "Active"
    });
    
    await video.save();

    res.status(201).json({ 
      success: true, 
      message: "Video uploaded successfully", 
      data: video 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error uploading video", 
      error: error.message 
    });
  }
};

// Get All Videos
exports.getVideos = async (req, res) => {
  try {
    const videos = await VideoGallery.find().sort({ uploadDate: -1 });
    res.status(200).json({ 
      success: true, 
      data: videos,
      total: videos.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching videos", 
      error: error.message 
    });
  }
};

// Get Single Video
exports.getVideoById = async (req, res) => {
  try {
    const video = await VideoGallery.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ 
        success: false, 
        message: "Video not found" 
      });
    }
    res.status(200).json({ 
      success: true, 
      data: video 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching video", 
      error: error.message 
    });
  }
};

// Update Video
exports.updateVideo = async (req, res) => {
  try {
    const { title, status } = req.body;
    const updateData = { title, status };

    if (req.file) {
      // Delete old video file if exists
      const oldVideo = await VideoGallery.findById(req.params.id);
      if (oldVideo && oldVideo.videoFile) {
        const oldVideoPath = path.join(__dirname, '../uploads/', oldVideo.videoFile);
        if (fs.existsSync(oldVideoPath)) {
          fs.unlinkSync(oldVideoPath);
        }
      }
      updateData.videoFile = req.file.filename;
    }

    const video = await VideoGallery.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ 
        success: false, 
        message: "Video not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Video updated successfully", 
      data: video 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error updating video", 
      error: error.message 
    });
  }
};

// Delete Video
exports.deleteVideo = async (req, res) => {
  try {
    const video = await VideoGallery.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ 
        success: false, 
        message: "Video not found" 
      });
    }
    
    // Delete the video file
    if (video.videoFile) {
      const videoPath = path.join(__dirname, '../uploads/', video.videoFile);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }
    
    await VideoGallery.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ 
      success: true, 
      message: "Video deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error deleting video", 
      error: error.message 
    });
  }
};

// Toggle Video Status
exports.toggleStatus = async (req, res) => {
  try {
    const video = await VideoGallery.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ 
        success: false, 
        message: "Video not found" 
      });
    }
    
    video.status = video.status === "Active" ? "Inactive" : "Active";
    await video.save();
    
    res.status(200).json({ 
      success: true, 
      message: `Video status updated to ${video.status}`,
      data: video 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error toggling status", 
      error: error.message 
    });
  }
};
