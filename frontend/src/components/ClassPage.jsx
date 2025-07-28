import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSchool, getRumors } from '../services/api';
import VoteButtons from './VoteButtons';

const ClassPage = () => {
  const { schoolId, classNumber } = useParams();
  const [school, setSchool] = useState(null);
  const [rumors, setRumors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schoolData, rumorsData] = await Promise.all([
          getSchool(schoolId),
          getRumors(schoolId, classNumber)
        ]);
        setSchool(schoolData);
        setRumors(rumorsData);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId, classNumber]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!school) return <div className="error">School not found</div>;

  return (
    <div className="class-page">
      <div className="class-header">
        <h1>Class {classNumber}</h1>
        <Link 
          to={`/school/${schoolId}/class/${classNumber}/create`} 
          className="btn btn-primary"
        >
          Add New Thread
        </Link>
      </div>

      <div className="confessions-section">
        {rumors.length === 0 ? (
          <div className="empty-state">
            <h3>No threads yet</h3>
            <p>Be the first to share something!</p>
          </div>
        ) : (
          <div className="confessions-list">
            {rumors.map(rumor => (
                <div key={rumor._id} className="confession-card">
                  <div className="confession-content">
                    {rumor.content}
                  </div>
                  <div className="confession-meta">
                    <span>{new Date(rumor.createdAt).toLocaleDateString()}</span>
                    <VoteButtons 
                      rumorId={rumor._id}
                      initialUpvotes={rumor.upvotes || 0}
                      initialDownvotes={rumor.downvotes || 0}
                    />
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
};

export default ClassPage;