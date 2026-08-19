import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import AdminRooms from './pages/AdminRooms';
import './App.css';

export const AuthContext = createContext();
export const ToastContext = createContext();

export function useAuth() { return useContext(AuthContext); }
export function useToast() { return useContext(ToastContext); }

function App() {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <ToastContext.Provider value={{ showToast }}>
        <Router>
          {toast && (
            <div 
              className="glass"
              style={{ 
                position: 'fixed', 
                top: '40px', 
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                padding: '16px 32px',
                background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
                border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#6ee7b7'}`,
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '12px'
              }}
            >
              <div style={{ fontWeight: 700, color: 'white', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                {toast.type === 'error' ? '⚠️ Error: ' : '✅ Success: '}
                {toast.message}
              </div>
            </div>
          )}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={
              user ? (
                <div className="app-container">
                  <Sidebar />
                  <main className="main-content">
                    <Routes>
                      {user.role === 'admin' ? (
                        <>
                          <Route path="/" element={<AdminDashboard />} />
                          <Route path="/rooms" element={<AdminRooms />} />
                        </>
                      ) : (
                        <>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/rooms" element={<Rooms />} />
                          <Route path="/my-bookings" element={<MyBookings />} />
                        </>
                      )}
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                </div>
              ) : <Navigate to="/login" />
            } />
          </Routes>
        </Router>
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
