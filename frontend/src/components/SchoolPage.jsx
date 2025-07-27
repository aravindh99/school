import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSchool } from '../services/api';

const SchoolPage = () => {
    const { schoolId } = useParams();
    const [school, setSchool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const classes = ['7', '8', '9', '10', '11', '12'];

    useEffect(() => {
        const fetchSchool = async () => {
            try {
                const schoolData = await getSchool(schoolId);
                setSchool(schoolData);
            } catch (err) {
                setError('Failed to load school data');
                console.error('Error fetching school data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSchool();
    }, [schoolId]);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!school) return <div className="error">School not found</div>;

    return (
        <div className="school-page">
            <div className="school-header">
                <h1>{school.name}</h1>
                <p>{school.city}</p>
            </div>

            <div className="classes-section">
                <h2>Select a Class</h2>
                <div className="classes-grid">
                    {classes.map(classNum => (
                        <Link 
                            key={classNum}
                            to={`/school/${schoolId}/class/${classNum}`} 
                            className="class-card"
                        >
                            <h3>Class {classNum}</h3>
                        </Link>
                    ))}
                </div>
            </div>
            

        </div>
    );
};

export default SchoolPage;