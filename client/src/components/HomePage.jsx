import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate('/getname'); // Adjust route as needed
  };

  return (
    <div
      style={{height: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2rem 1rem',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ margin: 0 }}>Welcome to GoChangi!</h1>

      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '1rem' }}>Discover Changi, One Clue at a Time!</p>
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
      </div>
    </div>
  );
};

export default HomePage;
