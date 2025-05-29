import React from 'react';
import { useMediaQuery } from 'react-responsive';
import './LoginScreen.css';

const LoginScreen = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTabletOrLarger = useMediaQuery({ minWidth: 768 });

  return (
    <div
      className={`login-container ${isMobile ? 'mobile' : ''}`}>
        
      <div className="header">
        <img src="/images/ces.jpg" alt="Changi Experience Studio" className="ces-logo" />
        <h2>GoChangi!</h2>
      </div>

      <div className="buttons">
        <button className="login-btn">Login</button>
        <button className="public-btn">Go back to Public</button>
      </div>

      <div className="footer">
        <img src="/images/jewel.png" alt="Jewel Changi Airport" className="jewel-logo" />
        <div className="language">
          <img src="/images/globe.png" alt="globe" className="globe-icon" />
          <span>English</span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
