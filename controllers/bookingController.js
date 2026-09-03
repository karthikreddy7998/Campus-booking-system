const Booking = require("../models/Booking");
const { v4: uuidv4 } = require("uuid");
const { createNotification } = require("./notificationController");
const { sendBookingApproved, sendBookingRejected } = require("../utils/emailService");

// Create Booking Request
const bookRoom = async (req, res) => {
  try {
    const {
      userId,
      roomId,
      date,
      startTime,
      endTime,
      purpose
    } = req.body;

    if (startTime >= endTime) {
      return res.status(400).json({
        message: "End time must be after start time"
      });
    }

    // Check time conflict with active bookings
    const existing = await Booking.findOne({
      roomId,
      date,
      status: {
        $in: ["pending", "approved"]
      },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });

    if (existing) {
      return res.status(400).json({
        message:
          "Room already requested/booked for this time slot"
      });
    }

    const booking = await Booking.create({
      userId,
      roomId,
      date,
      startTime,
      endTime,
      purpose,
      status: "pending"
    });

    // Create notification for admins
    const User = require("../models/User");
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        `New booking request for ${date} (${startTime} - ${endTime})`,
        "new_booking",
        booking._id
      );
    }

    res.status(201).json({
      message:
        "Booking request submitted for admin approval",
      booking
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get All Bookings
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email role")
      .populate("roomId")
      .sort({ createdAt: -1 });

    res.json(bookings);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Approve Booking
const approveBooking = async (req, res) => {
  try {
    // Generate QR code token and OTP on approval
    const qrCode = uuidv4();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "approved", qrCode, otp },
      { new: true }
    ).populate("userId", "name email").populate("roomId", "roomName building");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Create notification for the user
    await createNotification(
      booking.userId._id,
      `Your booking for ${booking.roomId?.roomName || 'a room'} on ${booking.date} has been approved! ✅ OTP: ${otp}`,
      "booking_approved",
      booking._id
    );

    // Send email notification with OTP
    if (booking.userId?.email) {
      sendBookingApproved(
        booking.userId.email,
        booking.userId.name,
        booking.roomId?.roomName || 'Room',
        booking.date,
        `${booking.startTime} - ${booking.endTime}`,
        otp
      );
    }

    res.json({
      message: "Booking approved successfully",
      booking
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Reject Booking
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    ).populate("userId", "name email").populate("roomId", "roomName building");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Create notification for the user
    await createNotification(
      booking.userId._id,
      `Your booking for ${booking.roomId?.roomName || 'a room'} on ${booking.date} has been rejected. ❌`,
      "booking_rejected",
      booking._id
    );

    // Send email notification
    if (booking.userId?.email) {
      sendBookingRejected(
        booking.userId.email,
        booking.userId.name,
        booking.roomId?.roomName || 'Room',
        booking.date,
        `${booking.startTime} - ${booking.endTime}`
      );
    }

    res.json({
      message: "Booking rejected successfully",
      booking
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Cancel Booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    res.json({
      message: "Booking cancelled successfully",
      booking
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update Booking (Modify pending booking)
const updateBooking = async (req, res) => {
  try {
    const { date, startTime, endTime, purpose } = req.body;

    if (startTime >= endTime) {
      return res.status(400).json({
        message: "End time must be after start time"
      });
    }
    
    // Check time conflict with active bookings, excluding current booking
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const existing = await Booking.findOne({
      _id: { $ne: booking._id },
      roomId: booking.roomId,
      date,
      status: { $in: ["pending", "approved"] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });

    if (existing) {
      return res.status(400).json({
        message: "Room already requested/booked for this time slot"
      });
    }

    booking.date = date || booking.date;
    booking.startTime = startTime || booking.startTime;
    booking.endTime = endTime || booking.endTime;
    booking.purpose = purpose || booking.purpose;

    await booking.save();

    res.json({
      message: "Booking updated successfully",
      booking
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// QR Code Check-in
const checkIn = async (req, res) => {
  try {
    const { token } = req.params;

    const booking = await Booking.findOne({ qrCode: token })
      .populate("roomId", "roomName building")
      .populate("userId", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Invalid QR code. Booking not found." });
    }

    if (booking.status !== "approved") {
      return res.status(400).json({ message: "This booking is not approved." });
    }

    if (booking.checkedIn) {
      return res.status(400).json({ message: "Already checked in for this booking." });
    }

    booking.checkedIn = true;
    booking.checkInTime = new Date();
    await booking.save();

    res.json({
      message: "Check-in successful! Welcome.",
      booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// OTP Check-in
const checkInWithOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    const booking = await Booking.findOne({ otp })
      .populate("roomId", "roomName building")
      .populate("userId", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Invalid OTP. Booking not found." });
    }

    if (booking.status !== "approved") {
      return res.status(400).json({ message: "This booking is not approved." });
    }

    if (booking.checkedIn) {
      return res.status(400).json({ message: "Already checked in for this booking." });
    }

    booking.checkedIn = true;
    booking.checkInTime = new Date();
    await booking.save();

    res.json({
      message: "Check-in successful with OTP! Welcome.",
      booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  bookRoom,
  getBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
  updateBooking,
  checkIn,
  checkInWithOTP
};