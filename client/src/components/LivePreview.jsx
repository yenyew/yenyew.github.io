import React from 'react';
import './MainStyles.css'; // Import MainStyles.css to reuse styles

const LivePreview = ({ welcomeMessage, description, textColor, backgroundImage }) => {
  const bgSrc = backgroundImage || '/images/changihome.jpg';

  return (
    <div
      style={{
        width: 250,
        height: 500,
        borderRadius: 16,
        position: 'relative',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
      }}
      className="home-container" // Apply home-container class for consistency
    >
      {/* Background Image */}
      <img
        src={bgSrc}
        alt="Preview background"
        className="home-background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />
      {/* Overlay */}
      <div
        className="home-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
          zIndex: 1,
        }}
      />
      {/* Top Left Logo */}
      <div
        className="top-left-logo"
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 2,
        }}
      >
        <img
          src="/images/ces.jpg"
          alt="Changi Experience Studio"
          style={{ height: 30, width: 'auto' }} // Scaled down for preview size
        />
      </div>
      {/* Content */}
      <div
        className="home-content"
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '1rem',
          boxSizing: 'border-box',
        }}
      >
        <div className="title-block" style={{ marginTop: '2vh' }}>
          <h1
            style={{
              color: textColor,
              fontSize: 24, // Scaled down from 48px for smaller preview
              fontFamily: 'serif',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              textAlign: 'center',
            }}
          >
            {welcomeMessage}
          </h1>
          <p
            style={{
              color: textColor,
              fontSize: 12, // Scaled down from default
              marginTop: '6px',
              textAlign: 'center',
            }}
          >
            {description}
          </p>
        </div>
        <div
          className="description-block"
          style={{
            marginTop: 'auto',
            marginBottom: '5vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div className="home-buttons">
            <button
              style={{
                padding: '6px 16px', // Scaled down
                fontSize: 12, // Scaled down
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '999px',
                background: 'linear-gradient(to right, #c4ec1b, #00c4cc)',
                color: 'black',
                cursor: 'pointer',
                width: 100, // Scaled down from 200px
                marginBottom: 8,
              }}
            >
              Play
            </button>
            <button
              style={{
                padding: '6px 16px',
                fontSize: 12,
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '999px',
                background: 'linear-gradient(to right, #c4ec1b, #00c4cc)',
                color: 'black',
                cursor: 'pointer',
                width: 100,
              }}
            >
              Admin Login
            </button>
          </div>
          <div
            className="jewel-logo-wrapper"
            style={{
              position: 'absolute',
              bottom: 16,
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
          >
            <img
              src="/images/jewel.png"
              alt="Jewel Logo"
              style={{ width: 50, height: 'auto' }} // Scaled down from 100px
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;