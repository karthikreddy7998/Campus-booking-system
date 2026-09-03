const Booking = require("../models/Booking");
const Room = require("../models/Room");

const getAnalytics = async (req, res) => {
  try {
    const allBookings = await Booking.find().populate("roomId");
    
    // Bookings by status
    const bookingsByStatus = {
      pending: allBookings.filter(b => b.status === 'pending').length,
      approved: allBookings.filter(b => b.status === 'approved').length,
      rejected: allBookings.filter(b => b.status === 'rejected').length,
      cancelled: allBookings.filter(b => b.status === 'cancelled').length
    };

    // Bookings per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyMap = {};
    allBookings.forEach(b => {
      const day = b.date?.split('T')[0] || b.date;
      if (day) {
        dailyMap[day] = (dailyMap[day] || 0) + 1;
      }
    });
    const bookingsPerDay = Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    // Top booked rooms
    const roomMap = {};
    allBookings.forEach(b => {
      const name = b.roomId?.roomName || 'Unknown';
      roomMap[name] = (roomMap[name] || 0) + 1;
    });
    const bookingsByRoom = Object.entries(roomMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Bookings by building
    const buildingMap = {};
    allBookings.forEach(b => {
      const building = b.roomId?.building || 'Unknown';
      buildingMap[building] = (buildingMap[building] || 0) + 1;
    });
    const bookingsByBuilding = Object.entries(buildingMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Peak hours
    const hourMap = {};
    allBookings.forEach(b => {
      if (b.startTime) {
        const hour = parseInt(b.startTime.split(':')[0]);
        const label = `${hour.toString().padStart(2, '0')}:00`;
        hourMap[label] = (hourMap[label] || 0) + 1;
      }
    });
    const peakHours = Object.entries(hourMap)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    // Total rooms
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ available: true });

    res.json({
      bookingsByStatus,
      bookingsPerDay,
      bookingsByRoom,
      bookingsByBuilding,
      peakHours,
      totalBookings: allBookings.length,
      totalRooms,
      availableRooms
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const { GoogleGenerativeAI } = require("@google/generative-ai");

const getAIInsights = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "GEMINI_API_KEY is not configured" });
    }

    const allBookings = await Booking.find().populate("roomId");
    
    // Basic aggregation
    const roomMap = {};
    allBookings.forEach(b => {
      const name = b.roomId?.roomName || 'Unknown';
      roomMap[name] = (roomMap[name] || 0) + 1;
    });
    
    const statusMap = {
      approved: allBookings.filter(b => b.status === 'approved').length,
      pending: allBookings.filter(b => b.status === 'pending').length,
      rejected: allBookings.filter(b => b.status === 'rejected').length
    };

    const hourMap = {};
    allBookings.forEach(b => {
      if (b.startTime) {
        const hour = parseInt(b.startTime.split(':')[0]);
        hourMap[hour] = (hourMap[hour] || 0) + 1;
      }
    });

    const analyticsData = {
      totalBookings: allBookings.length,
      bookingsByRoom: roomMap,
      bookingsByStatus: statusMap,
      peakHours: hourMap
    };

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `You are an expert data analyst for a campus booking system.
Here is the raw booking data for our campus facilities:
${JSON.stringify(analyticsData)}

Please write exactly 3 short, actionable, and intelligent bullet points summarizing this data for the campus administrator. 
Focus on interesting trends (e.g., most popular rooms, peak hours, approval rates).
Do not use markdown bolding or asterisks. Return ONLY a JSON array of 3 strings.
Example: ["The Seminar Hall is the most popular room with 15 bookings.", "Most bookings happen around 10 AM.", "You have a high number of pending requests."]
`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    if (responseText.startsWith('\`\`\`json')) {
      responseText = responseText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    }
    
    let insights = [];
    try {
      insights = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse AI insights:", responseText);
      insights = ["AI insights are temporarily unavailable."];
    }

    res.json({ insights });
  } catch (error) {
    console.error("AI Insights Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics, getAIInsights };
