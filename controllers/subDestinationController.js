const SubDestination = require("../models/SubDestination");
const Destination = require("../models/Destination");

// Add SubDestination
exports.addSubDestination = async (req, res) => {
  try {
    const { destinationId, name, description, status } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!destinationId || !image) {
      return res.status(400).json({ success: false, message: "Destination ID and image are required" });
    }

    // Check if destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }

    const subDestination = new SubDestination({ destinationId, name, description, image, status });
    await subDestination.save();

    res.status(201).json({ success: true, message: "Sub Destination added successfully", data: subDestination });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding sub destination", error: error.message });
  }
};

// Get All SubDestinations with Search
exports.getSubDestinations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const destinationId = req.query.destinationId;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by destination if provided
    if (destinationId) {
      searchQuery.destinationId = destinationId;
    }

    const subDestinations = await SubDestination.find(searchQuery)
      .populate("destinationId", "name image description")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await SubDestination.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: subDestinations,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalSubDestinations: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching sub destinations", error: error.message });
  }
};

// Get SubDestinations by Destination ID
exports.getSubDestinationsByDestination = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    let searchQuery = { destinationId: req.params.destinationId };
    
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const subDestinations = await SubDestination.find(searchQuery)
      .populate("destinationId", "name image")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await SubDestination.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: subDestinations,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalSubDestinations: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching sub destinations", error: error.message });
  }
};

// Get Active SubDestinations by Multiple Destination IDs (for multi-select)
exports.getSubDestinationsByMultipleDestinations = async (req, res) => {
  try {
    const { destinationIds } = req.query;
    
    if (!destinationIds) {
      return res.status(400).json({ success: false, message: "Destination IDs are required" });
    }

    // Convert comma-separated string to array
    const destinationIdsArray = Array.isArray(destinationIds) 
      ? destinationIds 
      : destinationIds.split(',');

    const subDestinations = await SubDestination.find({
      destinationId: { $in: destinationIdsArray },
      status: "active"
    })
    .populate("destinationId", "name image")
    .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: subDestinations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching sub destinations", error: error.message });
  }
};

// Get All Active SubDestinations (for dropdown/select)
exports.getActiveSubDestinations = async (req, res) => {
  try {
    const subDestinations = await SubDestination.find({ status: "active" })
      .populate("destinationId", "name")
      .select("name _id destinationId") // Only necessary fields for dropdown
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: subDestinations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching sub destinations", error: error.message });
  }
};

// Search SubDestinations
exports.searchSubDestinations = async (req, res) => {
  try {
    const search = req.query.search || "";
    const destinationId = req.query.destinationId;
    
    if (!search) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    let searchQuery = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ]
    };

    // Filter by destination if provided
    if (destinationId) {
      searchQuery.destinationId = destinationId;
    }

    const subDestinations = await SubDestination.find(searchQuery)
      .populate("destinationId", "name image description")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: subDestinations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error searching sub destinations", error: error.message });
  }
};

// Update SubDestination
exports.updateSubDestination = async (req, res) => {
  try {
    const { name, description, status, destinationId } = req.body;
    const updateData = { name, description, status };
    
    if (destinationId) updateData.destinationId = destinationId;
    if (req.file) updateData.image = req.file.filename;

    const subDestination = await SubDestination.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate("destinationId", "name image");

    if (!subDestination) {
      return res.status(404).json({ success: false, message: "Sub Destination not found" });
    }

    res.status(200).json({ success: true, message: "Sub Destination updated", data: subDestination });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating sub destination", error: error.message });
  }
};

// Delete SubDestination
exports.deleteSubDestination = async (req, res) => {
  try {
    const subDestination = await SubDestination.findByIdAndDelete(req.params.id);
    if (!subDestination) {
      return res.status(404).json({ success: false, message: "Sub Destination not found" });
    }
    res.status(200).json({ success: true, message: "Sub Destination deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting sub destination", error: error.message });
  }
};