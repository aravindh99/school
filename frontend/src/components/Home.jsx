import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSchools, getAnnouncement } from '../services/api';
import CreateSchool from './CreateSchool';
import SuggestionForm from './SuggestionForm';

const Home = () => {
    const [schools, setSchools] = useState([]);
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateSchool, setShowCreateSchool] = useState(false);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [schoolsData, announcementData] = await Promise.all([
                    getSchools(),
                    getAnnouncement()
                ]);
                setSchools(Array.isArray(schoolsData) ? schoolsData : []);
                setAnnouncement(announcementData);
            } catch (err) {
                setError('Failed to load data');
                console.error('Error fetching data:', err);
                setSchools([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCreateSchoolSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    if (loading) return <div className="loading">Loading schools...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="home">
            <div className="hero">
                <h2>School Scoop</h2>
                <p>Spill the Secrets.🔥</p>
                <div className="hero-buttons">
                    <button
                        className="btn btn-primary create-school-btn"
                        onClick={() => setShowCreateSchool(true)}
                    >
                        Request New School
                    </button>
                    <button
                        className="btn btn-secondary suggestion-btn"
                        onClick={() => setShowSuggestion(true)}
                    >
                        Send Suggestion
                    </button>
                </div>

                {announcement && (
                    <div className="announcement">
                        <p>{announcement.content}</p>
                    </div>
                )}
            </div>

            {successMessage && (
                <div className="success-message">{successMessage}</div>
            )}

            <div className="schools-grid">
                {schools && schools.length > 0 ? schools.map(school => (
                    <Link
                        key={school._id}
                        to={`/school/${school._id}`}
                        className="school-card"
                    >
                        <h3>{school.name}</h3>
                        <p>{school.city}</p>
                        <div className="school-stats">
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
            />

            <SuggestionForm
                isOpen={showSuggestion}
                onClose={() => setShowSuggestion(false)}
                onSuccess={handleCreateSchoolSuccess}
            />
        </div>
    );
};

export default Home;