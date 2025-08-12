import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingCustomisation.css';
import AlertModal from './AlertModal';
import LivePreview from './LivePreview';

const DEFAULT_BG = '/images/changihome.jpg';

const LandingCustomisation = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);

  // Form states
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome To GoChangi!');
  const [description, setDescription] = useState('Discover Changi, One Clue at a Time!');
  const [textColor, setTextColor] = useState('#000000'); // Combined color
  const [showLogo, setShowLogo] = useState(true);

  // AlertModal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/landing-customisation');
      const data = await response.json();
      setSettings(data);

      setWelcomeMessage(data.welcomeMessage);
      setDescription(data.description);
      setTextColor(data.titleColor || '#000000');
  setBackgroundImage(null); // Don't set file, just reset
  setShowLogo(data.showLogo !== false);
    } catch {
      setModalTitle('Error');
      setModalMessage('Failed to fetch landing page settings.');
      setShowErrorModal(true);
    }
  };

  const handleSave = async () => {
    setModalTitle('Confirm Save');
    setModalMessage('Are you sure you want to save these changes to the landing page?');
    setShowConfirmModal(true);
  };

  const confirmSave = async () => {
    try {
      const formData = new FormData();
      formData.append('welcomeMessage', welcomeMessage);
      formData.append('description', description);
      formData.append('titleColor', textColor);
      formData.append('descriptionColor', textColor);
      if (backgroundImage) {
        formData.append('backgroundImage', backgroundImage);
      }
      formData.append('showLogo', showLogo);

      const response = await fetch('http://localhost:5000/landing-customisation', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setModalTitle('Success');
        setModalMessage('Landing page updated successfully!');
        setShowSuccessModal(true);
        fetchSettings();
      } else {
        setModalTitle('Error');
        setModalMessage('Error updating landing page.');
        setShowErrorModal(true);
      }
    } catch {
      setModalTitle('Error');
      setModalMessage('Error saving changes.');
      setShowErrorModal(true);
    }
    setShowConfirmModal(false);
  };

  const handleReset = () => {
    setModalTitle('Confirm Reset');
    setModalMessage('Reset to default settings? This cannot be undone.');
    setShowConfirmModal(true);
  };

  const confirmReset = async () => {
    try {
      const response = await fetch('http://localhost:5000/landing-customisation/reset', {
        method: 'DELETE'
      });

      if (response.ok) {
        setWelcomeMessage('Welcome To GoChangi!');
        setDescription('Discover Changi, One Clue at a Time!');
        setTextColor('#000000');
        setBackgroundImage(null);
  setSettings({ backgroundImage: DEFAULT_BG, showLogo: true });
        setModalTitle('Success');
        setModalMessage('Settings reset successfully!');
        setShowSuccessModal(true);
      } else {
        setModalTitle('Error');
        setModalMessage('Error resetting settings.');
        setShowErrorModal(true);
      }
    } catch {
      setModalTitle('Error');
      setModalMessage('Error resetting settings.');
      setShowErrorModal(true);
    }
    setShowConfirmModal(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setBackgroundImage(file);
  };

  const handlePreviewImage = () => {
    setShowPreviewModal(true);
    setModalTitle('Live Preview');
    setModalMessage('');
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    setShowErrorModal(false);
    setShowConfirmModal(false);
    setShowPreviewModal(false);
  };

  const handleConfirm = () => {
    if (modalTitle === 'Confirm Save') {
      confirmSave();
    } else if (modalTitle === 'Confirm Reset') {
      confirmReset();
    }
  };

  // Get preview background src
  const getPreviewBg = () => {
    if (backgroundImage) {
      return URL.createObjectURL(backgroundImage);
    }
    return settings?.backgroundImage || DEFAULT_BG;
  };

  return (
    <div className="landing-customisation-container" style={{ overflowY: 'auto', height: '100vh' }}>
      <img src={DEFAULT_BG} alt="Background" className="background-image" />
      <div className="page-overlay"></div>

      <div className="landing-customisation-content">
        <h2 style={{ color: "#000", fontSize: "24px", marginBottom: "18px", textAlign: "center" }}>
          Customise Landing Page
        </h2>
  <form style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Welcome Message */}
          <div>
            <label className="custom-label">Welcome Message:</label>
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
            <label className="custom-label">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="login-btn"
              style={{ backgroundColor: 'white', height: '80px' }}
            />
          </div>

          {/* Upload New Background */}
          <div>
            <label className="custom-label">Upload New Background:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="login-btn"
              style={{ backgroundColor: 'white' }}
            />
            {(backgroundImage || settings?.backgroundImage) && (
              <button
                type="button"
                onClick={handlePreviewImage}
                className="login-btn"
                style={{
                  marginTop: '8px',
                  backgroundColor: "#17C4C4",
                  color: "#fff"
                }}
              >
                Preview
              </button>
            )}
          </div>

          {/* Combined Text Color */}
          <div>
            <label className="custom-label">Text Color (Title & Description):</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="login-btn"
              style={{ backgroundColor: 'white' }}
            />
          </div>

          {/* Toggle CES Logo */}
          <div>
            <label className="custom-label">Show CES Logo (top left):</label>
            <input
              type="checkbox"
              checked={showLogo}
              onChange={e => setShowLogo(e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </div>
          {/* Action Buttons */}
          <div className="button-row">
            <button
              type="button"
              onClick={handleSave}
              className="login-btn"
              style={{
                background: "linear-gradient(90deg, #C4EB22, #17C4C4)",
                color: "black"
              }}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="login-btn"
              style={{
                backgroundColor: "#ff6b6b",
                color: "white"
              }}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="login-btn"
              style={{
                backgroundColor: "#17C4C4",
                color: "#fff"
              }}
            >
              Return
            </button>
          </div>
        </form>
      </div>

      {/* Live Preview Modal */}
      <AlertModal
  isOpen={showPreviewModal}
  onClose={handleModalClose}
  title={modalTitle}
  message={
    <div
      style={{
        width: '100%',
        maxWidth: '320px',
        maxHeight: '70vh',           // ← prevent it from filling the whole screen
        margin: '0 auto',
        padding: 0,
        marginBottom: 0,
        transform: 'scale(0.75)',
        transformOrigin: 'top center',
      }}
    >
      <LivePreview
        welcomeMessage={welcomeMessage}
        description={description}
        textColor={textColor}
        backgroundImage={getPreviewBg()}
      />
    </div>
  }
  confirmText="OK"
  type="info"
  showCancel={false}
/>



      {/* Confirm Modal (Save/Reset) */}
      <AlertModal
        isOpen={showConfirmModal}
        onClose={handleModalClose}
        onConfirm={handleConfirm}
        title={modalTitle}
        message={modalMessage}
        confirmText="Confirm"
        cancelText="Cancel"
        type="info"
        showCancel={true}
      />

      {/* Success Modal */}
      <AlertModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        type="success"
        showCancel={false}
      />

      {/* Error Modal */}
      <AlertModal
        isOpen={showErrorModal}
        onClose={handleModalClose}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        type="error"
        showCancel={false}
      />
    </div>
  );
};

export default LandingCustomisation;