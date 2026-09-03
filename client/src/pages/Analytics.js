import React, { useState, useEffect } from 'react';
import { useToast } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, TrendingUp, Users, Clock, Sparkles } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#94a3b8'];
const API_BASE = 'http://localhost:5000';

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // AI State
  const [aiInsights, setAiInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  
  const { showToast } = useToast();

  useEffect(() => {
    fetchAnalytics();
    fetchAIInsights();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/analytics`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      showToast('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAIInsights = async () => {
    setInsightsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/analytics/ai-insights`);
      const result = await res.json();
      if (res.ok) {
        setAiInsights(result.insights);
      }
    } catch (err) {
      console.error("AI Insights error:", err);
    } finally {
      setInsightsLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading analytics...</p>
      </div>
    );
  }

  const statusData = [
    { name: 'Approved', value: data.bookingsByStatus.approved },
    { name: 'Pending', value: data.bookingsByStatus.pending },
    { name: 'Rejected', value: data.bookingsByStatus.rejected },
    { name: 'Cancelled', value: data.bookingsByStatus.cancelled }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px' }}>
          <p style={{ color: 'var(--text-main)', fontWeight: 600, margin: 0 }}>{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color || 'var(--text-muted)', margin: '4px 0 0', fontSize: '13px' }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Analytics</h1>
          <p style={{ color: 'var(--text-muted)' }}>Booking statistics and usage insights.</p>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="glass" style={{ marginBottom: '2rem', padding: '24px', borderRadius: '12px', border: '1px solid #6366f1', background: 'rgba(99, 102, 241, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Sparkles size={24} color="#6366f1" />
          <h3 style={{ margin: 0, color: '#a5b4fc' }}>AI Executive Summary</h3>
          <button 
            onClick={fetchAIInsights} 
            disabled={insightsLoading}
            className="btn-secondary" 
            style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
          >
            {insightsLoading ? 'Analyzing...' : 'Refresh AI'}
          </button>
        </div>
        
        {insightsLoading ? (
          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            Generating intelligent insights from your campus data...
          </div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '24px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {aiInsights.map((insight, idx) => (
              <li key={idx} style={{ lineHeight: '1.5' }}>{insight}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid-cards" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total Bookings', value: data.totalBookings, icon: <BarChart3 size={24} />, color: '#6366f1' },
          { label: 'Approved', value: data.bookingsByStatus.approved, icon: <TrendingUp size={24} />, color: '#10b981' },
          { label: 'Pending', value: data.bookingsByStatus.pending, icon: <Clock size={24} />, color: '#f59e0b' },
          { label: 'Total Rooms', value: data.totalRooms, icon: <Users size={24} />, color: '#8b5cf6' }
        ].map((stat, i) => (
          <div key={i} className="card glass">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: `${stat.color}22`, padding: '12px', borderRadius: '12px', color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '24px' }}>{stat.value}</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Bookings Per Day */}
        <div className="glass" style={{ padding: '24px', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '16px' }}>Bookings Per Day</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.bookingsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Bookings" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings by Status */}
        <div className="glass" style={{ padding: '24px', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '16px' }}>Bookings by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Booked Rooms */}
        <div className="glass" style={{ padding: '24px', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '16px' }}>Most Booked Rooms</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.bookingsByRoom} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" tick={{ fill: '#94a3b8' }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Bookings" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hours */}
        <div className="glass" style={{ padding: '24px', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '16px' }}>Peak Booking Hours</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Bookings" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
