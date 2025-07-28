import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnnouncement } from '../services/api';
import SuggestionForm from './SuggestionForm';

const Home = () => {
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const announcementData = await getAnnouncement();
                setAnnouncement(announcementData);
            } catch (err) {
                setError('Failed to load data');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSuggestionSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="home">
            <div className="hero">
                <h2>School Scoop</h2>
                <p>Spill the Secrets.🔥</p>
                
                <div className="navigation-tabs">
                    <Link to="/schools" className="nav-tab">
                        Schools
                    </Link>
                    <Link to="/colleges" className="nav-tab">
                        Colleges
                    </Link>
                </div>

                <div className="hero-buttons">
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

            <SuggestionForm
                isOpen={showSuggestion}
                onClose={() => setShowSuggestion(false)}
                onSuccess={handleSuggestionSuccess}
            />
        </div>
    );
};

export default Home;