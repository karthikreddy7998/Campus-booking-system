import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { Bell, Check, CheckCheck } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user?._id) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/unread/${user._id}`);
      const data = await res.json();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Failed to fetch notification count');
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/${user._id}`);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) fetchNotifications();
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE}/api/notifications/read/${id}`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_BASE}/api/notifications/read-all/${user._id}`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'booking_approved': return '✅';
      case 'booking_rejected': return '❌';
      case 'new_booking': return '📋';
      case 'booking_cancelled': return '🚫';
      default: return '🔔';
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={handleOpen}
        style={{
          background: isOpen ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '10px',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          justifyContent: 'center'
        }}
      >
        <Bell size={18} />
        <span style={{ fontSize: '14px' }}>Notifications</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: 20,
            height: 20,
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          right: 0,
          marginBottom: '8px',
          background: 'rgba(15, 23, 42, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 1000,
          minWidth: '280px'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No notifications yet
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n._id}
                onClick={() => !n.read && markAsRead(n._id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: n.read ? 'default' : 'pointer',
                  background: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start'
                }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{getIcon(n.type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '13px', color: n.read ? 'var(--text-muted)' : 'var(--text-main)', lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                {!n.read && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', flexShrink: 0, marginTop: '4px' }} />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
