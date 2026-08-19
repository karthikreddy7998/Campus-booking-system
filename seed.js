const mongoose = require('mongoose');
const Room = require('./models/Room');
require('dotenv').config();

const seedRooms = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing rooms
    await Room.deleteMany({});
    console.log('Cleared existing rooms');

    const rooms = [];

    // 16 NLHC Rooms
    for (let i = 1; i <= 16; i++) {
      rooms.push({
        roomName: `NLHC ${i}`,
        building: 'NLHC',
        floor: Math.ceil(i / 4), // Distributed across 4 floors
        capacity: 100,
        type: 'classroom',
        available: true,
        imageUrl: '/images/nlhc.png'
      });
    }

    // NAC Rooms
    rooms.push({
      roomName: 'Main Auditorium',
      building: 'NAC',
      floor: 1,
      capacity: 500,
      type: 'auditorium',
      available: true,
      imageUrl: '/images/nac.png'
    });

    for (let i = 1; i <= 5; i++) {
      rooms.push({
        roomName: `NAC Class ${i}`,
        building: 'NAC',
        floor: 2,
        capacity: 60,
        type: 'classroom',
        available: true,
        imageUrl: '/images/nac.png'
      });
    }

    // CSE Department
    rooms.push({
      roomName: 'Programming Lab 1',
      building: 'CSE Dept',
      floor: 1,
      capacity: 50,
      type: 'lab',
      available: true,
      imageUrl: '/images/cse.png'
    });
    
    rooms.push({
      roomName: 'Seminar Hall',
      building: 'CSE Dept',
      floor: 2,
      capacity: 120,
      type: 'seminar hall',
      available: true,
      imageUrl: '/images/cse.png'
    });

    await Room.insertMany(rooms);
    console.log(`Successfully seeded ${rooms.length} rooms`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedRooms();
