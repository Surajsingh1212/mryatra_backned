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

    data.inclusions = safeParse("inclusions") || [];
    data.exclusions = safeParse("exclusions") || [];
    data.transportModes = safeParse("transportModes") || [];
    data.hotels = safeParse("hotels") || [];
    data.itinerary = safeParse("itinerary") || [];
    
    // NEW: Parse package pricing
    if (data.packagePricing) {
      data.packagePricing = safeParse("packagePricing");
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

    res.status(201).json({ 
      success: true,
      message: "Tour Package created successfully", 
      package: newPackage 
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
    const limit = 8; // Fixed to 8 packages per page
    const skip = (page - 1) * limit;

    const packages = await TourPackage.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination info
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
    const tourPackage = await TourPackage.findById(req.params.id);

    if (!tourPackage) {
      return res.status(404).json({ 
        success: false,
        message: "Package not found" 
      });
    }

    // Parse stringified arrays if they exist
    const parseIfString = (field) => {
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch (e) {
          return field;
        }
      }
      return field;
    };

    const normalized = {
      _id: tourPackage._id,
      packageName: tourPackage.packageName || "",
      packageDescription: tourPackage.packageDescription || "",
      packageType: tourPackage.packageType || [],
      destinations: tourPackage.destinations || [],
      packageCode: tourPackage.packageCode || "",
      duration: tourPackage.duration || "",
      nights: tourPackage.nights || "",
      
      // NEW: Package Pricing
      packagePricing: tourPackage.packagePricing || {
        standard: { base2Adults: "", base4Adults: "", base6Adults: "" },
        deluxe: { base2Adults: "", base4Adults: "", base6Adults: "" },
        extraAdultPercentage: ""
      },

      bookingType: tourPackage.bookingType || "enquiry",
      status: tourPackage.status || "active",
      quantity: tourPackage.quantity || "",
      notes: tourPackage.notes || "",
      mainImage: tourPackage.mainImage || null,
      galleryImages: tourPackage.galleryImages || [],
      inclusions: tourPackage.inclusions || [],
      exclusions: tourPackage.exclusions || [],
      transportModes: tourPackage.transportModes || [],
      hotels: tourPackage.hotels || [],
      itinerary: tourPackage.itinerary || [],
      pickupLocation: tourPackage.pickupLocation || "",
      dropLocation: tourPackage.dropLocation || "",
      packageAvailability: tourPackage.packageAvailability || "available",
      createdAt: tourPackage.createdAt,
      updatedAt: tourPackage.updatedAt
    };

    res.status(200).json({
      success: true,
      data: normalized
    });
  } catch (error) {
    console.error("Error fetching package:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update package
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

    // Handle main image - only update if new one is provided
    if (req.files?.mainImage && req.files.mainImage[0]) {
      data.mainImage = req.files.mainImage[0].filename;
    } else {
      // Preserve existing main image
      data.mainImage = existingPackage.mainImage;
    }

    // Handle gallery images - combine existing with new ones
    if (req.files?.galleryImages && req.files.galleryImages.length > 0) {
      const newGalleryImages = req.files.galleryImages.map(file => file.filename);
      data.galleryImages = [...(existingPackage.galleryImages || []), ...newGalleryImages];
    } else {
      // Preserve existing gallery images
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
    
    // NEW: Parse package pricing
    if (data.packagePricing) {
      data.packagePricing = safeParse("packagePricing");
    }

    // ✅ FIXED: Hotel Images Handling for Update - Preserve existing images
    if (req.files?.hotelImages && req.files.hotelImages.length > 0) {
      console.log("Processing hotel images for update...");
      
      const hotelImages = req.files.hotelImages;
      const hotelTypes = req.body.hotelTypes;
      
      // Convert hotelTypes to array if it's a string
      const hotelTypesArray = Array.isArray(hotelTypes) 
        ? hotelTypes 
        : (hotelTypes ? [hotelTypes] : []);
      
      // Group new images by hotel type
      const newHotelImagesByType = {};
      
      // Initialize for selected hotels with existing images
      data.hotels.forEach(hotel => {
        if (hotel.selected) {
          // Find existing hotel data to preserve images
          const existingHotel = existingPackage.hotels.find(h => h.type === hotel.type);
          newHotelImagesByType[hotel.type] = existingHotel?.images || [];
        }
      });
      
      // Distribute new images to their respective hotel types
      hotelImages.forEach((file, index) => {
        const type = hotelTypesArray[index];
        if (type && newHotelImagesByType[type]) {
          newHotelImagesByType[type].push(file.filename);
        }
      });
      
      // Assign combined images (existing + new) to the correct hotels
      data.hotels.forEach(hotel => {
        if (hotel.selected && newHotelImagesByType[hotel.type]) {
          hotel.images = newHotelImagesByType[hotel.type];
        } else if (hotel.selected) {
          // If no new images but hotel is selected, preserve existing images
          const existingHotel = existingPackage.hotels.find(h => h.type === hotel.type);
          hotel.images = existingHotel?.images || [];
        }
      });
    } else {
      // If no new hotel images, preserve existing hotel images
      data.hotels.forEach(hotel => {
        if (hotel.selected) {
          const existingHotel = existingPackage.hotels.find(h => h.type === hotel.type);
          hotel.images = existingHotel?.images || [];
        }
      });
    }

    // ✅ FIXED: Itinerary Images Handling for Update - Preserve existing images
    if (req.files?.itineraryImages && req.files.itineraryImages.length > 0) {
      console.log("Processing itinerary images for update...");
      
      const itineraryImages = req.files.itineraryImages;
      const itinImages = [...itineraryImages];
      
      // Preserve existing itinerary structure first
      const updatedItinerary = data.itinerary.map((day, index) => {
        const existingDay = existingPackage.itinerary[index];
        return {
          ...day,
          image: existingDay?.image || null // Preserve existing image
        };
      });
      
      // Assign new images to itinerary days sequentially
      let imageIndex = 0;
      updatedItinerary.forEach((day, index) => {
        if (itinImages.length > 0 && imageIndex < itinImages.length) {
          // Replace existing image with new one if available
          day.image = itinImages[imageIndex].filename;
          imageIndex++;
        }
      });
      
      data.itinerary = updatedItinerary;
    } else {
      // If no new itinerary images, preserve existing images
      data.itinerary = data.itinerary.map((day, index) => {
        const existingDay = existingPackage.itinerary[index];
        return {
          ...day,
          image: existingDay?.image || day.image || null
        };
      });
    }

    // Ensure all arrays are properly set
    data.inclusions = data.inclusions || [];
    data.exclusions = data.exclusions || [];
    data.transportModes = data.transportModes || [];
    data.hotels = data.hotels || [];
    data.itinerary = data.itinerary || [];

    console.log("Final data to update:", {
      hotels: data.hotels,
      itinerary: data.itinerary.map(d => ({ day: d.day, hasImage: !!d.image })),
      galleryImages: data.galleryImages?.length,
      mainImage: data.mainImage
    });

    const updatedPackage = await TourPackage.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );

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
// Delete package
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

exports.getFilteredTourPackages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 8,
      search,
      minPrice,
      maxPrice,
      duration,
      destinations,
      packageTypes,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Search filter
    if (search) {
      filter.$or = [
        { packageName: { $regex: search, $options: 'i' } },
        { packageDescription: { $regex: search, $options: 'i' } },
        { 'destinations': { $in: [new RegExp(search, 'i')] } }
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

    // Destinations filter
    if (destinations) {
      const destArray = Array.isArray(destinations) ? destinations : [destinations];
      filter.destinations = { $in: destArray.map(d => new RegExp(d, 'i')) };
    }

    // Package types filter
    if (packageTypes) {
      const typesArray = Array.isArray(packageTypes) ? packageTypes : [packageTypes];
      filter.packageType = { $in: typesArray.map(t => new RegExp(t, 'i')) };
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const packages = await TourPackage.find(filter)
      .sort(sortConfig)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
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