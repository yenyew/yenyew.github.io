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

      <div className="home-content">
        <div className="title-block">
          <h1>Welcome to GoChangi!</h1>
        </div>

        <div className="description-block">
          <p>Discover Changi, One Clue at a Time!</p>
          <div className="home-buttons">
            <button onClick={handlePlayClick}>Play</button>
            <button onClick={handleAdminLoginClick}>Admin Login</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
//       <p style={{ fontSize: "16px", color: "#000", textAlign: "center" }}>