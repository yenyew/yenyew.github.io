import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainStyles.css';

const LandingCustomiser = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [backgroundType, setBackgroundType] = useState('image');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [gradientColors, setGradientColors] = useState(['#c4eb22', '#17c4c4']);
  const [gradientDirection, setGradientDirection] = useState('to right');
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome To GoChangi!');
  const [description, setDescription] = useState('Discover Changi, One Clue at a Time!');
  const [titleColor, setTitleColor] = useState('#000000');
  const [descriptionColor, setDescriptionColor] = useState('#000000');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/landing-customisation');
      const data = await response.json();
      setSettings(data);
      
      // Populate form
      setBackgroundType(data.backgroundType);
      setBackgroundColor(data.backgroundColor);
      setGradientColors(data.gradientColors);
      setGradientDirection(data.gradientDirection);
      setWelcomeMessage(data.welcomeMessage);
      setDescription(data.description);
      setTitleColor(data.titleColor);
      setDescriptionColor(data.descriptionColor);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      
      formData.append('backgroundType', backgroundType);
      formData.append('backgroundColor', backgroundColor);
      formData.append('gradientColors', JSON.stringify(gradientColors));
      formData.append('gradientDirection', gradientDirection);
      formData.append('welcomeMessage', welcomeMessage);
      formData.append('description', description);
      formData.append('titleColor', titleColor);
      formData.append('descriptionColor', descriptionColor);
      
      if (backgroundImage) {
        formData.append('backgroundImage', backgroundImage);
      }
      
      const response = await fetch('http://localhost:5000/landing-customisation', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        alert('Landing page updated successfully!');
        fetchSettings();
      } else {
        alert('Error updating landing page');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving changes');
    }
  };

  const handleReset = async () => {
    if (confirm('Reset to default settings? This cannot be undone.')) {
      try {
        const response = await fetch('http://localhost:5000/landing-customisation/reset', {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert('Settings reset successfully!');
          fetchSettings();
        }
      } catch (error) {
        console.error('Error resetting:', error);
      }
    }
  };

  if (loading) {
    return <div className="login-container">Loading...</div>;
  }

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="page-overlay"></div>

      <div className="header">
        <button
          onClick={() => navigate('/admin')}
          className="login-btn"
          style={{
            backgroundColor: "#17C4C4",
            color: "#fff",
            width: "120px",
            marginBottom: "10px",
          }}
        >
          &lt; Back
        </button>
      </div>

      <div className="buttons">
        <h2 style={{ fontSise: "24px", color: "#000", textAlign: "center", marginBottom: "20px" }}>
          Customise Landing Page
        </h2>

        <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Welcome Message */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Welcome Message:
            </label>
            <input
              type="text"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="login-btn"
              style={{ backgroundColor: 'white' }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Description:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="login-btn"
              style={{ backgroundColor: 'white', height: '80px' }}
            />
          </div>

          {/* Background Type */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Background Type:
            </label>
            <select
              value={backgroundType}
              onChange={(e) => setBackgroundType(e.target.value)}
              className="login-btn"
              style={{ backgroundColor: 'white' }}
            >
              <option value="image">Image</option>
              <option value="color">Solid Color</option>
              <option value="gradient">Gradient</option>
            </select>
          </div>

          {/* Background Image Upload */}
          {backgroundType === 'image' && (
            <>
              {settings?.backgroundImage && (
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Current Background:
                  </label>
                  <img
                    src={`http://localhost:5000/${settings.backgroundImage}`}
                    alt="Current background"
                    style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '10px' }}
                  />
                </div>
              )}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Upload New Background:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBackgroundImage(e.target.files[0])}
                  className="login-btn"
                  style={{ backgroundColor: 'white' }}
                />
              </div>
            </>
          )}

          {/* Solid Color */}
          {backgroundType === 'color' && (
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Background Color:
              </label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="login-btn"
                style={{ backgroundColor: 'white' }}
              />
            </div>
          )}

          {/* Gradient */}
          {backgroundType === 'gradient' && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Gradient Direction:
                </label>
                <select
                  value={gradientDirection}
                  onChange={(e) => setGradientDirection(e.target.value)}
                  className="login-btn"
                  style={{ backgroundColor: 'white' }}
                >
                  <option value="to right">Left to Right</option>
                  <option value="to left">Right to Left</option>
                  <option value="to bottom">Top to Bottom</option>
                  <option value="to top">Bottom to Top</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Gradient Colors:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="color"
                    value={gradientColors[0]}
                    onChange={(e) => setGradientColors([e.target.value, gradientColors[1]])}
                    style={{ width: '50%' }}
                  />
                  <input
                    type="color"
                    value={gradientColors[1]}
                    onChange={(e) => setGradientColors([gradientColors[0], e.target.value])}
                    style={{ width: '50%' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Text Colors */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Title Color:
            </label>
            <input
              type="color"
              value={titleColor}
              onChange={(e) => setTitleColor(e.target.value)}
              className="login-btn"
              style={{ backgroundColor: 'white' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Description Color:
            </label>
            <input
              type="color"
              value={descriptionColor}
              onChange={(e) => setDescriptionColor(e.target.value)}
              className="login-btn"
              style={{ backgroundColor: 'white' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={handleSave}
              className="login-btn"
              style={{
                background: "linear-gradient(90deg, #C4EB22, #17C4C4)",
                color: "black",
                flex: 1
              }}
            >
              Save Changes
            </button>
            
            <button
              onClick={handleReset}
              className="login-btn"
              style={{
                backgroundColor: "#ff6b6b",
                color: "white",
                flex: 1
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingCustomiser;