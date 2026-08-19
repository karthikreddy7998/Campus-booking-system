import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Calendar, LayoutDashboard, DoorOpen, LogOut, ClipboardList, School } from 'lucide-react';

function Sidebar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <School className="icon" size={28} />
        CampusBook
      </div>

      <nav className="nav-links">
        {user.role === 'admin' ? (
          <>
            <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>
            <NavLink to="/rooms" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <DoorOpen size={20} />
              Manage Rooms
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>
            <NavLink to="/rooms" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <DoorOpen size={20} />
              Book a Room
            </NavLink>
            <NavLink to="/my-bookings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Calendar size={20} />
              My Bookings
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
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
  );
}

export default Sidebar;
