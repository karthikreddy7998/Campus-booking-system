import React, { useState, useEffect } from 'react';
import { useAuth, useToast } from '../App';
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock, Check, X } from 'lucide-react';

function AdminDashboard() {
  const [allBookings, setAllBookings] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [filter, setFilter] = useState('all');
  const { showToast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/bookings", { cache: "no-store" });
      const data = await res.json();
      setAllBookings(data);
      
      setStats({
        pending: data.filter(b => b.status === 'pending').length,
        approved: data.filter(b => b.status === 'approved').length,
        rejected: data.filter(b => b.status === 'rejected' || b.status === 'cancelled').length
      });
    } catch (err) {
      showToast("Failed to fetch bookings", "error");
    }
  };

  const handleStatus = async (id, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${action}/${id}`, { method: "PUT" });
      if (res.ok) {
        showToast(`Booking ${action}ed successfully`, "success");
        fetchBookings();
      }
    } catch (err) {
      showToast("Action failed", "error");
    }
  };

  const displayedBookings = allBookings.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'rejected') return b.status === 'rejected' || b.status === 'cancelled';
    return b.status === filter;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage booking requests and monitor usage.</p>
        </div>
      </div>

      <div className="grid-cards" style={{ marginBottom: '2rem' }}>
        <div 
          className="card glass" 
          onClick={() => setFilter(filter === 'pending' ? 'all' : 'pending')}
          style={{ cursor: 'pointer', border: filter === 'pending' ? '1px solid #f59e0b' : '1px solid var(--border)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '12px', borderRadius: '12px', color: '#f59e0b' }}>
              <Clock size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '24px' }}>{stats.pending}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Pending Requests</p>
            </div>
          </div>
        </div>

        <div 
          className="card glass"
          onClick={() => setFilter(filter === 'approved' ? 'all' : 'approved')}
          style={{ cursor: 'pointer', border: filter === 'approved' ? '1px solid #10b981' : '1px solid var(--border)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '12px', color: '#10b981' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '24px' }}>{stats.approved}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Approved Bookings</p>
            </div>
          </div>
        </div>
        
        <div 
          className="card glass"
          onClick={() => setFilter(filter === 'rejected' ? 'all' : 'rejected')}
          style={{ cursor: 'pointer', border: filter === 'rejected' ? '1px solid #ef4444' : '1px solid var(--border)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '12px', color: '#ef4444' }}>
              <XCircle size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '24px' }}>{stats.rejected}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Rejected / Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>
          {filter === 'all' ? 'All Requests' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Requests`}
        </h2>
        {filter !== 'all' && (
          <button className="btn-secondary" onClick={() => setFilter('all')} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
            Clear Filter
          </button>
        )}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {displayedBookings.length === 0 ? (
          <div className="glass" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No {filter !== 'all' ? filter : ''} requests found.
          </div>
        ) : displayedBookings.map(booking => (
          <div key={booking._id} className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h3 style={{ margin: 0 }}>{booking.roomId?.roomName || 'Unknown Room'}</h3>
                <span className={`status-badge status-${booking.status}`}>
                  {booking.status}
                </span>
              </div>
              <p style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontWeight: 500 }}>
                Requested by: {booking.userId?.name} ({booking.userId?.email})
              </p>
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
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}><strong>Purpose:</strong> {booking.purpose}</p>
            </div>

            {booking.status === 'pending' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-success" onClick={() => handleStatus(booking._id, 'approve')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} />
                  Approve
                </button>
                <button className="btn-danger" onClick={() => handleStatus(booking._id, 'reject')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <X size={16} />
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
