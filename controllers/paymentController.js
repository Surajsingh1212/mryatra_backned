// controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { razorpay } = require('../config/config');
const Booking = require('../models/Booking');

console.log('Razorpay Config:', {
    key_id: razorpay.RAZORPAY_KEY_ID ? 'Loaded' : 'Missing',
    key_secret: razorpay.RAZORPAY_KEY_SECRET ? 'Loaded' : 'Missing'
});

const instance = new Razorpay({
    key_id: razorpay.RAZORPAY_KEY_ID,
    key_secret: razorpay.RAZORPAY_KEY_SECRET
});

// Generate custom booking ID with IST timezone - FIXED VERSION
const generateBookingId = async () => {
  // Get current date in IST (Indian Standard Time)
  const now = new Date();
  
  // Create date formatter for IST
  const istFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  });
  
  // Format the date parts
  const parts = istFormatter.formatToParts(now);
  let day, month, year;
  
  for (const part of parts) {
    if (part.type === 'day') day = part.value;
    if (part.type === 'month') month = part.value;
    if (part.type === 'year') year = part.value;
  }
  
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

// Alternative simpler method for IST date
const generateBookingIdSimple = async () => {
  // Get current date in IST
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  const date = istTime.getDate().toString().padStart(2, '0');
  const month = istTime.toLocaleString('en', { 
    month: 'short',
    timeZone: 'Asia/Kolkata'
  }).toUpperCase();
  const year = istTime.getFullYear().toString().slice(-2);
  
  const datePrefix = `MRY${date}${month}${year}`;
  
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

// Test function
const testISTDate = () => {
  const now = new Date();
  console.log('UTC Date:', now.toUTCString());
  console.log('Local Server Date:', now.toString());
  
  // Test both methods
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  console.log('IST Date (Simple):', {
    date: istTime.getDate(),
    month: istTime.toLocaleString('en', { month: 'short', timeZone: 'Asia/Kolkata' }),
    year: istTime.getFullYear().toString().slice(-2)
  });
  
  return 'IST Date test completed';
};

// Create Order (expect amount in RUPEES from frontend)
exports.createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', packageId, userId } = req.body;
        console.log("Incoming payment request:", req.body);

        if (!amount || !packageId) {
            return res.status(400).json({ success: false, message: 'Missing amount or packageId' });
        }

        const amountInPaise = Math.round(Number(amount) * 100);

        const shortId = packageId.slice(-6); 
        const timestamp = Date.now().toString().slice(-6); 
        const receipt = `mry_${shortId}_${timestamp}`; 

        const options = {
            amount: amountInPaise,
            currency,
            receipt: receipt 
        };

        const order = await instance.orders.create(options);
        console.log("Razorpay order created:", order);

        return res.json({ success: true, order });
    } catch (err) {
        console.error('Error creating order:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error creating order' });
    }
};

// Verify Payment (called from frontend handler after successful payment)
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            packageId,
            userId,
            amount, 
            customerName,
            phone,
            packageName,
            bookingData 
        } = req.body;

        console.log("Verifying payment with data:", {
            razorpay_order_id,
            razorpay_payment_id,
            packageId,
            customerName,
            bookingData: bookingData ? 'Received' : 'Missing'
        });

        // Test IST date generation
        console.log('IST Date Test:', testISTDate());

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Missing payment info' });
        }

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', razorpay.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        // Generate custom booking ID with IST timezone - USING SIMPLE METHOD
        const bookingId = await generateBookingIdSimple();
        console.log('Generated Booking ID (IST):', bookingId);

        // Calculate remaining payment (70% of total)
        const totalPrice = bookingData?.totalPrice || (amount / 0.3); 
        const advancePayment = Number(amount);
        const remainingPayment = totalPrice - advancePayment;

        // Create booking entry with ALL required fields
        const booking = new Booking({
            // Required fields from schema
            bookingId: bookingId, // Use custom booking ID with IST
            customerName: customerName || bookingData?.userData?.fullName || 'Customer',
            email: bookingData?.userData?.email || 'customer@example.com', 
            phone: phone || bookingData?.userData?.phone || '0000000000',
            packageName: packageName || packageId || 'Travel Package',
            packageId: packageId || bookingData?.packageId || 'N/A',
            packageType: bookingData?.packageType || 'standard', 
            groupSize: bookingData?.groupSize || 2, 
            adults: bookingData?.adults || 2, 
            children: bookingData?.children || 0,
            totalGuests: bookingData?.guests || 2, 
            startDate: bookingData?.startDate || new Date(), 
            endDate: bookingData?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
            duration: bookingData?.duration || 7,
            
            // Payment Information
            totalPrice: totalPrice,
            advancePayment: advancePayment,
            remainingPayment: remainingPayment, 
            discountAmount: bookingData?.discountAmount || 0,
            isCouponApplied: bookingData?.isCouponApplied || false,
            couponCode: bookingData?.couponCode || '',
            
            // Razorpay Payment Details
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpaySignature: razorpay_signature,
            
            // User Information
            userId: userId || null,
            userEmail: bookingData?.userData?.email || 'customer@example.com',
            
            // Status Fields
            paymentStatus: 'Success',
            bookingStatus: 'Confirmed',
            bookingDate: new Date(),
            
            // Optional fields with defaults
            specialRequirements: bookingData?.specialRequirements || '',
            address: bookingData?.userData?.address || '',
            city: bookingData?.userData?.city || '',
            pincode: bookingData?.userData?.pincode || ''
        });

        await booking.save();
        console.log("Booking created successfully with ID:", booking.bookingId);

        return res.json({ 
            success: true, 
            message: 'Payment verified & booking confirmed', 
            bookingId: booking.bookingId,
            booking 
        });

    } catch (err) {
        console.error('Error verifying payment:', err);
        
        // More detailed error logging
        if (err.name === 'ValidationError') {
            console.error('Validation errors:', err.errors);
            return res.status(400).json({ 
                success: false, 
                message: 'Booking validation failed',
                errors: err.errors 
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            message: 'Server error verifying payment',
            error: err.message 
        });
    }
};

// Get All Successful Payments
exports.getAllSuccessfulPayments = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            startDate, 
            endDate,
            customerName,
            sortBy = 'bookingDate',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object for successful payments only
        const filter = {
            paymentStatus: 'Success'
        };

        // Date range filter
        if (startDate || endDate) {
            filter.bookingDate = {};
            if (startDate) {
                filter.bookingDate.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.bookingDate.$lte = new Date(endDate);
            }
        }

        // Customer name search (case-insensitive)
        if (customerName) {
            filter.customerName = { 
                $regex: customerName, 
                $options: 'i' 
            };
        }

        // Sort configuration
        const sortConfig = {};
        sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const payments = await Booking.find(filter)
            .sort(sortConfig)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-razorpaySignature') // Exclude sensitive data
            .lean();

        // Get total count for pagination
        const totalCount = await Booking.countDocuments(filter);

        // Calculate total amounts
        const totalStats = await Booking.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalAdvanceReceived: { $sum: "$advancePayment" },
                    totalRemainingAmount: { $sum: "$remainingPayment" },
                    totalBookings: { $sum: 1 }
                }
            }
        ]);

        const stats = totalStats[0] || {
            totalAdvanceReceived: 0,
            totalRemainingAmount: 0,
            totalBookings: 0
        };

        return res.json({
            success: true,
            data: {
                payments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / limit),
                    totalPayments: totalCount,
                    hasNext: page < Math.ceil(totalCount / limit),
                    hasPrev: page > 1
                },
                summary: {
                    totalAdvanceReceived: stats.totalAdvanceReceived,
                    totalRemainingAmount: stats.totalRemainingAmount,
                    totalBookings: stats.totalBookings,
                    totalRevenue: stats.totalAdvanceReceived + stats.totalRemainingAmount
                }
            }
        });

    } catch (err) {
        console.error('Error fetching successful payments:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error fetching payments',
            error: err.message 
        });
    }
};

// Get Payment Details by Booking ID
exports.getPaymentDetails = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const payment = await Booking.findOne({ 
            bookingId,
            paymentStatus: 'Success'
        }).select('-razorpaySignature');

        if (!payment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Payment not found' 
            });
        }

        return res.json({
            success: true,
            data: payment
        });

    } catch (err) {
        console.error('Error fetching payment details:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error fetching payment details',
            error: err.message 
        });
    }
};