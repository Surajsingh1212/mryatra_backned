const express = require("express");
const router = express.Router();
const faqController = require("../controllers/faqController");

// Add new FAQ
router.post("/", faqController.addFaq);

// Get all FAQs
router.get("/all", faqController.getFaqs);

// Get single FAQ by ID
router.get("/:id", faqController.getFaqById);

// Update FAQ
router.put("/:id", faqController.updateFaq);

// Delete FAQ
router.delete("/:id", faqController.deleteFaq);

module.exports = router;
