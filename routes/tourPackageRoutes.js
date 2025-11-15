const express = require("express");
const router = express.Router();
const tourPackageController = require("../controllers/tourPackageController");
const upload = require("../middleware/uploadMiddleware");

// Define file upload configuration
const packageUpload = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 20 },
  { name: "hotelImages", maxCount: 30 },
  { name: "itineraryImages", maxCount: 30 },
]);

// Routes
router.post("/", packageUpload, tourPackageController.createTourPackage);
router.get("/", tourPackageController.getTourPackages);
router.get("/:id", tourPackageController.getTourPackageById);
router.put("/:id", packageUpload, tourPackageController.updateTourPackage);
router.delete("/:id", tourPackageController.deleteTourPackage);
router.get("/filter/packages", tourPackageController.getFilteredTourPackages);

module.exports = router;