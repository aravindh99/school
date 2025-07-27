import React from 'react';

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>How to Use School Scoop</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="help-content">
          <div className="help-section">
            <h3>📝 What can you post?</h3>
            <ul>
              <li>Share stories about school life</li>
              <li>Post rumors you've heard</li>
              <li>Anonymous confessions</li>
              <li>Secrets about someone you know</li>
              <li>Messages to your crush or enemy</li>
              <li>Anything happening in your school</li>
            </ul>
          </div>

          <div className="help-section">
            <h3>🏫 How it works:</h3>
            <ol>
              <li>Select your school from the list</li>
              <li>Choose your class (7-12)</li>
              <li>Read what others have posted</li>
              <li>Click "Add New Thread" to share anonymously</li>
            </ol>
          </div>

          <div className="help-section">
            <h3>🔒 Privacy & Safety:</h3>
            <ul>
              <li>All posts are completely anonymous</li>
              <li>No registration or login required</li>
              <li>Your identity is never stored</li>
              
              
            </ul>
          </div>

          <div className="help-section">
            <h3>🆕 Don't see your school?</h3>
            <p>Click "Request New School" to add your school to the platform. An admin will review and approve it.</p>
          </div>

          <div className="help-section">
            <h3>💡 Got suggestions?</h3>
            <p>Use the "Send Suggestion" button to share feedback or feature requests with us.</p>
          </div>
        </div>

        <div className="help-footer">
          <button onClick={onClose} className="btn btn-primary btn-full">
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;