const Room = require("../models/Room");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// AI Room Search
const aiSearchRooms = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: "Query is required" });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: "GEMINI_API_KEY is not configured" });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const allRooms = await Room.find({ available: true });

    const prompt = `You are a helpful campus booking assistant.
Here is the JSON list of all available rooms on our campus:
${JSON.stringify(allRooms)}

The user is asking: "${query}"

Analyze the user's request and match it against the available rooms. 
Return ONLY a JSON array of objects representing the best matches, ranked from best to worst.
Each object must have:
- "id": the _id of the room
- "reason": a short, friendly explanation of why this room is a good fit.

If no rooms fit the criteria, return an empty array [].
Respond purely with the JSON array. Do NOT include markdown code blocks like \`\`\`json.`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    if (responseText.startsWith('\`\`\`json')) {
      responseText = responseText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    }
    
    let aiMatches = [];
    try {
      aiMatches = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      return res.status(500).json({ message: "Failed to parse AI response" });
    }

    if (aiMatches.length === 0) {
      return res.json([]);
    }

    const matchedIds = aiMatches.map(m => m.id);
    const matchedRooms = await Room.find({ _id: { $in: matchedIds } });

    // Combine rooms with AI reasons
    const roomsWithReasons = matchedRooms.map(room => {
      const match = aiMatches.find(m => m.id === room._id.toString());
      return {
        ...room.toObject(),
        aiReason: match ? match.reason : ""
      };
    });

    // Sort in AI's recommended order
    roomsWithReasons.sort((a, b) => matchedIds.indexOf(a._id.toString()) - matchedIds.indexOf(b._id.toString()));

    res.json(roomsWithReasons);
  } catch (error) {
    console.error("AI Search Error:", error);
    res.status(500).json({ message: error.message });
  }
};
const addRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);

    res.status(201).json({
      message: "Room added successfully",
      room
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get All Rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({
      building: 1,
      roomName: 1
    });

    res.json(rooms);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update Room
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: "Room updated successfully",
      room
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Delete Room
const deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);

    res.json({
      message: "Room deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  addRoom,
  getRooms,
  updateRoom,
  deleteRoom,
  aiSearchRooms
};