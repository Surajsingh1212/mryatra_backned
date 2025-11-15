const Destination = require("../models/Destination");
const SubDestination = require("../models/SubDestination");

// Add Destination (updated with new fields)
exports.addDestination = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      status,
      isPeakSeason,
      isTopDestination,
      isPopular,
      isAdventure,
      isBeach,
      isHillStation,
      isHistorical,
      isReligious,
      season,
      budgetRange
    } = req.body;
    
    const image = req.file ? req.file.filename : null;
  
    if (!image) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const destination = new Destination({
      name,
      description,
      image,
      status,
      isPeakSeason: isPeakSeason === 'true',
      isTopDestination: isTopDestination === 'true',
      isPopular: isPopular === 'true',
      isAdventure: isAdventure === 'true',
      isBeach: isBeach === 'true',
      isHillStation: isHillStation === 'true',
      isHistorical: isHistorical === 'true',
      isReligious: isReligious === 'true',
      season,
      budgetRange
    });
    
    await destination.save();

    res.status(201).json({ 
      success: true, 
      message: "Destination added successfully", 
      data: destination 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error adding destination", 
      error: error.message 
    });
  }
};

// Update Destination (updated with new fields)
exports.updateDestination = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      status,
      isPeakSeason,
      isTopDestination,
      isPopular,
      isAdventure,
      isBeach,
      isHillStation,
      isHistorical,
      isReligious,
      season,
      budgetRange
    } = req.body;
    
    const updateData = { 
      name, 
      description, 
      status,
      isPeakSeason: isPeakSeason === 'true',
      isTopDestination: isTopDestination === 'true',
      isPopular: isPopular === 'true',
      isAdventure: isAdventure === 'true',
      isBeach: isBeach === 'true',
      isHillStation: isHillStation === 'true',
      isHistorical: isHistorical === 'true',
      isReligious: isReligious === 'true',
      season,
      budgetRange
    };

    if (req.file) updateData.image = req.file.filename;

    const destination = await Destination.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );

    if (!destination) {
      return res.status(404).json({ 
        success: false, 
        message: "Destination not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Destination updated", 
      data: destination 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error updating destination", 
      error: error.message 
    });
  }
};

// ✅ NEW: Get Peak Season Destinations
exports.getPeakSeasonDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find({ 
      isPeakSeason: true,
      status: "active"
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: destinations,
      count: destinations.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching peak season destinations", 
      error: error.message 
    });
  }
};

// ✅ NEW: Get Top Destinations
exports.getTopDestinations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const destinations = await Destination.find({ 
      isTopDestination: true,
      status: "active"
    })
    .limit(limit)
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: destinations,
      count: destinations.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching top destinations", 
      error: error.message 
    });
  }
};

// ✅ NEW: Get Popular Destinations
exports.getPopularDestinations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const destinations = await Destination.find({ 
      isPopular: true,
      status: "active"
    })
    .limit(limit)
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: destinations,
      count: destinations.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching popular destinations", 
      error: error.message 
    });
  }
};

// ✅ NEW: Get Destinations by Category
exports.getDestinationsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    // Validate category
    const validCategories = [
      'adventure', 'beach', 'hillStation', 'historical', 'religious'
    ];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category"
      });
    }

    const filterField = `is${category.charAt(0).toUpperCase() + category.slice(1)}`;
    
    const destinations = await Destination.find({ 
      [filterField]: true,
      status: "active"
    })
    .limit(limit)
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: destinations,
      category: category,
      count: destinations.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching destinations by category", 
      error: error.message 
    });
  }
};

// ✅ NEW: Get Filtered Destinations (Multiple filters)
exports.getFilteredDestinations = async (req, res) => {
  try {
    const {
      isPeakSeason,
      isTopDestination,
      isPopular,
      category,
      season,
      budgetRange,
      limit = 10
    } = req.query;

    let filter = { status: "active" };

    // Apply filters
    if (isPeakSeason === 'true') filter.isPeakSeason = true;
    if (isTopDestination === 'true') filter.isTopDestination = true;
    if (isPopular === 'true') filter.isPopular = true;
    if (season) filter.season = season;
    if (budgetRange) filter.budgetRange = budgetRange;

    // Category filter
    if (category) {
      const categoryField = `is${category.charAt(0).toUpperCase() + category.slice(1)}`;
      filter[categoryField] = true;
    }

    const destinations = await Destination.find(filter)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: destinations,
      filters: req.query,
      count: destinations.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching filtered destinations", 
      error: error.message 
    });
  }
};
// Get All Destinations with Search and Sub-Destinations
exports.getDestinations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ]
      };
    }

    const destinations = await Destination.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get sub-destinations for each destination
    const destinationsWithSubs = await Promise.all(
      destinations.map(async (destination) => {
        const subDestinations = await SubDestination.find({ 
          destinationId: destination._id,
          status: "active"
        });
        
        return {
          ...destination.toObject(),
          subDestinations: subDestinations
        };
      })
    );

    const total = await Destination.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: destinationsWithSubs,
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

// Get All Active Destinations (for dropdown/select)
exports.getActiveDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find({ status: "active" })
      .select("name _id") // Only name and ID for dropdown
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: destinations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching destinations", error: error.message });
  }
};

// Get Single Destination with Sub-Destinations
exports.getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    
    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }

    // Fetch sub-destinations for this destination
    const subDestinations = await SubDestination.find({ 
      destinationId: req.params.id,
      status: "active"
    });

    // Combine destination with sub-destinations
    const destinationWithSubs = {
      ...destination.toObject(),
      subDestinations: subDestinations
    };

    res.status(200).json({ 
      success: true, 
      data: destinationWithSubs 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching destination", error: error.message });
  }
};

// Search Destinations with Sub-Destinations
exports.searchDestinations = async (req, res) => {
  try {
    const search = req.query.search || "";
    
    if (!search) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    // Search in destinations
    const destinations = await Destination.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ],
      status: "active"
    });

    // Search in sub-destinations
    const subDestinations = await SubDestination.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ],
      status: "active"
    }).populate("destinationId", "name image");

    res.status(200).json({
      success: true,
      data: {
        destinations: destinations,
        subDestinations: subDestinations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error searching destinations", error: error.message });
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
    
    // Also delete all sub-destinations associated with this destination
    await SubDestination.deleteMany({ destinationId: req.params.id });
    
    res.status(200).json({ success: true, message: "Destination and associated sub-destinations deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting destination", error: error.message });
  }
};