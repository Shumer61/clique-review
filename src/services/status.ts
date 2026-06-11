// src/services/status.ts
import {
  collection, addDoc, deleteDoc, doc,
  query, where, orderBy, onSnapshot,
  Timestamp, Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';

export interface StatusMessage {
  id?: string;
  userId: string;
  cliqueId: string;
  venueId?: string;
  lat: number;
  lng: number;
  text: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

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
  await addDoc(collection(db, 'statusMessages'), {
    userId,
    cliqueId,
    venueId: venueId ?? null,
    lat,
    lng,
    text,
    createdAt: now,
    expiresAt,
  });
  return 'ok';
}

/**
 * Delete a status message.
 * Only call after confirming current user is the owner (userId).
 */
export async function deleteStatus(statusId: string): Promise<void> {
  await deleteDoc(doc(db, 'statusMessages', statusId));
}

export function listenToStatusMessages(
  cliqueId: string,
  callback: (messages: StatusMessage[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'statusMessages'),
    where('cliqueId', '==', cliqueId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as StatusMessage);
    const now = new Date();
    callback(all.filter(msg => msg.expiresAt.toDate() > now));
  });
}