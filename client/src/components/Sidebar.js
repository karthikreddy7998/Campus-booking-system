import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Calendar, LayoutDashboard, DoorOpen, LogOut, ClipboardList, School, BarChart3, CalendarDays, Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';

function Sidebar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  const closeSidebar = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Header (Visible only on small screens) */}
      <div className="mobile-header glass" style={{ justifyContent: 'flex-start', gap: '20px' }}>
        <button className="hamburger-btn" onClick={() => setMobileOpen(true)}>
          <Menu size={28} color="white" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: 'white', fontSize: '1.2rem' }}>
          <School className="icon" size={24} color="var(--primary)" />
          CampusBook
        </div>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      <div className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <School className="icon" size={28} />
          CampusBook
          <button className="close-btn" onClick={closeSidebar}>
            <X size={24} color="var(--text-muted)" />
          </button>
        </div>

        <nav className="nav-links">
          {user.role === 'admin' ? (
            <>
              <NavLink to="/" end onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={20} />
                Dashboard
              </NavLink>
              <NavLink to="/rooms" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <DoorOpen size={20} />
                Manage Rooms
              </NavLink>
              <NavLink to="/analytics" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <BarChart3 size={20} />
                Analytics
              </NavLink>
              <NavLink to="/calendar" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <CalendarDays size={20} />
                Calendar
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={20} />
                Dashboard
              </NavLink>
              <NavLink to="/rooms" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <DoorOpen size={20} />
                Book a Room
              </NavLink>
              <NavLink to="/my-bookings" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Calendar size={20} />
                My Bookings
              </NavLink>
              <NavLink to="/calendar" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <CalendarDays size={20} />
                Calendar
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <NotificationBell />
          <div style={{ height: '12px' }} />
          <div className="user-info">
            <div className="avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {user.role === 'admin' ? 'Administrator' : 'Student/Staff'}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
