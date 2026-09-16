import React, { useState, useEffect } from 'react';
import { useAuth, useToast } from '../App';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const API_BASE = 'https://campus-booking-system-1-nqej.onrender.com';

function BookingCalendar() {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings`);
      const data = await res.json();
      const filtered = user.role === 'admin'
        ? data
        : data.filter(b => b.userId && b.userId._id === user._id);
      setBookings(filtered);
    } catch (err) {
      showToast('Failed to load bookings', 'error');
    }
  };

  const getBookingsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter(b => {
      const bDate = b.date?.split('T')[0] || b.date;
      return bDate === dateStr;
    });
  };

  const selectedBookings = getBookingsForDate(selectedDate);

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const dayBookings = getBookingsForDate(date);
    if (dayBookings.length === 0) return null;

    const hasApproved = dayBookings.some(b => b.status === 'approved');
    const hasPending = dayBookings.some(b => b.status === 'pending');
    const hasRejected = dayBookings.some(b => b.status === 'rejected');

    return (
      <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginTop: '2px' }}>
        {hasApproved && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />}
        {hasPending && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />}
        {hasRejected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />}
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      case 'cancelled': return '#94a3b8';
      default: return '#94a3b8';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Booking Calendar</h1>
          <p style={{ color: 'var(--text-muted)' }}>View your bookings on a calendar.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Calendar */}
        <div className="glass" style={{ padding: '24px', borderRadius: '12px', flex: '1 1 320px', maxWidth: '400px' }}>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Approved
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} /> Pending
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> Rejected
            </div>
          </div>
        </div>

        {/* Day Details */}
        <div style={{ flex: '2 1 350px', minWidth: '300px' }}>
          <h2 style={{ marginBottom: '16px' }}>
            <CalendarIcon size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {format(selectedDate, 'MMMM d, yyyy')}
          </h2>

          {selectedBookings.length === 0 ? (
            <div className="glass" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '12px' }}>
              <CalendarIcon size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>No bookings on this date</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedBookings.map(booking => (
                <div key={booking._id} className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0 }}>{booking.roomId?.roomName || 'Unknown Room'}</h3>
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} />
                        {booking.startTime} - {booking.endTime}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} />
                        {booking.roomId?.building || 'N/A'}
                      </div>
                    </div>
                    {user.role === 'admin' && booking.userId && (
                      <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Booked by: {booking.userId.name}
                      </p>
                    )}
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
                      <strong>Purpose:</strong> {booking.purpose}
                    </p>
                  </div>
                  <div style={{ width: 4, height: '100%', minHeight: 60, borderRadius: 4, background: getStatusColor(booking.status) }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingCalendar;
