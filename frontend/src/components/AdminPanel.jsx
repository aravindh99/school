import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  adminLogin,
  getPendingSchools,
  getAllSchools,
  approveSchool,
  rejectSchool,
  deleteSchool,
  adminCreateSchool,
  getSuggestions,
  deleteSuggestion,
  getAdminAnnouncement,
  updateAnnouncement
} from '../services/api';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [pendingSchools, setPendingSchools] = useState([]);
  const [allSchools, setAllSchools] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [newInstitution, setNewInstitution] = useState({ name: '', city: '', type: 'school' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if already authenticated
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const [pending, schools, suggestionsList, announcementData] = await Promise.all([
        getPendingSchools(),
        getAllSchools(),
        getSuggestions(),
        getAdminAnnouncement()
      ]);
      setPendingSchools(pending);
      setAllSchools(schools);
      setSuggestions(suggestionsList);
      setAnnouncement(announcementData?.content || '');
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await adminLogin(credentials);
      localStorage.setItem('adminToken', response.token);
      setIsAuthenticated(true);
      await fetchData();
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setPendingSchools([]);
    setAllSchools([]);
    setSuggestions([]);
    setAnnouncement('');
  };

  const handleApprove = async (schoolId) => {
    try {
      await approveSchool(schoolId);
      await fetchData(); // Refresh data
    } catch (err) {
      setError('Failed to approve school');
    }
  };

  const handleReject = async (schoolId) => {
    if (!window.confirm('Are you sure you want to reject this school request?')) {
      return;
    }

    try {
      await rejectSchool(schoolId);
      await fetchData(); // Refresh data
    } catch (err) {
      setError('Failed to reject school');
    }
  };

  const handleDeleteSchool = async (schoolId) => {
    if (!window.confirm('Are you sure you want to delete this school and all its threads?')) {
      return;
    }

    try {
      await deleteSchool(schoolId);
      await fetchData(); // Refresh data
    } catch (err) {
      setError('Failed to delete school');
    }
  };

  const handleCreateInstitution = async (e) => {
    e.preventDefault();

    if (newInstitution.name.length < 3 || newInstitution.name.length > 39) {
      setError('Institution name must be between 3 and 39 characters');
      return;
    }

    if (newInstitution.city.length < 3 || newInstitution.city.length > 14) {
      setError('City must be between 3 and 14 characters');
      return;
    }

    try {
      await adminCreateSchool(newInstitution);
      setNewInstitution({ name: '', city: '', type: 'school' });
      setShowCreateForm(false);
      await fetchData(); // Refresh data
    } catch (err) {
      setError(`Failed to create ${newInstitution.type}`);
    }
  };

  const handleDeleteSuggestion = async (suggestionId) => {
    if (!window.confirm('Are you sure you want to delete this suggestion?')) {
      return;
    }

    try {
      await deleteSuggestion(suggestionId);
      await fetchData(); // Refresh data
    } catch (err) {
      setError('Failed to delete suggestion');
    }
  };

  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();

    try {
      await updateAnnouncement(announcement);
      setShowAnnouncementForm(false);
      await fetchData(); // Refresh data
    } catch (err) {
      setError('Failed to update announcement');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <h1>Admin Login</h1>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials({
                ...credentials,
                username: e.target.value
              })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => setCredentials({
                ...credentials,
                password: e.target.value
              })}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-full">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Pending Schools Section */}
      {pendingSchools.length > 0 && (
        <div className="admin-section">
          <h2>Pending School Requests ({pendingSchools.length})</h2>
          <div className="pending-schools">
            {pendingSchools.map(school => (
              <div key={school._id} className="pending-school-card">
                <div className="school-info">
                  <h3>{school.name}</h3>
                  <p>{school.city}</p>
                  <small>Requested: {new Date(school.createdAt).toLocaleDateString()}</small>
                </div>
                <div className="school-actions">
                  <button
                    onClick={() => handleApprove(school._id)}
                    className="btn btn-success btn-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(school._id)}
                    className="btn btn-danger btn-sm"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcement Section */}
      <div className="admin-section">
        <div className="section-header">
          <h2>Announcement</h2>
          <button
            onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
            className="btn btn-primary btn-sm"
          >
            {showAnnouncementForm ? 'Cancel' : 'Edit '}
          </button>
        </div>

        {showAnnouncementForm && (
          <form onSubmit={handleUpdateAnnouncement} className="announcement-form">
            <div className="form-group">
              <label htmlFor="announcement">Announcement Message</label>
              <textarea
                id="announcement"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                rows="3"
                placeholder="Enter announcement message (leave empty to hide)"
                maxLength="200"
              />
              <small>{announcement.length}/200 characters</small>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Save Announcement
              </button>
            </div>
          </form>
        )}

        {!showAnnouncementForm && (
          <div className="current-announcement">
            {announcement ? (
              <p className="announcement-preview">Current: "{announcement}"</p>
            ) : (
              <p className="no-announcement">No announcement set</p>
            )}
          </div>
        )}
      </div>

      {/* Create New Institution Section */}
      <div className="admin-section">
        <div className="section-header">
          <h2>Create New Institution</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn btn-primary btn-sm"
          >
            {showCreateForm ? 'Cancel' : 'Add'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateInstitution} className="create-institution-form">
            <div className="form-group">
              <label htmlFor="institutionType">Type</label>
              <select
                id="institutionType"
                value={newInstitution.type}
                onChange={(e) => setNewInstitution({ ...newInstitution, type: e.target.value })}
                required
              >
                <option value="school">School</option>
                <option value="college">College</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="institutionName">
                {newInstitution.type === 'school' ? 'School' : 'College'} Name
              </label>
              <input
                type="text"
                id="institutionName"
                placeholder={`Enter ${newInstitution.type} name (3-39 characters)`}
                value={newInstitution.name}
                onChange={(e) => setNewInstitution({ ...newInstitution, name: e.target.value })}
                required
                minLength="3"
                maxLength="39"
              />
              <small>{newInstitution.name.length}/39 characters</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="cityName">City</label>
              <input
                type="text"
                id="cityName"
                placeholder="Enter city name (3-14 characters)"
                value={newInstitution.city}
                onChange={(e) => setNewInstitution({ ...newInstitution, city: e.target.value })}
                required
                minLength="3"
                maxLength="14"
              />
              <small>{newInstitution.city.length}/14 characters</small>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Create {newInstitution.type === 'school' ? 'School' : 'College'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="admin-section">
          <h2>User Suggestions ({suggestions.length})</h2>
          <div className="suggestions-list">
            {suggestions.map(suggestion => (
              <div key={suggestion._id} className="suggestion-card">
                <div className="suggestion-content">
                  {suggestion.content}
                </div>
                <div className="suggestion-meta">
                  <span>{new Date(suggestion.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleDeleteSuggestion(suggestion._id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Schools Section */}
      <div className="admin-section">
        <h2>All Schools ({allSchools.filter(s => s.status === 'approved').length})</h2>
        <div className="schools-list">
          {allSchools.filter(school => school.status === 'approved').map(school => (
            <div key={school._id} className="admin-school-card">
              <div className="school-info">
                <Link to={`/admin/school/${school._id}`} className="school-link">
                  <h3>{school.name}</h3>
                  <p>{school.city}</p>
                </Link>
              </div>
              <div className="school-actions">
                <button
                  onClick={() => handleDeleteSchool(school._id)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;