import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';

export interface StatusMessage {
  id?: string;
  userId: string;
  cliqueId: string;
  venueId?: string;          // optional, if posted at a venue
  lat: number;
  lng: number;
  text: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;      // 4 hours after creation
}

// Post a new status message
export async function postStatus(
  userId: string,
  cliqueId: string,
  lat: number,
  lng: number,
  text: string,
  venueId?: string
): Promise<string> {
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromDate(new Date(now.toDate().getTime() + 4 * 60 * 60 * 1000));
  const statusData: Omit<StatusMessage, 'id'> = {
    userId,
    cliqueId,
    venueId,
    lat,
    lng,
    text,
    createdAt: now,
    expiresAt,
  };
  const docRef = await addDoc(collection(db, 'statusMessages'), statusData);
  return docRef.id;
}

// Real‑time listener for status messages in a clique (non‑expired)
export function listenToStatusMessages(
  cliqueId: string,
  callback: (messages: StatusMessage[]) => void
): Unsubscribe {
  const now = Timestamp.now();
  const q = query(
    collection(db, 'statusMessages'),
    where('cliqueId', '==', cliqueId),
    where('expiresAt', '>', now),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as StatusMessage);
    callback(messages);
  });
}