import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSchool, getRumors } from '../services/api';
import VoteButtons from './VoteButtons';

const CollegePage = () => {
    const { collegeId } = useParams();
    const [college, setCollege] = useState(null);
    const [rumors, setRumors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [collegeData, rumorsData] = await Promise.all([
                    getSchool(collegeId),
                    getRumors(collegeId)
                ]);
                setCollege(collegeData);
                setRumors(Array.isArray(rumorsData) ? rumorsData : []);
            } catch (err) {
                setError('Failed to load college data');
                console.error('Error fetching college data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [collegeId]);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!college) return <div className="error">College not found</div>;

    return (
        <div className="college-page">
            <div className="college-header">
                <h1>{college.name}</h1>
                <p>{college.city}</p>
                <Link 
                    to={`/college/${collegeId}/create`} 
                    className="btn btn-primary create-thread-btn"
                >
                    Create New Thread
                </Link>
            </div>

            <div className="threads-section">
                <h2>College Threads</h2>
                {rumors && rumors.length > 0 ? (
                    <div className="threads-list">
                        {rumors.map(rumor => (
                            <div key={rumor._id} className="thread-card">
                                <div className="thread-content">
                                    <p>{rumor.content}</p>
                                </div>
                                <div className="thread-meta">
                                    <div className="thread-time-info">
                                        <span className="thread-date">
                                            {new Date(rumor.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="thread-time">
                                            {new Date(rumor.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <VoteButtons 
                                        rumorId={rumor._id}
                                        initialUpvotes={rumor.upvotes || 0}
                                        initialDownvotes={rumor.downvotes || 0}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-threads">
                        <p>No threads yet. Be the first to start a conversation!</p>
                        <Link 
                            to={`/college/${collegeId}/create`} 
                            className="btn btn-primary"
                        >
                            Create First Thread
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollegePage;