import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, School, ShieldCheck } from 'lucide-react';

function CheckIn() {
  const { token } = useParams();
  const [status, setStatus] = useState(token ? 'loading' : 'idle');
  const [message, setMessage] = useState('');
  const [bookingInfo, setBookingInfo] = useState(null);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (token) {
      performCheckInToken();
    }
  }, [token]);

  const performCheckInToken = async () => {
    try {
      const res = await fetch(`https://campus-booking-system-1-nqej.onrender.com/api/bookings/checkin/${token}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        setBookingInfo(data.booking);
      } else {
        setStatus('error');
        setMessage(data.message);
      }
    } catch (err) {
      setStatus('error');
      setMessage('Failed to check in. Please try again.');
    }
  };

  const performCheckInOTP = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setStatus('loading');
    try {
      const res = await fetch(`https://campus-booking-system-1-nqej.onrender.com/api/bookings/checkin-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        setBookingInfo(data.booking);
      } else {
        setStatus('error');
        setMessage(data.message);
      }
    } catch (err) {
      setStatus('error');
      setMessage('Failed to check in via OTP. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main, #0f172a)', padding: '20px' }}>
      <div style={{ background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '40px', textAlign: 'center', maxWidth: '450px', width: '100%' }}>
        <School size={40} style={{ color: '#6366f1', marginBottom: '16px' }} />
        <h1 style={{ color: 'white', marginBottom: '8px' }}>CampusBook</h1>
        
        {status === 'idle' && (
          <div>
            <h2 style={{ color: '#e2e8f0', marginBottom: '12px' }}>Manual Check-In</h2>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Enter the 6-digit OTP sent to your email</p>
            <form onSubmit={performCheckInOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input 
                type="text" 
                placeholder="000000" 
                value={otp} 
                onChange={e => setOtp(e.target.value)}
                maxLength={6}
                style={{ 
                  padding: '16px', 
                  fontSize: '24px', 
                  letterSpacing: '8px', 
                  textAlign: 'center', 
                  borderRadius: '12px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid #475569',
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
              <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '16px', justifyContent: 'center' }}>
                <ShieldCheck size={20} />
                Verify & Check-In
              </button>
            </form>
          </div>
        )}

        {status === 'loading' && (
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Verifying check-in...</p>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle size={64} style={{ color: '#10b981', margin: '20px auto' }} />
            <h2 style={{ color: '#10b981', marginBottom: '12px' }}>Check-in Successful!</h2>
            <p style={{ color: '#94a3b8' }}>{message}</p>
            {bookingInfo && (
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', textAlign: 'left' }}>
                <p style={{ color: 'white', margin: '4px 0' }}><strong>Room:</strong> {bookingInfo.roomId?.roomName}</p>
                <p style={{ color: 'white', margin: '4px 0' }}><strong>Date:</strong> {bookingInfo.date}</p>
                <p style={{ color: 'white', margin: '4px 0' }}><strong>Time:</strong> {bookingInfo.startTime} - {bookingInfo.endTime}</p>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div>
            <XCircle size={64} style={{ color: '#ef4444', margin: '20px auto' }} />
            <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>Check-in Failed</h2>
            <p style={{ color: '#94a3b8' }}>{message}</p>
            <button onClick={() => setStatus('idle')} className="btn-secondary" style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckIn;
