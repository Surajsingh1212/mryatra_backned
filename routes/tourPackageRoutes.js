const express = require("express");
const router = express.Router();
const tourPackageController = require("../controllers/tourPackageController");
const upload = require("../middleware/uploadMiddleware");

// Create package (support multiple files)
router.post(
  "/",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 20 },
    { name: "hotelImages", maxCount: 30 },
    { name: "itineraryImages", maxCount: 30 },
  ]),
  tourPackageController.createTourPackage
);

// Get all packages
router.get("/", tourPackageController.getTourPackages);

// Get package by ID
router.get("/:id", tourPackageController.getTourPackageById);

// Update package
router.put(
  "/:id",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 20 },
    { name: "hotelImages", maxCount: 30 },
    { name: "itineraryImages", maxCount: 30 },
  ]),
  tourPackageController.updateTourPackage
);

// Delete package
router.delete("/:id", tourPackageController.deleteTourPackage);

router.get("/filter/packages", tourPackageController.getFilteredTourPackages);

module.exports = router;