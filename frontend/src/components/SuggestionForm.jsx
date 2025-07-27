import React, { useState } from 'react';
import { createSuggestion } from '../services/api';

const SuggestionForm = ({ isOpen, onClose, onSuccess }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (content.trim().length < 10) {
      setError('Suggestion must be at least 10 characters long');
      return;
    }

    if (content.trim().length > 500) {
      setError('Suggestion cannot exceed 500 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createSuggestion(content.trim());
      setContent('');
      onSuccess('Suggestion submitted successfully!');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit suggestion');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Send Suggestion</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="suggestion-form">
          <div className="form-group">
            <label htmlFor="content">Your Suggestion</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows="5"
              placeholder="Share your suggestions, feedback, or feature requests... (10-500 characters)"
              maxLength="500"
            />
            <div className={`char-counter ${content.length < 10 ? 'danger' : content.length > 450 ? 'warning' : ''}`}>
              {content.length}/500 characters {content.length < 10 && '(minimum 10)'}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || content.length < 10}
              className="btn btn-primary"
            >
              {loading ? 'Submitting...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuggestionForm;