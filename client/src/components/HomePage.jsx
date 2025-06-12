import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate('/getname'); // Adjust route as needed
  };

  const handleAdminLoginClick = () => {
    navigate('/login');
  };

  return (
    <div
      style={{
        height: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Center vertically
        alignItems: 'center',
        padding: '2rem 1rem',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ margin: 0 }}>Welcome to GoChangi!</h1>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p style={{ marginBottom: '1rem' }}>Discover Changi, One Clue at a Time!</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button
            onClick={handlePlayClick}
            style={{
              padding: '1rem 2rem',
              fontSize: '1rem',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Play
          </button>
          <button
            onClick={handleAdminLoginClick}
            style={{
              padding: '1rem 2rem',
              fontSize: '1rem',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
