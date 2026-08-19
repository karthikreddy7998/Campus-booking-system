const express = require("express");
const router = express.Router();

const {
  addRoom,
  getRooms,
  updateRoom,
  deleteRoom
} = require("../controllers/roomController");

// Add Room
router.post("/add", addRoom);

// Get All Rooms
router.get("/", getRooms);

// Update Room
router.put("/:id", updateRoom);

// Delete Room
router.delete("/:id", deleteRoom);

module.exports = router;