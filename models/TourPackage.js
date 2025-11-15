const mongoose = require("mongoose");

const tourPackageSchema = new mongoose.Schema({
  packageName: { type: String, required: true },
  packageDescription: { type: String },
  packageCode: { type: String },
  
  // ✅ UPDATED: Multiple categories and sub-categories
  packageCategories: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "TourCategory",
    required: true 
  }],
  packageSubCategories: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "TourSubCategory" 
  }],
  
  // ✅ UPDATED: Multiple destinations and sub-destinations
  mainDestinations: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Destination",
    required: true 
  }],
  subDestinations: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "SubDestination" 
  }],
  
  duration: { type: Number, required: true },
  nights: { type: Number, required: true },
  
  // Package Pricing
  packagePricing: {
    standard: {
      base2Adults: { type: Number, default: 0 },
      base4Adults: { type: Number, default: 0 },
      base6Adults: { type: Number, default: 0 }
    },
    deluxe: {
      base2Adults: { type: Number, default: 0 },
      base4Adults: { type: Number, default: 0 },
      base6Adults: { type: Number, default: 0 }
    },
    extraAdultPercentage: { type: Number, default: 0 }
  },
  
  // ✅ FIXED: Booking Type - Add "instant" to enum
  bookingType: { type: String, enum: ["payment", "enquiry", "instant"], required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  quantity: { type: Number, default: 0 },
  
  // ✅ FIXED: Transport Modes - Allow objects or update frontend
  transportModes: [{
    mode: { type: String },
    description: { type: String }
  }],
  
  inclusions: [{ type: String }],
  exclusions: [{ type: String }],
  
  // Itinerary
  itinerary: [{
    day: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String } 
  }],
  
  // Hotels
  hotels: [{
    type: { type: String, enum: ["Standard", "Deluxe"], required: true },
    selected: { type: Boolean, default: false },
    images: [{ type: String }] // Storing filenames
  }],
  
  // Locations
  pickupLocation: { type: String },
  dropLocation: { type: String },
  packageAvailability: { type: String, enum: ["available", "not_available"], default: "available" },
  
  // Media
  mainImage: { type: String },
  galleryImages: [{ type: String }],
  
  notes: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TourPackage", tourPackageSchema);