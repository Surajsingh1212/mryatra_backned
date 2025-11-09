const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Apply duplicate check middleware to create booking route
router.post("/", bookingController.createBooking);
router.get("/", bookingController.getBookings);
router.get("/user/:email", bookingController.getBookingsByUser);
router.get("/:id", bookingController.getBookingById);
router.put("/:id", bookingController.updateBooking);
router.put("/:id/payment-status", bookingController.updatePaymentStatus);
router.delete("/:id", bookingController.deleteBooking);
router.get("/booking/:bookingId", bookingController.getBookingByBookingId);

module.exports = router;