import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSchool, createRumor } from '../services/api';

const CreateRumor = () => {
    const { schoolId, collegeId, classNumber } = useParams();
    const navigate = useNavigate();
    const [institution, setInstitution] = useState(null);
    const [formData, setFormData] = useState({
        content: '',
        class: classNumber || '7'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [charCount, setCharCount] = useState(0);
    
    const institutionId = schoolId || collegeId;
    const isCollege = !!collegeId;

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const institutionData = await getSchool(institutionId);
                setInstitution(institutionData);
            } catch (err) {
                setError(`Failed to load ${isCollege ? 'college' : 'school'} data`);
            }
        };

        fetchInstitution();
    }, [institutionId, isCollege]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'content') {
            setCharCount(value.length);
        }
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.content.trim().length < 10) {
            setError('Confession must be at least 10 characters long');
            return;
        }

        if (formData.content.trim().length > 10000) {
            setError('Confession cannot exceed 10000 characters');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await createRumor(institutionId, {
                content: formData.content.trim(),
                class: isCollege ? undefined : formData.class
            });
            
            if (isCollege) {
                navigate(`/college/${collegeId}`);
            } else {
                navigate(`/school/${schoolId}/class/${formData.class}`);
            }
        } catch (err) {
            setError('Failed to post confession');
            console.error('Error creating confession:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!institution) return <div className="loading">Loading...</div>;

    return (
        <div className="create-rumor">
            <div className="create-header">
                <h1>Share Anonymous Thread</h1>
                <p>Posting to: {institution.name}</p>
            </div>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit} className="rumor-form">
                {!isCollege && !classNumber && (
                    <div className="form-group">
                        <label htmlFor="class">Class</label>
                        <select
                            id="class"
                            name="class"
                            value={formData.class}
                            onChange={handleChange}
                            required
                        >
                            <option value="7">Class 7</option>
                            <option value="8">Class 8</option>
                            <option value="9">Class 9</option>
                            <option value="10">Class 10</option>
                            <option value="11">Class 11</option>
                            <option value="12">Class 12</option>
                        </select>
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="content">Your Thread</label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        rows="8"
                        placeholder="Share your story, confession, or anything anonymously... (minimum 10 characters)"
                        maxLength="10000"
                    />
                    <div className={`char-counter ${charCount < 10 ? 'danger' : charCount > 9000 ? 'warning' : ''}`}>
                        {charCount}/10000 characters {charCount < 10 && '(minimum 10)'}
                    </div>
                </div>
            </form>

            <div className="form-actions">
                <button
                    onClick={handleSubmit}
                    disabled={loading || charCount < 10}
                    className="btn btn-primary btn-full"
                >
                    {loading ? 'Posting...' : 'Post Thread'}
                </button>
            </div>
        </div>
    );
};

export default CreateRumor;