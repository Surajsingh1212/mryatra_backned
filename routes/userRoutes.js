const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const userController = require("../controllers/userController");

// Create user (profile photo goes inside uploads/{fullName}/)
router.post("/", upload.single("profilePic"), userController.createUser);

// Get all users
router.get("/", userController.getUsers);

// Get single user
router.get("/:id", userController.getUserById);

// Update user (new profile photo also stored in uploads/{fullName}/)
router.put("/:id", upload.single("profilePic"), userController.updateUser);

// Delete user
router.delete("/:id", userController.deleteUser);

module.exports = router;
