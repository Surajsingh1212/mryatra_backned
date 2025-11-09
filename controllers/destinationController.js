const Destination = require("../models/Destination");

// Add Destination
exports.addDestination = async (req, res) => {
  try {
    const { name, description, status} = req.body;
    const image = req.file ? req.file.filename : null;
  
    if (!image) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const destination = new Destination({
      name,
      description,
      image,
      status
    });
    await destination.save();

    res.status(201).json({ success: true, message: "Destination added successfully", data: destination });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding destination", error: error.message });
  }
};

// Get All Destinations
exports.getDestinations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const destinations = await Destination.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Destination.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: destinations,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalDestinations: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching destinations", error: error.message });
  }
};
// Get Single Destination
exports.getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }
    res.status(200).json({ success: true, data: destination });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching destination", error: error.message });
  }
};

// Update Destination
exports.updateDestination = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const updateData = { name, description, status };

    if (req.file) updateData.image = req.file.filename;

    const destination = await Destination.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }

    res.status(200).json({ success: true, message: "Destination updated", data: destination });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating destination", error: error.message });
  }
};

// Delete Destination
exports.deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }
    res.status(200).json({ success: true, message: "Destination deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting destination", error: error.message });
  }
};
