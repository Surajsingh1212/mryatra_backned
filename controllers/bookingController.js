const Booking = require("../models/Booking");

const generateBookingId = async () => {

  const now = new Date();
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  const date = istDate.getDate().toString().padStart(2, '0');
  const month = istDate.toLocaleString('en', { 
    month: 'short',
    timeZone: 'Asia/Kolkata'
  }).toUpperCase();
  const year = istDate.getFullYear().toString().slice(-2);
  
  const datePrefix = `MRY${date}${month}${year}`;
  
  const latestBooking = await Booking.findOne({
    bookingId: new RegExp(`^${datePrefix}`)
  }).sort({ createdAt: -1 });
  
  let sequence = 1;
  if (latestBooking) {
    const lastSequence = parseInt(latestBooking.bookingId.slice(-2));
    sequence = lastSequence + 1;
  }
  
  const sequenceStr = sequence.toString().padStart(2, '0');
  return `${datePrefix}${sequenceStr}`;
};

// Alternative method using toLocaleString for more reliable IST date
const generateBookingIdAlternative = async () => {
  // Method 2: More reliable way to get IST date
  const now = new Date();
  const istOptions = {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  };
  
  const istDateString = now.toLocaleString('en-IN', istOptions);
  const [day, month, year] = istDateString.split('/');
  
  const date = day.padStart(2, '0');
  const monthUpper = month.toUpperCase();
  
  const datePrefix = `MRY${date}${monthUpper}${year}`;
  
  // Find the latest booking for today
  const latestBooking = await Booking.findOne({
    bookingId: new RegExp(`^${datePrefix}`)
  }).sort({ createdAt: -1 });
  
  let sequence = 1;
  if (latestBooking) {
    const lastSequence = parseInt(latestBooking.bookingId.slice(-2));
    sequence = lastSequence + 1;
  }
  
  const sequenceStr = sequence.toString().padStart(2, '0');
  return `${datePrefix}${sequenceStr}`;
};
// Create booking
exports.createBooking = async (req, res) => {
  try {
    const {
      razorpayPaymentId,
      razorpayOrderId,
      email,
      packageName,
      packageId,
      startDate,
      customerName,
      phone,
      packageType,
      groupSize,
      adults,
      children,
      totalGuests,
      endDate,
      duration,
      specialRequirements,
      totalPrice,
      advancePayment,
      remainingPayment,
      discountAmount,
      isCouponApplied,
      couponCode,
      razorpaySignature,
      userId,
      userEmail,
      address,
      city,
      pincode
    } = req.body;

    // Generate custom booking ID with IST timezone
    const bookingId = await generateBookingId(); // or use generateBookingIdAlternative()

    const booking = new Booking({
      bookingId,
      customerName,
      email,
      phone,
      packageName,
      packageId,
      packageType,
      groupSize,
      adults,
      children,
      totalGuests,
      startDate,
      endDate,
      duration,
      specialRequirements,
      totalPrice,
      advancePayment,
      remainingPayment,
      discountAmount,
      isCouponApplied,
      couponCode,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      userId,
      userEmail,
      address,
      city,
      pincode,
      paymentStatus: "Success", 
      bookingStatus: "Confirmed"
    });

    await booking.save();
    res.status(201).json({
      success: true,
      booking,
      bookingId: booking.bookingId,
      message: "Booking created successfully"
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get all bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }
    res.json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get bookings by user email
exports.getBookingsByUser = async (req, res) => {
  try {
    const { email } = req.params;
    const bookings = await Booking.find({ 
      $or: [
        { email: email },
        { userEmail: email }
      ]
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }
    
    res.json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }
    
    res.json({ 
      success: true,
      message: "Booking deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, razorpayPaymentId } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        paymentStatus,
        razorpayPaymentId 
      },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }
    
    res.json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get booking by booking ID
exports.getBookingByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;
    console.log('Searching for booking with ID:', bookingId);
    
    const booking = await Booking.findOne({ bookingId: bookingId });
    
    if (!booking) {
      console.log('Booking not found with ID:', bookingId);
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }
    
    console.log('Booking found:', booking.bookingId);
    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error in getBookingByBookingId:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};