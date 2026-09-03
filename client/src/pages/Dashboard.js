import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { Calendar as CalendarIcon, Clock, DoorOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ upcoming: 0, pending: 0 });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/bookings");
        const data = await res.json();
        const myBookings = data.filter(b => b.userId && b.userId._id === user._id);
        
        setStats({
          upcoming: myBookings.filter(b => b.status === 'approved').length,
          pending: myBookings.filter(b => b.status === 'pending').length
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchBookings();
  }, [user._id]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome, {user.name.split(' ')[0]}!</h1>
          <p style={{ color: 'var(--text-muted)' }}>Here's an overview of your campus bookings.</p>
        </div>
      </div>

      <div className="grid-cards" style={{ marginBottom: '2rem' }}>
        <div className="card glass">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '12px', color: '#10b981' }}>
              <CalendarIcon size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '24px' }}>{stats.upcoming}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Approved Upcoming Bookings</p>
            </div>
          </div>
        </div>

        <div className="card glass">
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
      </div>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius)' }}>
        <h3 style={{ marginBottom: '16px' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/rooms" className="btn-primary" style={{ textDecoration: 'none' }}>
            <DoorOpen size={18} />
            Book a New Room
          </Link>
          <Link to="/my-bookings" className="btn-secondary" style={{ textDecoration: 'none' }}>
            <CalendarIcon size={18} />
            View My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
