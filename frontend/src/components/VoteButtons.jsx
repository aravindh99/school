import React, { useState, useEffect } from 'react';
import { voteOnRumor, getUserVote } from '../services/api';
import { generateFingerprint } from '../utils/fingerprint';

const VoteButtons = ({ rumorId, initialUpvotes = 0, initialDownvotes = 0 }) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userFingerprint] = useState(() => generateFingerprint());

  useEffect(() => {
    const fetchUserVote = async () => {
      try {
        const voteData = await getUserVote(rumorId, userFingerprint);
        setUserVote(voteData.userVote);
      } catch (error) {
        console.error('Error fetching user vote:', error);
      }
    };

    fetchUserVote();
  }, [rumorId, userFingerprint]);

  const handleVote = async (voteType) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const result = await voteOnRumor(rumorId, voteType, userFingerprint);
      setUpvotes(result.upvotes);
      setDownvotes(result.downvotes);
      setUserVote(result.userVote);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vote-buttons">
      <button
        className={`vote-btn upvote-btn ${userVote === 'upvote' ? 'active' : ''}`}
        onClick={() => handleVote('upvote')}
        disabled={loading}
      >
        <span className="vote-icon">👍</span>
        <span className="vote-count">{upvotes}</span>
      </button>
      
      <button
        className={`vote-btn downvote-btn ${userVote === 'downvote' ? 'active' : ''}`}
        onClick={() => handleVote('downvote')}
        disabled={loading}
      >
        <span className="vote-icon">👎</span>
        <span className="vote-count">{downvotes}</span>
      </button>
    </div>
  );
};

export default VoteButtons;