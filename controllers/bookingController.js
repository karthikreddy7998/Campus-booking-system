const Booking = require("../models/Booking");

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
    const booking =
      await Booking.findByIdAndUpdate(
        req.params.id,
        { status: "approved" },
        { new: true }
      );

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
    const booking =
      await Booking.findByIdAndUpdate(
        req.params.id,
        { status: "rejected" },
        { new: true }
      );

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
    const booking =
      await Booking.findByIdAndUpdate(
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

module.exports = {
  bookRoom,
  getBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
  updateBooking
};