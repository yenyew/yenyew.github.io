import React from 'react';
import './MainStyles.css';

const AlertModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm", 
  message = "Are you sure?", 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  type = "info", // "info", "success", "warning", "error"
  icon = null,
  showCancel = true
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          borderColor: '#4CAF50',
          iconColor: '#4CAF50',
          confirmBg: 'linear-gradient(135deg, #4CAF50, #45a049)'
        };
      case 'warning':
        return {
          borderColor: '#ff9800',
          iconColor: '#ff9800',
          confirmBg: 'linear-gradient(135deg, #ff9800, #f57c00)'
        };
      case 'error':
        return {
          borderColor: '#f44336',
          iconColor: '#f44336',
          confirmBg: 'linear-gradient(135deg, #f44336, #d32f2f)'
        };
      default:
        return {
          borderColor: '#2196F3',
          iconColor: '#2196F3',
          confirmBg: 'linear-gradient(135deg, #2196F3, #1976D2)'
        };
    }
  };

  const typeStyles = getTypeStyles();

  const getDefaultIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="alert-modal-overlay" onClick={handleCancel}>
      <div 
        className="alert-modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ borderTop: `4px solid ${typeStyles.borderColor}` }}
      >
        <div className="alert-modal-header">
          <div className="alert-modal-icon" style={{ color: typeStyles.iconColor }}>
            {icon || getDefaultIcon()}
          </div>
          <h3 className="alert-modal-title">{title}</h3>
        </div>
        
        <div className="alert-modal-body">
          <p>{message}</p>
        </div>
        
        <div className="alert-modal-actions">
          {showCancel && (
            <button 
              className="alert-modal-cancel-btn" 
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          )}
          <button 
            className="alert-modal-confirm-btn" 
            onClick={handleConfirm}
            style={{ background: typeStyles.confirmBg }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;