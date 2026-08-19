import React, { useState, useEffect } from 'react';
import { useToast } from '../App';
import { DoorOpen, Edit2, Trash2, Plus, X, MapPin, Users } from 'lucide-react';

const getRoomImage = (room) => {
  if (room.imageUrl) return room.imageUrl;
  
  const b = room.building?.toLowerCase() || '';
  if (b.includes('nlhc')) return '/images/nlhc.png';
  if (b.includes('nac')) return '/images/nac.png';
  if (b.includes('cse') || b.includes('computer')) return '/images/cse.png';
  
  return '/images/nlhc.png';
};

function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    roomName: '',
    building: '',
    floor: 1,
    capacity: 30,
    type: 'classroom',
    available: true,
    imageUrl: ''
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/rooms", { cache: "no-store" });
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      showToast("Failed to fetch rooms", "error");
    }
  };

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        roomName: room.roomName,
        building: room.building,
        floor: room.floor,
        capacity: room.capacity,
        type: room.type,
        available: room.available,
        imageUrl: room.imageUrl || ''
      });
    } else {
      setEditingRoom(null);
      setFormData({
        roomName: '',
        building: '',
        floor: 1,
        capacity: 30,
        type: 'classroom',
        available: true,
        imageUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingRoom 
      ? `http://localhost:5000/api/rooms/${editingRoom._id}`
      : "http://localhost:5000/api/rooms/add";
    const method = editingRoom ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showToast(editingRoom ? "Room updated successfully" : "Room added successfully", "success");
        setIsModalOpen(false);
        fetchRooms();
      }
    } catch (err) {
      showToast("Error saving room", "error");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Room deleted", "success");
        fetchRooms();
      }
    } catch (err) {
      showToast("Error deleting room", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Manage Rooms</h1>
          <p style={{ color: 'var(--text-muted)' }}>Add, update, or remove campus facilities.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Add New Room
        </button>
      </div>

      <div className="grid-cards">
        {rooms.map(room => (
          <div key={room._id} className="card glass" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '160px', width: '100%', position: 'relative' }}>
              <img 
                src={getRoomImage(room)} 
                alt={room.roomName} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <span className={`status-badge ${room.available ? 'status-approved' : 'status-rejected'}`} style={{ position: 'absolute', top: '12px', right: '12px', backdropFilter: 'blur(4px)' }}>
                {room.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{room.roomName}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <MapPin size={14} />
                  {room.building} - Floor {room.floor}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={16} />
                  Capacity: {room.capacity}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DoorOpen size={16} />
                  {room.type}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                <button className="btn-secondary" onClick={() => handleOpenModal(room)} style={{ flex: 1, padding: '8px', justifyContent: 'center' }}>
                  <Edit2 size={16} />
                  Edit
                </button>
                <button className="btn-danger" onClick={() => handleDelete(room._id)} style={{ padding: '8px' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ marginBottom: '24px' }}>{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Room Name (e.g. 101A)</label>
                <input type="text" name="roomName" required value={formData.roomName} onChange={handleChange} />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Building</label>
                  <input type="text" name="building" required value={formData.building} onChange={handleChange} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Floor</label>
                  <input type="number" name="floor" required value={formData.floor} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Capacity</label>
                  <input type="number" name="capacity" required value={formData.capacity} onChange={handleChange} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Type</label>
                  <select name="type" value={formData.type} onChange={handleChange}>
                    <option value="classroom">Classroom</option>
                    <option value="seminar hall">Seminar Hall</option>
                    <option value="meeting room">Meeting Room</option>
                    <option value="lab">Lab</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Image URL (Optional)</label>
                <input type="text" name="imageUrl" placeholder="Leave blank to use default building image" value={formData.imageUrl} onChange={handleChange} />
              </div>

              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  name="available" 
                  id="available" 
                  checked={formData.available} 
                  onChange={handleChange} 
                  style={{ width: 'auto', margin: 0 }}
                />
                <label htmlFor="available" style={{ margin: 0, color: 'var(--text-main)', cursor: 'pointer' }}>Is Available for Booking?</label>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                {editingRoom ? 'Update Room' : 'Add Room'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRooms;
