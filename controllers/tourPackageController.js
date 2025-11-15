const TourPackage = require("../models/TourPackage");

exports.createTourPackage = async (req, res) => {
  try {
    const data = req.body;
    console.log("Incoming body:", data);
    console.log("Incoming files:", req.files);

    // Handle main image
    if (req.files?.mainImage && req.files.mainImage[0]) {
      data.mainImage = req.files.mainImage[0].filename;
    }

    // Handle gallery images
    if (req.files?.galleryImages && req.files.galleryImages.length > 0) {
      data.galleryImages = req.files.galleryImages.map(file => file.filename);
    }

    // Safe JSON parsing
    const safeParse = (field) => {
      if (data[field] && typeof data[field] === "string") {
        try {
          return JSON.parse(data[field]);
        } catch (err) {
          throw new Error(`Invalid JSON in ${field}`);
        }
      }
      return data[field];
    };

    // ✅ UPDATED: Parse new array fields for categories, sub-categories, destinations and sub-destinations
    data.inclusions = safeParse("inclusions") || [];
    data.exclusions = safeParse("exclusions") || [];
    data.transportModes = safeParse("transportModes") || [];
    data.hotels = safeParse("hotels") || [];
    data.itinerary = safeParse("itinerary") || [];
    
    // ✅ UPDATED: Parse packageCategories and packageSubCategories as arrays
    if (data.packageCategories) {
      data.packageCategories = safeParse("packageCategories");
    }
    
    if (data.packageSubCategories) {
      data.packageSubCategories = safeParse("packageSubCategories");
    }
    
    // ✅ UPDATED: Parse mainDestinations and subDestinations as arrays
    if (data.mainDestinations) {
      data.mainDestinations = safeParse("mainDestinations");
    }
    
    if (data.subDestinations) {
      data.subDestinations = safeParse("subDestinations");
    }
    
    if (data.packagePricing) {
      data.packagePricing = safeParse("packagePricing");
    }

    // ✅ UPDATED: Validation for required fields including categories and destinations
    if (!data.packageName || !data.duration || !data.nights) {
      return res.status(400).json({
        success: false,
        message: "Package name, duration, and nights are required"
      });
    }

    // ✅ UPDATED: Validate at least one category is selected
    if (!data.packageCategories || data.packageCategories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one package category is required"
      });
    }

    // ✅ UPDATED: Validate at least one destination is selected
    if (!data.mainDestinations || data.mainDestinations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one destination is required"
      });
    }

    // ✅ FIXED: Hotel Images Handling
    if (req.files?.hotelImages && req.files.hotelImages.length > 0) {
      console.log("Processing hotel images...");
      
      const hotelImages = req.files.hotelImages;
      const hotelTypes = req.body.hotelTypes;
      
      console.log("Hotel images count:", hotelImages.length);
      console.log("Hotel types received:", hotelTypes);
      
      // Convert hotelTypes to array if it's a string
      const hotelTypesArray = Array.isArray(hotelTypes) 
        ? hotelTypes 
        : (hotelTypes ? [hotelTypes] : []);
      
      // Group images by hotel type
      const hotelImagesByType = {};
      
      // Initialize empty arrays for each selected hotel
      data.hotels.forEach(hotel => {
        if (hotel.selected) {
          hotelImagesByType[hotel.type] = [];
        }
      });
      
      // Distribute images to their respective hotel types
      hotelImages.forEach((file, index) => {
        const type = hotelTypesArray[index];
        if (type && hotelImagesByType[type]) {
          hotelImagesByType[type].push(file.filename);
        } else {
          console.log("Unknown or unselected hotel type for image:", type);
        }
      });
      
      console.log("Hotel images grouped by type:", hotelImagesByType);
      
      // Assign images to the correct hotels
      data.hotels.forEach(hotel => {
        if (hotel.selected && hotelImagesByType[hotel.type]) {
          hotel.images = hotelImagesByType[hotel.type];
        }
      });
      
      console.log("Final hotels data with images:", data.hotels);
    }

    // ✅ FIXED: Itinerary Images Handling
    if (req.files?.itineraryImages && req.files.itineraryImages.length > 0) {
      console.log("Processing itinerary images...");
      
      const itineraryImages = req.files.itineraryImages;
      
      // Create a copy of itinerary images array for processing
      const itinImages = [...itineraryImages];
      
      // Assign images to itinerary days sequentially
      data.itinerary.forEach((day, index) => {
        if (itinImages.length > 0) {
          // Take the first available image for this day
          day.image = itinImages.shift().filename;
        }
      });
      
      console.log("Processed itinerary with images:", data.itinerary);
    }

    const newPackage = new TourPackage(data);
    await newPackage.save();

    // ✅ UPDATED: Populate multiple categories, sub-categories, destinations and sub-destinations
    const populatedPackage = await TourPackage.findById(newPackage._id)
      .populate("packageCategories", "name image")
      .populate("packageSubCategories", "name image")
      .populate("mainDestinations", "name image")
      .populate("subDestinations", "name image");

    res.status(201).json({ 
      success: true,
      message: "Tour Package created successfully", 
      package: populatedPackage 
    });
  } catch (error) {
    console.error("Error creating package:", error);
    res.status(500).json({ 
      success: false,
      error: error.message, 
      stack: error.stack 
    });
  }
};

// Get all packages
exports.getTourPackages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    const packages = await TourPackage.find()
      // ✅ UPDATED: Populate multiple categories, sub-categories, destinations and sub-destinations
      .populate("packageCategories", "name image")
      .populate("packageSubCategories", "name image")
      .populate("mainDestinations", "name image")
      .populate("subDestinations", "name image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPackages = await TourPackage.countDocuments();
    const totalPages = Math.ceil(totalPackages / limit);

    res.status(200).json({
      success: true,
      data: packages,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalPackages,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get package by ID
exports.getTourPackageById = async (req, res) => {
  try {
    const tourPackage = await TourPackage.findById(req.params.id)
      // ✅ UPDATED: Populate multiple categories, sub-categories, destinations and sub-destinations
      .populate("packageCategories", "name image description")
      .populate("packageSubCategories", "name image description")
      .populate("mainDestinations", "name image description")
      .populate("subDestinations", "name image description");

    if (!tourPackage) {
      return res.status(404).json({ 
        success: false,
        message: "Package not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: tourPackage
    });
  } catch (error) {
    console.error("Error fetching package:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update package (similar updates as create)
exports.updateTourPackage = async (req, res) => {
  try {
    let data = req.body;

    // First, get the existing package to preserve current images
    const existingPackage = await TourPackage.findById(req.params.id);
    if (!existingPackage) {
      return res.status(404).json({ 
        success: false,
        message: "Package not found" 
      });
    }

    // Convert numeric fields to numbers
    if (data.duration) {
      data.duration = parseInt(data.duration);
    }
    if (data.nights) {
      data.nights = parseInt(data.nights);
    }
    if (data.quantity) {
      data.quantity = parseInt(data.quantity);
    }

    // Handle main image - only update if new one is provided
    if (req.files?.mainImage && req.files.mainImage[0]) {
      data.mainImage = req.files.mainImage[0].filename;
    } else {
      data.mainImage = existingPackage.mainImage;
    }

    // Handle gallery images - combine existing with new ones
    if (req.files?.galleryImages && req.files.galleryImages.length > 0) {
      const newGalleryImages = req.files.galleryImages.map(file => file.filename);
      data.galleryImages = [...(existingPackage.galleryImages || []), ...newGalleryImages];
    } else {
      data.galleryImages = existingPackage.galleryImages || [];
    }

    // Parse JSON fields
    const safeParse = (field) => {
      if (data[field] && typeof data[field] === "string") {
        try {
          return JSON.parse(data[field]);
        } catch (err) {
          throw new Error(`Invalid JSON in ${field}`);
        }
      }
      return data[field];
    };

    data.itinerary = safeParse("itinerary") || [];
    data.hotels = safeParse("hotels") || [];
    data.inclusions = safeParse("inclusions") || [];
    data.exclusions = safeParse("exclusions") || [];
    data.transportModes = safeParse("transportModes") || [];
    
    // Parse categories and destinations
    if (data.packageCategories) {
      data.packageCategories = safeParse("packageCategories");
    }
    
    if (data.packageSubCategories) {
      data.packageSubCategories = safeParse("packageSubCategories");
    }
    
    if (data.mainDestinations) {
      data.mainDestinations = safeParse("mainDestinations");
    }
    
    if (data.subDestinations) {
      data.subDestinations = safeParse("subDestinations");
    }

    if (data.packagePricing) {
      data.packagePricing = safeParse("packagePricing");
      
      // Convert package pricing fields to numbers
      if (data.packagePricing && typeof data.packagePricing === 'object') {
        const pricing = data.packagePricing;
        if (pricing.standard) {
          pricing.standard.base2Adults = parseFloat(pricing.standard.base2Adults) || 0;
          pricing.standard.base4Adults = parseFloat(pricing.standard.base4Adults) || 0;
          pricing.standard.base6Adults = parseFloat(pricing.standard.base6Adults) || 0;
        }
        if (pricing.deluxe) {
          pricing.deluxe.base2Adults = parseFloat(pricing.deluxe.base2Adults) || 0;
          pricing.deluxe.base4Adults = parseFloat(pricing.deluxe.base4Adults) || 0;
          pricing.deluxe.base6Adults = parseFloat(pricing.deluxe.base6Adults) || 0;
        }
        if (pricing.extraAdultPercentage) {
          pricing.extraAdultPercentage = parseFloat(pricing.extraAdultPercentage) || 0;
        }
      }
    }

    // Validate categories and destinations
    if (!data.packageCategories || data.packageCategories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one package category is required"
      });
    }

    if (!data.mainDestinations || data.mainDestinations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one destination is required"
      });
    }

    // FIX: Hotel Images Handling for Update - Preserve existing images
    if (data.hotels && data.hotels.length > 0) {
      data.hotels.forEach((hotel, index) => {
        if (hotel.selected) {
          // If new images are uploaded, use them, otherwise preserve existing images
          if (req.files?.hotelImages && req.files.hotelImages.length > 0) {
            const hotelImages = req.files.hotelImages;
            const hotelTypes = req.body.hotelTypes;
            
            const hotelTypesArray = Array.isArray(hotelTypes) 
              ? hotelTypes 
              : (hotelTypes ? [hotelTypes] : []);
            
            // Filter images for this specific hotel type
            const hotelTypeImages = [];
            hotelImages.forEach((file, imgIndex) => {
              if (hotelTypesArray[imgIndex] === hotel.type) {
                hotelTypeImages.push(file.filename);
              }
            });
            
            if (hotelTypeImages.length > 0) {
              hotel.images = hotelTypeImages;
            } else {
              // No new images for this hotel type, preserve existing ones
              hotel.images = hotel.existingImages || [];
            }
          } else {
            // No new hotel images at all, preserve existing ones
            hotel.images = hotel.existingImages || [];
          }
        } else {
          hotel.images = [];
        }
      });
    }

    // FIX: Itinerary Images Handling for Update - Preserve existing images
    if (data.itinerary && data.itinerary.length > 0) {
      const itineraryImages = req.files?.itineraryImages || [];
      let imageIndex = 0;
      
      data.itinerary.forEach((day) => {
        // If a new image is provided for this day, use it
        if (day.hasImage && itineraryImages[imageIndex]) {
          day.image = itineraryImages[imageIndex].filename;
          imageIndex++;
        } else if (day.existingImage) {
          // Otherwise, preserve the existing image
          day.image = day.existingImage;
        } else {
          // No image for this day
          day.image = null;
        }
      });
    }

    const updatedPackage = await TourPackage.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    )
    .populate("packageCategories", "name image")
    .populate("packageSubCategories", "name image")
    .populate("mainDestinations", "name image")
    .populate("subDestinations", "name image");

    if (!updatedPackage) {
      return res.status(404).json({ 
        success: false,
        message: "Package not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Tour Package updated successfully",
      data: updatedPackage,
    });
  } catch (error) {
    console.error("Error updating package:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};
// Delete package (remains the same)
exports.deleteTourPackage = async (req, res) => {
  try {
    const deletedPackage = await TourPackage.findByIdAndDelete(req.params.id);
    
    if (!deletedPackage) {
      return res.status(404).json({ 
        success: false,
        message: "Package not found" 
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: "Tour Package deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting package:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Filter packages (update population)
exports.getFilteredTourPackages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 8,
      search,
      minPrice,
      maxPrice,
      duration,
      mainDestination,
      packageCategory,
      packageSubCategory,
      packageCategories,
      packageSubCategories,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Search filter
    if (search) {
      filter.$or = [
        { packageName: { $regex: search, $options: 'i' } },
        { packageDescription: { $regex: search, $options: 'i' } }
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.$or = [
        { 'packagePricing.standard.base2Adults': {} },
        { basePrice: {} }
      ];
      
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseInt(minPrice);
      if (maxPrice) priceFilter.$lte = parseInt(maxPrice);
      
      filter.$or[0]['packagePricing.standard.base2Adults'] = priceFilter;
      filter.$or[1].basePrice = priceFilter;
    }

    // Duration filter
    if (duration) {
      const durations = Array.isArray(duration) ? duration : [duration];
      filter.duration = { $in: durations.map(d => parseInt(d)) };
    }

    // ✅ UPDATED: Support both single and multiple destination filtering
    if (mainDestination) {
      if (Array.isArray(mainDestination)) {
        filter.mainDestinations = { $in: mainDestination };
      } else {
        filter.mainDestinations = mainDestination;
      }
    }

    // ✅ UPDATED: Support both single and multiple category filtering
    if (packageCategory || packageCategories) {
      const categories = packageCategories || packageCategory;
      if (Array.isArray(categories)) {
        filter.packageCategories = { $in: categories };
      } else {
        filter.packageCategories = categories;
      }
    }

    // ✅ UPDATED: Support both single and multiple sub-category filtering
    if (packageSubCategory || packageSubCategories) {
      const subCategories = packageSubCategories || packageSubCategory;
      if (Array.isArray(subCategories)) {
        filter.packageSubCategories = { $in: subCategories };
      } else {
        filter.packageSubCategories = subCategories;
      }
    }

    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const packages = await TourPackage.find(filter)
      // ✅ UPDATED: Populate multiple categories, sub-categories, destinations and sub-destinations
      .populate("packageCategories", "name image")
      .populate("packageSubCategories", "name image")
      .populate("mainDestinations", "name image")
      .populate("subDestinations", "name image")
      .sort(sortConfig)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TourPackage.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: packages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching filtered packages:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};