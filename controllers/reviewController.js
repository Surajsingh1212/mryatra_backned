const Review = require("../models/Review");

// Create Review
exports.createReview = async (req, res) => {
  try {
    const { reviewText, rating, fullName, designation, status } = req.body;

    const newReview = new Review({
      review: reviewText,
      rating,
      touristName: fullName,
      touristDesignation: designation,
      status,
      profileImage: req.file ? req.file.filename : null,
    });

    await newReview.save();
    res.status(201).json({ message: "Review created successfully", review: newReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all reviews
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get review by ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Review
exports.updateReview = async (req, res) => {
  try {
    const { reviewText, rating, fullName, designation, status } = req.body;

    let updateData = {
      review: reviewText,
      rating,
      touristName: fullName,
      touristDesignation: designation,
      status,
    };

 if (req.file) {
      updateData.profileImage = req.file.filename; 
    }
    const updatedReview = await Review.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedReview) return res.status(404).json({ message: "Review not found" });

    res.status(200).json({ message: "Review updated successfully", review: updatedReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
