import React, { useState, useEffect } from 'react';
import { useAuth, useToast } from '../App';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { DoorOpen, Users, MapPin, X } from 'lucide-react';
import { format } from 'date-fns';

const getRoomImage = (room) => {
  if (room.imageUrl) return room.imageUrl;
  
  const b = room.building?.toLowerCase() || '';
  if (b.includes('nlhc')) return '/images/nlhc.png';
  if (b.includes('nac')) return '/images/nac.png';
  if (b.includes('cse') || b.includes('computer')) return '/images/cse.png';
  
  return '/images/nlhc.png';
};

const getRoomTimeOptions = (roomName) => {
  const isLibrary = roomName?.toLowerCase().includes('library');
  const startHour = isLibrary ? 0 : 5; 
  const endHour = isLibrary ? 24 : 22; 
  
  const options = [];
  for (let i = startHour; i <= endHour; i++) {
    if (i === 24) {
      options.push('23:59');
      break;
    }
    const hour = i.toString().padStart(2, '0');
    options.push(`${hour}:00`);
    if (i !== endHour) {
      options.push(`${hour}:30`);
    }
  }
  return options;
};

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Booking Form State
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/rooms", { cache: "no-store" });
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      showToast("Failed to fetch rooms", "error");
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!startTime || !endTime) {
      showToast("Please select start and end times", "error");
      return;
    }

    if (startTime >= endTime) {
      showToast("End time must be after start time", "error");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/bookings/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          roomId: selectedRoom._id,
          date: format(date, 'yyyy-MM-dd'),
          startTime,
          endTime,
          purpose: purpose || 'General Use'
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message, "success");
        setSelectedRoom(null);
        setStartTime('');
        setEndTime('');
        setPurpose('');
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast("Error booking room", "error");
    }
  };

  const handleStartTimeChange = (e) => {
    const newStart = e.target.value;
    setStartTime(newStart);
    if (endTime && newStart >= endTime) {
      setEndTime('');
    }
  };

  const allTimeOptions = selectedRoom ? getRoomTimeOptions(selectedRoom.roomName) : [];
  const startOptions = allTimeOptions.slice(0, -1);
  const endOptions = startTime ? allTimeOptions.filter(t => t > startTime) : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Available Rooms</h1>
          <p style={{ color: 'var(--text-muted)' }}>Select a room to check availability and book.</p>
        </div>
      </div>

      <div className="grid-cards">
        {rooms.map(room => (
          <div key={room._id} className="card glass" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '180px', width: '100%', position: 'relative' }}>
              <img 
                src={getRoomImage(room)} 
                alt={room.roomName} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <span className={`status-badge ${room.available ? 'status-approved' : 'status-rejected'}`} style={{ position: 'absolute', top: '12px', right: '12px', backdropFilter: 'blur(4px)' }}>
                {room.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{room.roomName}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <MapPin size={14} />
                  {room.building} - Floor {room.floor}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={16} />
                  Capacity: {room.capacity}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DoorOpen size={16} />
                  {room.type}
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%' }}
                  disabled={!room.available}
                  onClick={() => setSelectedRoom(room)}
                >
                  Book Room
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedRoom && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '800px', padding: '32px', position: 'relative', display: 'flex', gap: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setSelectedRoom(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <div style={{ flex: 1 }}>
              <h2 style={{ marginBottom: '8px' }}>Book {selectedRoom.roomName}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Select a date to view availability and request booking.</p>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                <Calendar 
                  onChange={setDate} 
                  value={date} 
                  minDate={new Date()}
                />
              </div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <form onSubmit={handleBook}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Selected Date</label>
                  <div style={{ padding: '12px 16px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                    {format(date, 'MMMM d, yyyy')}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Start Time</label>
                    <select required value={startTime} onChange={handleStartTimeChange}>
                      <option value="">Select Time</option>
                      {startOptions.map(t => <option key={`start-${t}`} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>End Time</label>
                    <select required value={endTime} onChange={e => setEndTime(e.target.value)} disabled={!startTime}>
                      <option value="">Select Time</option>
                      {endOptions.map(t => <option key={`end-${t}`} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Purpose of Booking</label>
                  <input type="text" placeholder="e.g. Study group, Project meeting" value={purpose} onChange={e => setPurpose(e.target.value)} required />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                  Submit Booking Request
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rooms;
