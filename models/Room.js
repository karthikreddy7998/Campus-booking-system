const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      required: true
    },

    building: {
      type: String,
      required: true
    },

    floor: {
      type: Number,
      default: 1
    },

    capacity: {
      type: Number,
      required: true
    },

    type: {
      type: String,
      default: "classroom"
    },

    special: {
      type: Boolean,
      default: false
    },

    available: {
      type: Boolean,
      default: true
    },

    imageUrl: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);