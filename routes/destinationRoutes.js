const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const destinationController = require("../controllers/destinationController");

// Routes
router.post("/", upload.single("image"), destinationController.addDestination);
router.get("/", destinationController.getDestinations);
router.get("/:id", destinationController.getDestinationById);
router.put("/:id", upload.single("image"), destinationController.updateDestination);
router.delete("/:id", destinationController.deleteDestination);

module.exports = router;
