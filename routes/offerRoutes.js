const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const offerController = require("../controllers/offerController");

// Create Offer
router.post("/", upload.single("image"), offerController.createOffer);

// Get All Offers
router.get("/", offerController.getOffers);

// Get Offer by ID
router.get("/:id", offerController.getOfferById);

// Update Offer
router.put("/:id", upload.single("image"), offerController.updateOffer);

// Delete Offer
router.delete("/:id", offerController.deleteOffer);

router.post("/validate", offerController.validateOffer);

// Mark Offer as Used (After payment success)
router.post("/mark-used", offerController.markOfferAsUsed);

// Apply Coupon (Legacy - agar existing code use kar rahe hain)
router.post("/apply", offerController.applyOffer);

module.exports = router;