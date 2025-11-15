const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }, 
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  
  // ✅ NEW FIELDS FOR FILTERING
  isPeakSeason: { type: Boolean, default: false },
  isTopDestination: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  isAdventure: { type: Boolean, default: false },
  isBeach: { type: Boolean, default: false },
  isHillStation: { type: Boolean, default: false },
  isHistorical: { type: Boolean, default: false },
  isReligious: { type: Boolean, default: false },
  
  // Additional fields for better filtering
  season: { 
    type: String, 
    enum: ["summer", "winter", "monsoon", "spring", "autumn", "all-season"], 
    default: "all-season" 
  },
  budgetRange: { 
    type: String, 
    enum: ["budget", "mid-range", "luxury", "premium"], 
    default: "mid-range" 
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Destination", destinationSchema);