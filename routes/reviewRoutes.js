const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware"); 
const reviewController = require("../controllers/reviewController");

// Routes
router.post("/", upload.single("profileImage"), reviewController.createReview);
router.get("/", reviewController.getReviews);
router.get("/:id", reviewController.getReviewById);
router.put("/:id", upload.single("profileImage"), reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
