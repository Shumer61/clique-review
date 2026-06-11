// src/services/venues.ts
import { 
  collection, 
  doc, 
  addDoc,
  deleteDoc,
  updateDoc,
  getDocs, 
  query, 
  where, 
  Timestamp,
  GeoPoint,
  orderBy,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  writeBatch
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

// ─── Venues ───────────────────────────────────────────────────────────────────

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

/**
 * Delete a venue and ALL its ratings in a single batch.
 * Only call after confirming current user is the owner (addedBy).
 */
export async function deleteVenue(venueId: string): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'venues', venueId));
  const ratingsSnap = await getDocs(
    query(collection(db, 'ratings'), where('venueId', '==', venueId))
  );
  ratingsSnap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

export async function getCliqueVenues(cliqueId: string): Promise<Venue[]> {
  const q = query(
    collection(db, 'venues'),
    where('addedByCliqueId', '==', cliqueId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Venue));
}

export function listenToCliqueVenues(
  cliqueId: string,
  callback: (venues: Venue[]) => void
): () => void {
  const q = query(
    collection(db, 'venues'),
    where('addedByCliqueId', '==', cliqueId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Venue));
  });
}

// ─── Ratings ──────────────────────────────────────────────────────────────────

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

/**
 * Delete a single rating.
 * Only call after confirming current user is the owner (userId).
 */
export async function deleteRating(ratingId: string): Promise<void> {
  await deleteDoc(doc(db, 'ratings', ratingId));
}

/**
 * Update just the comment field on an existing rating.
 * Pass undefined to clear the comment entirely.
 * Only call after confirming current user is the owner (userId).
 */
export async function updateRatingComment(
  ratingId: string,
  comment: string | undefined
): Promise<void> {
  await updateDoc(doc(db, 'ratings', ratingId), {
    comment: comment ?? null,
  });
}

export async function getCliqueRatings(cliqueId: string): Promise<Rating[]> {
  const q = query(
    collection(db, 'ratings'),
    where('cliqueId', '==', cliqueId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Rating));
}

export function listenToCliqueRatings(
  cliqueId: string,
  callback: (ratings: Rating[]) => void
): () => void {
  const q = query(
    collection(db, 'ratings'),
    where('cliqueId', '==', cliqueId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Rating));
  });
}