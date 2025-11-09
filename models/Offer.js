const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  offerCode: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  packageType: [{ type: String, required: true }],
  status: { type: String, enum: ["Active", "Expired", "Inactive"], default: "Active" },
  usageLimit: { type: Number, required: true },
  usedCount: { type: Number, default: 0 },
  usedBy: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String },
    usedAt: { type: Date, default: Date.now }
  }],
  applicableOn: { type: String },
  minAmount: { type: Number, default: 0 }, 
  image: { type: String },
  description: { type: String }
}, { timestamps: true });

// Pre-save hook to auto-update status
offerSchema.pre('save', function(next) {
  const now = new Date();
  
  // Check if offer should be expired based on dates or usage
  if (this.toDate < now || this.usedCount >= this.usageLimit) {
    this.status = "Expired";
  } 
  // Check if offer should be active based on dates
  else if (this.fromDate <= now && this.toDate >= now) {
    this.status = "Active";
  }
  // Check if offer is not yet active
  else if (this.fromDate > now) {
    this.status = "Inactive";
  }
  
  next();
});

// Remove the problematic pre-find hooks entirely
// They cause performance issues and the casting error

module.exports = mongoose.model("Offer", offerSchema);