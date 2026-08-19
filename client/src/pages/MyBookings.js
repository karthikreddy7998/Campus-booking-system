import React, { useState, useEffect } from 'react';
import { useAuth, useToast } from '../App';
import { Calendar as CalendarIcon, Clock, Edit2, XCircle, X } from 'lucide-react';
import Calendar from 'react-calendar';
import { format, parseISO } from 'date-fns';

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

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  
  // Edit Form State
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');

  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/bookings");
      const data = await res.json();
      const myBookings = data.filter(b => b.userId && b.userId._id === user._id);
      setBookings(myBookings);
    } catch (err) {
      showToast("Failed to fetch bookings", "error");
    }
  };

  const confirmCancel = async () => {
    if (!cancellingId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/cancel/${cancellingId}`, { method: "PUT" });
      if (res.ok) {
        showToast("Booking cancelled", "success");
        setCancellingId(null);
        fetchBookings();
      }
    } catch (err) {
      showToast("Error cancelling booking", "error");
      setCancellingId(null);
    }
  };

  const startEdit = (booking) => {
    setEditingBooking(booking);
    setDate(booking.date ? parseISO(booking.date) : new Date());
    setStartTime(booking.startTime);
    setEndTime(booking.endTime);
    setPurpose(booking.purpose);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (startTime >= endTime) {
      showToast("End time must be after start time", "error");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/update/${editingBooking._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: format(date, 'yyyy-MM-dd'),
          startTime,
          endTime,
          purpose
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Booking updated successfully", "success");
        setEditingBooking(null);
        fetchBookings();
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast("Error updating booking", "error");
    }
  };

  const handleStartTimeChange = (e) => {
    const newStart = e.target.value;
    setStartTime(newStart);
    if (endTime && newStart >= endTime) {
      setEndTime('');
    }
  };

  const allTimeOptions = editingBooking ? getRoomTimeOptions(editingBooking.roomId?.roomName) : [];
  const startOptions = allTimeOptions.slice(0, -1);
  const endOptions = startTime ? allTimeOptions.filter(t => t > startTime) : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Bookings</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your room reservation requests.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {bookings.length === 0 ? (
          <div className="glass" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CalendarIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No Bookings Found</h3>
            <p>You haven't requested any rooms yet.</p>
          </div>
        ) : bookings.map(booking => (
          <div key={booking._id} className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h3 style={{ margin: 0 }}>{booking.roomId?.roomName || 'Unknown Room'}</h3>
                <span className={`status-badge status-${booking.status}`}>
                  {booking.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CalendarIcon size={16} />
                  {booking.date}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} />
                  {booking.startTime} - {booking.endTime}
                </div>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}><strong>Purpose:</strong> {booking.purpose}</p>
            </div>

            {booking.status === 'pending' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" onClick={() => startEdit(booking)} style={{ padding: '8px 12px' }}>
                  <Edit2 size={16} />
                  Modify
                </button>
                <button className="btn-danger" onClick={() => setCancellingId(booking._id)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <XCircle size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '800px', padding: '32px', position: 'relative', display: 'flex', gap: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setEditingBooking(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <div style={{ flex: 1 }}>
              <h2 style={{ marginBottom: '8px' }}>Modify Booking</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Change the details for your request.</p>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                <Calendar 
                  onChange={setDate} 
                  value={date} 
                  minDate={new Date()}
                />
              </div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <form onSubmit={handleUpdate}>
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
                  <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} required />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                  Update Request
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '16px' }}>Cancel Booking</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Are you sure you want to cancel this booking request? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setCancellingId(null)} style={{ flex: 1 }}>
                Keep It
              </button>
              <button className="btn-danger" onClick={confirmCancel} style={{ flex: 1 }}>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;
