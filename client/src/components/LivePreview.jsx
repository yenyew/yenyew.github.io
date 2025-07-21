import React from 'react';

const LivePreview = ({ welcomeMessage, description, textColor, backgroundImage }) => {
  const bgSrc = backgroundImage || '/images/changihome.jpg';
  return (
    <div style={{
      width: 250,
      height: 500,
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 2px 12px rgba(0,0,0,0.12)'
    }}>
      <img
        src={bgSrc}
        alt="Preview background"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          opacity: 0.7
        }}
      />
      <div style={{
        position: 'relative',
        zIndex: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h2 style={{ color: textColor, fontSize: 22, margin: '32px 0 12px 0', textAlign: 'center' }}>
          {welcomeMessage}
        </h2>
        <p style={{ color: textColor, fontSize: 15, marginBottom: 24, textAlign: 'center' }}>
          {description}
        </p>
        <button style={{
          background: '#17C4C4',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '8px 24px',
          marginBottom: 12,
          fontWeight: 'bold'
        }}>Play</button>
        <button style={{
          background: '#C4EB22',
          color: '#000',
          border: 'none',
          borderRadius: 8,
          padding: '8px 24px',
          fontWeight: 'bold'
        }}>Admin Login</button>
        <img
          src="/images/jewel.png"
          alt="Jewel Logo"
          style={{ width: 90, marginTop: 24 }}
        />
      </div>
    </div>
  );
};

export default LivePreview;