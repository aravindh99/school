import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSchool, getRumors } from '../services/api';

const ClassPage = () => {
  const { schoolId, classNumber } = useParams();
  const [school, setSchool] = useState(null);
  const [rumors, setRumors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRumors, setExpandedRumors] = useState(new Set());

  const toggleExpanded = (rumorId) => {
    const newExpanded = new Set(expandedRumors);
    if (newExpanded.has(rumorId)) {
      newExpanded.delete(rumorId);
    } else {
      newExpanded.add(rumorId);
    }
    setExpandedRumors(newExpanded);
  };

  const truncateText = (text, maxLines = 2) => {
    const words = text.split(' ');
    const wordsPerLine = 8; // Approximate words per line
    const maxWords = maxLines * wordsPerLine;
    
    if (words.length <= maxWords) {
      return text;
    }
    
    return words.slice(0, maxWords).join(' ') + '...';
  };

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
            {rumors.map(rumor => {
              const isExpanded = expandedRumors.has(rumor._id);
              const shouldTruncate = rumor.content.split(' ').length > 16;
              
              return (
                <div key={rumor._id} className="confession-card">
                  <div className="confession-content">
                    {isExpanded || !shouldTruncate 
                      ? rumor.content 
                      : truncateText(rumor.content)
                    }
                    {shouldTruncate && (
                      <button 
                        className="expand-btn"
                        onClick={() => toggleExpanded(rumor._id)}
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                  <div className="confession-meta">
                    <span>{new Date(rumor.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


    </div>
  );
};

export default ClassPage;