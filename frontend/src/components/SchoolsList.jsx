import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSchools } from '../services/api';
import CreateSchool from './CreateSchool';

const SchoolsList = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateSchool, setShowCreateSchool] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const data = await getSchools('school');
        setSchools(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load schools');
        console.error('Error fetching schools:', err);
        setSchools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const handleCreateSchoolSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  if (loading) return <div className="loading">Loading schools...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="institutions-page">
      <div className="page-header">
        <h1>Schools</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateSchool(true)}
        >
          Request New School
        </button>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      
      <div className="institutions-grid">
        {schools && schools.length > 0 ? schools.map(school => (
          <Link 
            key={school._id} 
            to={`/school/${school._id}`} 
            className="institution-card"
          >
            <h3>{school.name}</h3>
            <p>{school.city}</p>
            <div className="institution-stats">
              <span>{school.rumorCount || 0} threads</span>
            </div>
          </Link>
        )) : (
          <p>No schools available</p>
        )}
      </div>

      <CreateSchool
        isOpen={showCreateSchool}
        onClose={() => setShowCreateSchool(false)}
        onSuccess={handleCreateSchoolSuccess}
        type="school"
      />
    </div>
  );
};

export default SchoolsList;