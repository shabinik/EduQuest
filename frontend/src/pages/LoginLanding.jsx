// src/pages/LoginLanding.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginLanding() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f3f4f6' }}>
      <div style={{ width: 720, background: 'white', padding: 32, borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,0.08)' }}>
        <h1 style={{ marginBottom: 8 }}>Welcome to EduQuest</h1>
        <p style={{ color: '#555', marginBottom: 24 }}>Choose how you'd like to sign in</p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/student/login')} style={cardStyle}>Student</button>
          <button onClick={() => navigate('/teacher/login')} style={cardStyle}>Teacher</button>
          <button onClick={() => navigate('/admin/login')} style={cardStyle}>School Admin</button>
          <button onClick={() => navigate('superadmin/login')}  style={cardStyle}>Super Admin</button>
        </div>

        <div style={{ marginTop: 18, color: '#666', fontSize: 14 }}>
          If you belong to a school, use the School Admin link. Teachers & students — choose your role above.
        </div>
        
      </div>
    </div>
  );
}

const cardStyle = {
  flex: 1,
  padding: '18px 12px',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  background: 'white',
  cursor: 'pointer',
  fontSize: 16,
};
