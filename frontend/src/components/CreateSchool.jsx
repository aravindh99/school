import React, { useState } from 'react';
import { schoolsAPI } from '../services/api';

const CreateSchool = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await schoolsAPI.create(formData);
      setFormData({ name: '', city: '' });
      onSuccess('School request submitted for approval!');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit school request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', city: '' });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Request New School</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="create-school-form">
          <div className="form-group">
            <label htmlFor="name">School Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength="7"
              maxLength="39"
              placeholder="Enter school name (7-39 characters)"
            />
            <div className="char-counter">
              {formData.name.length}/39 characters
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              minLength="3"
              maxLength="14"
              placeholder="Enter city name (3-14 characters)"
            />
            <div className="char-counter">
              {formData.city.length}/14 characters
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
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>

        <div className="info-message">
          <p>Your school request will be reviewed by an administrator before being approved.</p>
        </div>
      </div>
    </div>
  );
};

export default CreateSchool;