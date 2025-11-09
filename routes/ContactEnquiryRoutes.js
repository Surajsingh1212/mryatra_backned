const express = require('express');
const router = express.Router();
const contactEnquiryController = require('../controllers/contactEnquiryController');

// Add new enquiry
router.post('/', contactEnquiryController.addEnquiry);

// Get all enquiries
router.get('/all', contactEnquiryController.getEnquiries);

// Add remarks to enquiry
router.patch('/:id/remarks', contactEnquiryController.addRemarks);

// Delete enquiry
router.delete('/:id', contactEnquiryController.deleteEnquiry);

module.exports = router;