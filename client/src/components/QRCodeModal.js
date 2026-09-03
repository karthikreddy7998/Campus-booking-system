import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download } from 'lucide-react';

function QRCodeModal({ booking, onClose }) {
  if (!booking || !booking.qrCode) return null;

  const checkInUrl = `${window.location.origin}/checkin/${booking.qrCode}`;

  const handleDownload = () => {
    const svg = document.getElementById('booking-qr-code');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = `booking-qr-${booking._id}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '32px', textAlign: 'center', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '8px' }}>Booking QR Code</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
          Show this QR code at the venue to check in
        </p>

        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', display: 'inline-block', marginBottom: '20px' }}>
          <QRCodeSVG
            id="booking-qr-code"
            value={checkInUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <div style={{ textAlign: 'left', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', marginBottom: '20px' }}>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Room:</strong> {booking.roomId?.roomName}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Date:</strong> {booking.date}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
        </div>

        <button onClick={handleDownload} className="btn-primary" style={{ width: '100%' }}>
          <Download size={16} />
          Download QR Code
        </button>
      </div>
    </div>
  );
}

export default QRCodeModal;
