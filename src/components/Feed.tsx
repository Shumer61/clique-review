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

    // Listen to new venues – show latest 10
    const unsubVenues = listenToCliqueVenues(currentClique.id, (venues) => {
      const newVenueActivities: ActivityItem[] = venues.slice(0, 10).map(v => ({
        id: v.id!,
        type: 'venue_added',
        data: v,
        timestamp: v.createdAt,
      }));
      setActivities(prev => {
        const other = prev.filter(a => a.type !== 'venue_added');
        return [...newVenueActivities, ...other].sort((a,b) => b.timestamp.seconds - a.timestamp.seconds);
      });
    });

    // Listen to new ratings – show latest 10
    const unsubRatings = listenToCliqueRatings(currentClique.id, (ratings) => {
      const newRatingActivities: ActivityItem[] = ratings.slice(0, 10).map(r => ({
        id: r.id!,
        type: 'rating_added',
        data: r,
        timestamp: r.createdAt,
      }));
      setActivities(prev => {
        const other = prev.filter(a => a.type !== 'rating_added');
        return [...newRatingActivities, ...other].sort((a,b) => b.timestamp.seconds - a.timestamp.seconds);
      });
    });

    return () => {
      unsubVenues();
      unsubRatings();
    };
  }, [currentClique]);

  if (!currentClique) return null;

  const getVenueName = async (venueId: string): Promise<string> => {
    // For simplicity, we don't fetch venue name here. Could be added later.
    return "a venue";
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '280px',
      height: '100vh',
      background: 'white',
      boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '1rem',
      pointerEvents: 'auto'
    }}>
      <h2 style={{ fontSize: '1.2rem', marginTop: 0 }}>Recent Activity</h2>
      {activities.length === 0 && <p>No activity yet.</p>}
      {activities.map(activity => (
        <div key={activity.id} style={{
          borderBottom: '1px solid #eee',
          padding: '0.75rem 0',
          fontSize: '0.85rem'
        }}>
          {activity.type === 'venue_added' && (
            <div>📍 New venue: <strong>{(activity.data as Venue).name}</strong> added</div>
          )}
          {activity.type === 'rating_added' && (
            <div>⭐ <strong>{(activity.data as Rating).rating}★</strong> rating logged</div>
          )}
          <div style={{ fontSize: '0.7rem', color: '#888' }}>
            {new Date(activity.timestamp.seconds * 1000).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}