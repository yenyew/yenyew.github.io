import { useMediaQuery } from 'react-responsive';

const MobileOnly = ({ children }) => {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });

  if (!isMobile) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>🚫 Mobile Only</h2>
        <p>This game is optimized for mobile devices.</p>
        <p>Please scan the QR code and open this page on your phone.</p>
      </div>
    );
  }

  if (!isPortrait) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>📱 Portrait Mode Only</h2>
        <p>Please rotate your device to portrait orientation to play the game.</p>
      </div>
    );
  }

  return children;
};

export default MobileOnly;