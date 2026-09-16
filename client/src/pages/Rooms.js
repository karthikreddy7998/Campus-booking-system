import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, useToast } from '../App';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { DoorOpen, Users, MapPin, X, Search, Sparkles } from 'lucide-react';
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

// Custom Debounce Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // AI Search state
  const [aiQuery, setAiQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  
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
      const res = await fetch("https://campus-booking-system-1-nqej.onrender.com/api/rooms", { cache: "no-store" });
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      showToast("Failed to fetch rooms", "error");
    }
  };

  const handleAiSearch = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    
    setIsAiSearching(true);
    try {
      const res = await fetch("https://campus-booking-system-1-nqej.onrender.com/api/rooms/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiQuery })
      });
      const data = await res.json();
      if (res.ok) {
        setRooms(data);
        setIsAiMode(true);
        if (data.length > 0) {
          showToast(`AI found ${data.length} matches!`, "success");
        } else {
          showToast("AI couldn't find any rooms matching that description.", "error");
        }
      } else {
        showToast(data.message || "AI Search failed", "error");
      }
    } catch (err) {
      showToast("Failed to connect to AI service", "error");
    } finally {
      setIsAiSearching(false);
    }
  };

  const clearAiSearch = () => {
    setIsAiMode(false);
    setAiQuery('');
    fetchRooms();
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
      const res = await fetch("https://campus-booking-system-1-nqej.onrender.com/api/bookings/book", {
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

  const filteredRooms = rooms.filter(room => {
    const term = debouncedSearchTerm.toLowerCase();
    return (
      room.roomName.toLowerCase().includes(term) ||
      room.building.toLowerCase().includes(term) ||
      room.type.toLowerCase().includes(term) ||
      room.capacity.toString().includes(term)
    );
  });

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Available Rooms</h1>
          <p style={{ color: 'var(--text-muted)' }}>Select a room to check availability and book.</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <input 
            type="text" 
            placeholder="Search by name, building, capacity..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isAiMode}
            style={{ 
              width: '100%', 
              padding: '10px 16px 10px 40px', 
              borderRadius: '8px', 
              border: '1px solid var(--border)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'var(--text-main)',
              opacity: isAiMode ? 0.5 : 1
            }} 
          />
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* AI Search Bar */}
      <div className="glass" style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', border: '1px solid #6366f1', background: 'rgba(99, 102, 241, 0.05)' }}>
        <form onSubmit={handleAiSearch} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Sparkles size={24} color="#6366f1" />
          <input 
            type="text" 
            placeholder="✨ Ask AI: e.g., 'Find me a quiet room for 20 people with a projector'" 
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            style={{ 
              flex: 1, 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-main)',
              fontSize: '1rem',
              outline: 'none'
            }} 
          />
          {isAiMode && (
            <button type="button" onClick={clearAiSearch} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Clear AI Search
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={isAiSearching || !aiQuery.trim()} style={{ padding: '8px 20px' }}>
            {isAiSearching ? 'Thinking...' : 'AI Search'}
          </button>
        </form>
      </div>

      <div className="grid-cards">
        {filteredRooms.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <Search size={40} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No Rooms Found</h3>
            <p>Try adjusting your search filters.</p>
          </div>
        ) : filteredRooms.map(room => (
          <div key={room._id} className="card glass" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: room.aiReason ? '1px solid #6366f1' : '1px solid var(--border)' }}>
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
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={16} />
                  Capacity: {room.capacity}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DoorOpen size={16} />
                  {room.type}
                </div>
              </div>

              {room.aiReason && (
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', color: '#a5b4fc', borderLeft: '3px solid #6366f1' }}>
                  <strong>✨ AI Match:</strong> {room.aiReason}
                </div>
              )}

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
