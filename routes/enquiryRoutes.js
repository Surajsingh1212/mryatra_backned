const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');

// Add new enquiry
router.post('/', enquiryController.addEnquiry);

// Get all enquiries
router.get('/all', enquiryController.getEnquiries);

// Add remarks to enquiry
router.patch('/:id/remarks', enquiryController.addRemarks);

// Delete enquiry
router.delete('/:id', enquiryController.deleteEnquiry);

module.exports = router;