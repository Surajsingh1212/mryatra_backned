const mongoose = require("mongoose");

const tourPackageSchema = new mongoose.Schema(
  {
    packageName: { type: String, required: true },
    packageDescription: { type: String },
    packageType: [{ type: String, required: true }],
    destinations: [{ type: String }],
    packageCode: { type: String, unique: true },
    duration: { type: Number }, 
    nights: { type: Number },
    packagePricing: {
      standard: {
        base2Adults: { type: Number }, // Price for 2 adults
        base4Adults: { type: Number }, // Price for 4 adults  
        base6Adults: { type: Number }  // Price for 6 adults
      },
      deluxe: {
        base2Adults: { type: Number }, // Price for 2 adults
        base4Adults: { type: Number }, // Price for 4 adults
        base6Adults: { type: Number }  // Price for 6 adults
      },
      extraAdultPercentage: { type: Number } // e.g., 55 for 55%
    },

    // Booking info
    bookingType: { type: String, enum: ["payment", "enquiry"], default: "enquiry" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    quantity: { type: Number, default: 0 },

    // Lists
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],

    itinerary: [
      {
        day: Number,
        title: String,
        description: String,
        image: String, // file path
      },
    ],

    hotels: [
      {
        type: { 
          type: String, 
          enum: ["Standard", "Deluxe"] 
        },
        images: [String], 
      },
    ],

    pickupLocation: { type: String },
    dropLocation: { type: String },
    packageAvailability: { type: String, enum: ["available", "not_available"], default: "available" },
    transportModes: [{ type: String }],

    notes: { type: String },

    mainImage: { type: String },
    galleryImages: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TourPackage", tourPackageSchema);