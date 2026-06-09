import { 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserLocation {
  userId: string;
  cliqueId: string;
  lat: number;
  lng: number;
  color: string;       // hex colour for the avatar circle
  updatedAt: Timestamp;
}

// Save or update user's location
export async function setUserLocation(
  userId: string,
  cliqueId: string,
  lat: number,
  lng: number,
  color: string
): Promise<void> {
  const locationRef = doc(db, 'userLocations', userId);
  await setDoc(locationRef, {
    userId,
    cliqueId,
    lat,
    lng,
    color,
    updatedAt: Timestamp.now(),
  });
}

// Delete user's location (when toggling off or logging out)
export async function deleteUserLocation(userId: string): Promise<void> {
  const locationRef = doc(db, 'userLocations', userId);
  await deleteDoc(locationRef);
}

// Real‑time listener for locations of all members in a clique
export function listenToCliqueLocations(
  cliqueId: string,
  callback: (locations: UserLocation[]) => void
): Unsubscribe {
  const q = query(collection(db, 'userLocations'), where('cliqueId', '==', cliqueId));
  return onSnapshot(q, (snapshot) => {
    const locations = snapshot.docs.map(doc => doc.data() as UserLocation);
    callback(locations);
  });
}