import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSchoolThreads, deleteRumor } from '../services/api';

const AdminSchoolView = () => {
  const { schoolId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getSchoolThreads(schoolId);
        setData(result);
      } catch (err) {
        setError('Failed to load school threads');
        console.error('Error fetching school threads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId]);

  const handleDeleteThread = async (threadId) => {
    if (!window.confirm('Are you sure you want to delete this thread?')) {
      return;
    }

    try {
      await deleteRumor(threadId);
      // Refresh the data
      const result = await getSchoolThreads(schoolId);
      setData(result);
    } catch (err) {
      setError('Failed to delete thread');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!data) return <div className="error">School not found</div>;

  return (
    <div className="admin-school-view">
      <div className="school-header">
        <h1>{data.school.name}</h1>
        <p>{data.school.city}</p>
      </div>

      <div className="threads-section">
        <h2>All Threads ({data.threads.length})</h2>
        {data.threads.length === 0 ? (
          <div className="empty-state">
            <p>No threads in this school yet</p>
          </div>
        ) : (
          <div className="threads-list">
            {data.threads.map(thread => (
              <div key={thread._id} className="admin-thread-card">
                <div className="thread-content">
                  {thread.content}
                </div>
                <div className="thread-meta">
                  <span>Class {thread.class}</span>
                  <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                  <button 
                    onClick={() => handleDeleteThread(thread._id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSchoolView;