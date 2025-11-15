const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const subDestinationController = require("../controllers/subDestinationController");

router.post("/", upload.single("image"), subDestinationController.addSubDestination);
router.get("/", subDestinationController.getSubDestinations);
router.get("/active", subDestinationController.getActiveSubDestinations); 
router.get("/search", subDestinationController.searchSubDestinations);
router.get("/by-destination/:destinationId", subDestinationController.getSubDestinationsByDestination);
router.get("/by-multiple-destinations", subDestinationController.getSubDestinationsByMultipleDestinations); 
router.put("/:id", upload.single("image"), subDestinationController.updateSubDestination);
router.delete("/:id", subDestinationController.deleteSubDestination);

module.exports = router;