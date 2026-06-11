// src/components/RatingModal.tsx
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

// ─── Sub-component: a single past visit row ───────────────────────────────────

interface PastVisitRowProps {
  ratingId: string;
  stars: number;
  tags: string[];
  comment?: string;
  dateStr: string;
  loading: boolean;
  onDelete: (ratingId: string, dateStr: string) => void;
  onSaveComment: (ratingId: string, newComment: string | undefined) => void;
}

function PastVisitRow({
  ratingId, stars, tags, comment, dateStr, loading, onDelete, onSaveComment,
}: PastVisitRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment ?? '');

  const handleSave = () => {
    const trimmed = draft.trim();
    onSaveComment(ratingId, trimmed === '' ? undefined : trimmed);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(comment ?? '');
    setEditing(false);
  };

  return (
    <div style={{
      background: '#f9f9f9',
      borderRadius: '6px',
      padding: '0.6rem 0.75rem',
      marginBottom: '0.5rem',
      fontSize: '0.85rem',
    }}>
      {/* Top row: stars + tags + delete */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontWeight: 600 }}>{stars}★</span>
          {tags.length > 0 && (
            <span style={{ color: '#666', marginLeft: '0.5rem' }}>{tags.join(', ')}</span>
          )}
          <span style={{ color: '#999', marginLeft: '0.5rem' }}>· {dateStr}</span>
        </div>
        <button
          onClick={() => onDelete(ratingId, dateStr)}
          disabled={loading}
          aria-label="Delete this visit"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c00', fontSize: '1rem', flexShrink: 0 }}
        >
          🗑️
        </button>
      </div>

      {/* Comment section */}
      {editing ? (
        <div style={{ marginTop: '0.5rem' }}>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={2}
            autoFocus
            style={{ width: '100%', padding: '0.4rem', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.85rem' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              style={{ background: '#eee', border: 'none', borderRadius: '4px', padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Cancel
            </button>
            {comment && (
              <button
                onClick={() => { onSaveComment(ratingId, undefined); setEditing(false); }}
                disabled={loading}
                style={{ background: 'none', border: 'none', color: '#c00', cursor: 'pointer', fontSize: '0.8rem', marginLeft: 'auto' }}
              >
                Remove comment
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
          {comment ? (
            <span style={{ color: '#444', fontStyle: 'italic', flex: 1 }}>"{comment}"</span>
          ) : (
            <span style={{ color: '#bbb', flex: 1 }}>No comment</span>
          )}
          <button
            onClick={() => setEditing(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#007bff', fontSize: '0.8rem', flexShrink: 0, padding: 0 }}
          >
            ✏️
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RatingModal({ venueId, onClose }: RatingModalProps) {
  const { user } = useAuthStore();
  const { currentClique } = useCliqueStore();
  const { addRatingManually, deleteRatingById, updateRatingCommentById, ratings, loading } = useVenueStore();

  const [stars, setStars] = useState<number>(3);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [visitedDate, setVisitedDate] = useState(new Date().toISOString().split('T')[0]);

  const myRatings = ratings.filter(r => r.venueId === venueId && r.userId === user?.uid);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!user || !currentClique?.id) return;
    await addRatingManually({
      venueId,
      cliqueId: currentClique.id,
      userId: user.uid,
      rating: stars,
      tags: selectedTags,
      comment: comment.trim() || undefined,
      visitedDate: Timestamp.fromDate(new Date(visitedDate)),
    });
    onClose();
  };

  const handleDeleteRating = async (ratingId: string, dateStr: string) => {
    if (!confirm(`Delete your visit logged on ${dateStr}? This cannot be undone.`)) return;
    await deleteRatingById(ratingId);
  };

  const handleSaveComment = async (ratingId: string, newComment: string | undefined) => {
    await updateRatingCommentById(ratingId, newComment);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '85vh',
        overflowY: 'auto',
      }}>
        <h2 style={{ marginTop: 0 }}>Log your visit</h2>

        {/* ── Stars ─────────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
            Rating (1–5 stars)
          </label>
          <div>
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                onClick={() => setStars(s)}
                style={{
                  margin: '0 0.25rem',
                  padding: '0.5rem',
                  background: stars >= s ? '#ffc107' : '#eee',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {s}★
              </button>
            ))}
          </div>
        </div>

        {/* ── Vibe tags ─────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Vibe tags</label>
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
                  cursor: 'pointer',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* ── Comment ───────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
            Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* ── Date visited ──────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Date visited</label>
          <input
            type="date"
            value={visitedDate}
            onChange={e => setVisitedDate(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* ── Actions ───────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: myRatings.length > 0 ? '1.5rem' : 0 }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ background: '#28a745', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
          >
            {loading ? 'Saving...' : 'Submit Rating'}
          </button>
          <button
            onClick={onClose}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ccc' }}
          >
            Cancel
          </button>
        </div>

        {/* ── Past visits (editable comments, deletable) ────────────────────── */}
        {myRatings.length > 0 && (
          <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#555' }}>
              Your previous visits
            </h4>
            {myRatings.map(r => (
              <PastVisitRow
                key={r.id}
                ratingId={r.id!}
                stars={r.rating}
                tags={r.tags}
                comment={r.comment}
                dateStr={r.visitedDate.toDate().toLocaleDateString()}
                loading={loading}
                onDelete={handleDeleteRating}
                onSaveComment={handleSaveComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}