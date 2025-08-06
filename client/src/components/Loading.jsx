import React from 'react';

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '4px solid #f3f3f3',
  borderTop: '4px solid #17C4C4',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  gap: '8px'
};

const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

const Loading = () => {
  return (
    <div style={containerStyle}>
      <style>{keyframes}</style>
      <div style={spinnerStyle}></div>
      <p>Loading...</p>
    </div>
  );
};

export default Loading;