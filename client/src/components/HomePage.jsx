import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MainStyles.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate('/getname');
  };

  const handleAdminLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="home-container">
      <img src="/images/changihome.jpg" alt="Background" className="home-background" />
      <div className="home-overlay"></div>

      <div className="top-left-logo">
        <img src="/images/ces.jpg" alt="Changi Experience Studio" />
      </div>

      <div className="home-content">
        <div className="title-block">
          <h1>Welcome To<br />GoChangi!</h1>
        </div>

        <div className="description-block">
          <p>Discover Changi, One Clue at a Time!</p>
          <div className="home-buttons">
            <button onClick={handlePlayClick}>Play</button>
            <button onClick={handleAdminLoginClick}>Admin Login</button>
          </div>

          <div className="jewel-logo-wrapper">
            <img src="/images/jewel.png" alt="Jewel Logo" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
