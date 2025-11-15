const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  email: { type: String, required: true }, 
  phone: { type: String, required: true },
  packageName: { type: String, required: true },
  packageId: { type: String, required: false },
  packageType: { type: String, required: true }, 
  groupSize: { type: Number, required: true }, 
  adults: { type: Number, required: true }, 
  children: { type: Number, default: 0 }, 
  totalGuests: { type: Number, required: true }, 
  startDate: { type: Date, required: true }, 
  endDate: { type: Date, required: true }, 
  duration: { type: Number, required: true }, 
  specialRequirements: { type: String, default: "" }, 
  
  // Payment Information
  totalPrice: { type: Number, required: true },
  advancePayment: { type: Number, required: true }, 
  remainingPayment: { type: Number, required: true }, 
  discountAmount: { type: Number, default: 0 }, 
  isCouponApplied: { type: Boolean, default: false }, 
  couponCode: { type: String, default: "" }, 
  
  // Razorpay Payment Details
  razorpayPaymentId: { type: String },
  razorpayOrderId: { type: String }, 
  razorpaySignature: { type: String }, 
  
  // User Information
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  userEmail: { type: String }, 
  
  // Status Fields
  paymentStatus: { 
    type: String, 
    enum: ["Pending", "Success", "Failed", "Refunded"], 
    default: "Pending" 
  },
  bookingStatus: { 
    type: String, 
    enum: ["Confirmed", "Cancelled", "Pending", "Completed"], 
    default: "Pending" 
  },
  bookingDate: { type: Date, default: Date.now },
  
  address: { type: String, default: "" },
  city: { type: String, default: "" }, 
  pincode: { type: String, default: "" }, 
}, {
  timestamps: true 
});

module.exports = mongoose.model("Booking", bookingSchema);