import React from 'react';

export default function App() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>⚡ TaskFlow</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          Phase 1 — Backend Auth Ready. Full UI coming in Phase 4.
        </p>
        <p style={{ opacity: 0.7 }}>
          API running at{' '}
          <a href="http://localhost:5000/api/docs" style={{ color: '#ffd700' }}>
            localhost:5000/api/docs
          </a>
        </p>
      </div>
    </div>
  );
}
