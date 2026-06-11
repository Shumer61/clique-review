// src/components/Feed.tsx
import { useEffect, useState } from 'react';
import { useCliqueStore } from '../store/cliqueStore';
import { listenToCliqueVenues, listenToCliqueRatings, Venue, Rating } from '../services/venues';
import { Timestamp } from 'firebase/firestore';

type ActivityItem = {
  id: string;
  type: 'venue_added' | 'rating_added';
  data: Venue | Rating;
  timestamp: Timestamp;
};

export default function Feed() {
  const { currentClique } = useCliqueStore();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (!currentClique?.id) return;

    const unsubVenues = listenToCliqueVenues(currentClique.id, (venues) => {
      const items: ActivityItem[] = venues.slice(0, 10).map(v => ({
        id: `venue-${v.id}`,
        type: 'venue_added',
        data: v,
        timestamp: v.createdAt,
      }));
      setActivities(prev => {
        const other = prev.filter(a => a.type !== 'venue_added');
        return [...items, ...other].sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
      });
    });

    const unsubRatings = listenToCliqueRatings(currentClique.id, (ratings) => {
      const items: ActivityItem[] = ratings.slice(0, 10).map(r => ({
        id: `rating-${r.id}`,
        type: 'rating_added',
        data: r,
        timestamp: r.createdAt,
      }));
      setActivities(prev => {
        const other = prev.filter(a => a.type !== 'rating_added');
        return [...items, ...other].sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
      });
    });

    return () => { unsubVenues(); unsubRatings(); };
  }, [currentClique?.id]);

  if (!currentClique) return null;

  return (
    <div
      className="uk-scroll"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '270px',
        height: '100%',
        background: 'rgba(29,10,46,0.93)',
        backdropFilter: 'blur(8px)',
        borderRight: '0.5px solid rgba(232,184,109,0.12)',
        zIndex: 900,
        overflowY: 'auto',
        padding: '1rem',
      }}
    >
      <h2 style={{ color: '#E8B86D', fontSize: '0.8rem', letterSpacing: '0.08em', margin: '0 0 1rem' }}>
        RECENT ACTIVITY
      </h2>

      {activities.length === 0 && (
        <p style={{ color: '#9B8FAD', fontSize: '0.82rem' }}>No activity yet.</p>
      )}

      {activities.map(activity => {
        const time = new Date(activity.timestamp.seconds * 1000).toLocaleTimeString([], {
          hour: '2-digit', minute: '2-digit',
        });
        const date = new Date(activity.timestamp.seconds * 1000).toLocaleDateString([], {
          month: 'short', day: 'numeric',
        });

        return (
          <div
            key={activity.id}
            style={{
              borderBottom: '0.5px solid rgba(232,184,109,0.08)',
              padding: '0.7rem 0',
              fontSize: '0.83rem',
            }}
          >
            {activity.type === 'venue_added' ? (
              <div>
                <span style={{ marginRight: '0.4rem' }}>📍</span>
                <span style={{ color: '#9B8FAD' }}>New venue: </span>
                <span style={{ color: '#E8B86D', fontWeight: 500 }}>
                  {(activity.data as Venue).name}
                </span>
              </div>
            ) : (
              <div>
                <span style={{ marginRight: '0.4rem' }}>⭐</span>
                <span style={{ color: '#E8B86D', fontWeight: 500 }}>
                  {(activity.data as Rating).rating}★
                </span>
                <span style={{ color: '#9B8FAD' }}> visit logged</span>
                {(activity.data as Rating).comment && (
                  <div style={{
                    marginTop: '0.25rem',
                    color: '#F0EAD6',
                    fontStyle: 'italic',
                    fontSize: '0.78rem',
                    paddingLeft: '1.4rem',
                  }}>
                    "{(activity.data as Rating).comment}"
                  </div>
                )}
              </div>
            )}
            <div style={{ fontSize: '0.72rem', color: '#9B8FAD', marginTop: '0.3rem', paddingLeft: '1.4rem' }}>
              {date} · {time}
            </div>
          </div>
        );
      })}
    </div>
  );
}