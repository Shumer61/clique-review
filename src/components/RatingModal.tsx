import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';
import { useCliqueStore } from '../store/cliqueStore';
import { useVenueStore } from '../store/venueStore';

interface RatingModalProps {
  venueId: string;
  onClose: () => void;
}

const vibeTags = ['lively', 'chill', 'cheap drinks', 'good music', 'quiet', 'outdoor', 'crowded', 'romantic'];

export default function RatingModal({ venueId, onClose }: RatingModalProps) {
  const { user } = useAuthStore();
  const { currentClique } = useCliqueStore();
  const { addRatingManually, loading } = useVenueStore();
  const [rating, setRating] = useState<number>(3);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [visitedDate, setVisitedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!user || !currentClique) return;
    await addRatingManually({
      venueId,
      cliqueId: currentClique.id!,
      userId: user.uid,
      rating,
      tags: selectedTags,
      comment: comment.trim() || undefined,
      visitedDate: Timestamp.fromDate(new Date(visitedDate)),
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h2>Log your visit</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Rating (1-5 stars)</label>
          <div>
            {[1,2,3,4,5].map(s => (
              <button
                key={s}
                onClick={() => setRating(s)}
                style={{
                  margin: '0 0.25rem',
                  padding: '0.5rem',
                  background: rating === s ? '#ffc107' : '#eee',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {s}★
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Vibe tags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {vibeTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: selectedTags.includes(tag) ? '#007bff' : '#eee',
                  color: selectedTags.includes(tag) ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Comment (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Date visited</label>
          <input
            type="date"
            value={visitedDate}
            onChange={(e) => setVisitedDate(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleSubmit} disabled={loading} style={{ background: '#28a745', color: 'white' }}>
            {loading ? 'Saving...' : 'Submit Rating'}
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}