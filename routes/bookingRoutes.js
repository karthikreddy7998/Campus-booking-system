const express = require("express");
const router = express.Router();

const {
  bookRoom,
  getBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
  updateBooking,
  checkIn,
  checkInWithOTP
} = require("../controllers/bookingController");

// Create Booking Request
router.post("/book", bookRoom);

// Get All Bookings
router.get("/", getBookings);

// Approve Booking
router.put("/approve/:id", approveBooking);

// Reject Booking
router.put("/reject/:id", rejectBooking);

// Cancel Booking
router.put("/cancel/:id", cancelBooking);

// Update Booking
router.put("/update/:id", updateBooking);

// QR Code Check-in
router.post("/checkin/:token", checkIn);

// OTP Check-in
router.post("/checkin-otp", checkInWithOTP);

module.exports = router;