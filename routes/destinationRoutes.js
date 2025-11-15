const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const destinationController = require("../controllers/destinationController");

// Existing Routes
router.post("/", upload.single("image"), destinationController.addDestination);
router.get("/", destinationController.getDestinations);
router.get("/active", destinationController.getActiveDestinations); 
router.get("/search", destinationController.searchDestinations);
router.get("/:id", destinationController.getDestinationById);
router.put("/:id", upload.single("image"), destinationController.updateDestination);
router.delete("/:id", destinationController.deleteDestination);

//  NEW ROUTES FOR FILTERING
router.get("/filter/peak-season", destinationController.getPeakSeasonDestinations);
router.get("/filter/top-destinations", destinationController.getTopDestinations);
router.get("/filter/popular", destinationController.getPopularDestinations);
router.get("/filter/category/:category", destinationController.getDestinationsByCategory);
router.get("/filter/all", destinationController.getFilteredDestinations);

module.exports = router;