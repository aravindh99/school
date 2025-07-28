import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSchools } from '../services/api';
import CreateCollege from './CreateCollege';

const CollegesList = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateCollege, setShowCreateCollege] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const data = await getSchools('college');
        setColleges(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load colleges');
        console.error('Error fetching colleges:', err);
        setColleges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  const handleCreateCollegeSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  if (loading) return <div className="loading">Loading colleges...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="institutions-page">
      <div className="page-header">
        <h1>Colleges</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateCollege(true)}
        >
          Request New College
        </button>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      
      <div className="institutions-grid">
        {colleges && colleges.length > 0 ? colleges.map(college => (
          <Link 
            key={college._id} 
            to={`/college/${college._id}`} 
            className="institution-card"
          >
            <h3>{college.name}</h3>
            <p>{college.city}</p>
            <div className="institution-stats">
              <span>{college.rumorCount || 0} threads</span>
            </div>
          </Link>
        )) : (
          <p>No colleges available</p>
        )}
      </div>

      <CreateCollege
        isOpen={showCreateCollege}
        onClose={() => setShowCreateCollege(false)}
        onSuccess={handleCreateCollegeSuccess}
      />
    </div>
  );
};

export default CollegesList;