const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
require('dotenv').config();

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// DB connection
mongoose.connect(process.env.MONGO_URI)
   .then(() => {
    console.log('Connected to database:', mongoose.connection.db.databaseName);
  })
  .catch(err => console.log(err));


// Enquiry Popup Route
const enquiryRoutes = require("./routes/enquiryRoutes");
app.use("/api/enquiry", enquiryRoutes);

// Contact Enquiry Route
const ContactEnquiryRoutes = require("./routes/ContactEnquiryRoutes");
app.use("/api/contact-enquiry", ContactEnquiryRoutes);

// Destinations Route
const destinationRoutes = require("./routes/destinationRoutes");
app.use("/api/destinations", destinationRoutes);

// Image Gallery Route 
const imageGalleryRoutes = require("./routes/imageGalleryRoutes");
app.use("/api/image-gallery", imageGalleryRoutes);

// Video Gallery Route 
const videoGalleryRoutes = require("./routes/videoGalleryRoutes");
app.use("/api/video-gallery", videoGalleryRoutes);

// Review Routes
const reviewRoutes = require("./routes/reviewRoutes");
app.use("/api/reviews", reviewRoutes);

// FAQ Routes
const faqRoutes = require("./routes/faqRoutes");
app.use("/api/faq", faqRoutes);

// Offers Routes
const offerRoutes = require("./routes/offerRoutes");
app.use("/api/offers", offerRoutes);

// Blog Routes
const blogRoutes = require("./routes/blogRoutes");
app.use("/api/blogs", blogRoutes);

// Tour Categori 
const tourCategoryRoutes = require("./routes/tourCategoryRoutes");
app.use("/api/tour-categories", tourCategoryRoutes);

// Booking Route 
const bookingRoutes = require("./routes/bookingRoutes");
app.use("/api/bookings", bookingRoutes);

// Tour Packages Route 
const tourPackageRoutes = require("./routes/tourPackageRoutes");
app.use("/api/tour-packages", tourPackageRoutes);

// Payment Route 
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);

// Auth Route 
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// User Route 
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
