import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  GeoPoint,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';

export interface Venue {
  id?: string;
  name: string;
  address: string;
  location: GeoPoint;
  addedBy: string;
  addedByCliqueId: string;
  createdAt: Timestamp;
}

export interface Rating {
  id?: string;
  venueId: string;
  cliqueId: string;
  userId: string;
  rating: number;
  tags: string[];
  comment?: string;
  visitedDate: Timestamp;
  createdAt: Timestamp;
}

// Add a new venue
export async function addVenue(
  name: string,
  address: string,
  lat: number,
  lng: number,
  addedBy: string,
  addedByCliqueId: string
): Promise<string> {
  const venueData: Omit<Venue, 'id'> = {
    name,
    address,
    location: new GeoPoint(lat, lng),
    addedBy,
    addedByCliqueId,
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, 'venues'), venueData);
  return docRef.id;
}

// Get all venues for a specific clique
export async function getCliqueVenues(cliqueId: string): Promise<Venue[]> {
  console.log('[venues] getCliqueVenues querying for cliqueId:', cliqueId);
  const q = query(collection(db, 'venues'), where('addedByCliqueId', '==', cliqueId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  console.log('[venues] query snapshot size:', snapshot.size);
  snapshot.forEach(doc => console.log('[venues] doc:', doc.id, doc.data()));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venue));
}

// Add a rating for a venue
export async function addRating(
  venueId: string,
  cliqueId: string,
  userId: string,
  rating: number,
  tags: string[],
  comment: string | undefined,
  visitedDate: Date
): Promise<string> {
  const ratingData: Omit<Rating, 'id'> = {
    venueId,
    cliqueId,
    userId,
    rating,
    tags,
    comment,
    visitedDate: Timestamp.fromDate(visitedDate),
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, 'ratings'), ratingData);
  return docRef.id;
}

// Get all ratings for venues in a clique
export async function getCliqueRatings(cliqueId: string): Promise<Rating[]> {
  const q = query(collection(db, 'ratings'), where('cliqueId', '==', cliqueId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rating));
}