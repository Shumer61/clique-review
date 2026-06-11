// src/services/venues.ts
import { collection, doc, addDoc, deleteDoc, updateDoc, getDocs, query, where, Timestamp, GeoPoint, orderBy, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
// ─── Venues ───────────────────────────────────────────────────────────────────
export async function addVenue(name, address, lat, lng, addedBy, addedByCliqueId) {
    const venueData = {
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
export async function deleteVenue(venueId) {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'venues', venueId));
    const ratingsSnap = await getDocs(query(collection(db, 'ratings'), where('venueId', '==', venueId)));
    ratingsSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
}
export async function getCliqueVenues(cliqueId) {
    const q = query(collection(db, 'venues'), where('addedByCliqueId', '==', cliqueId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
export function listenToCliqueVenues(cliqueId, callback) {
    const q = query(collection(db, 'venues'), where('addedByCliqueId', '==', cliqueId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
}
// ─── Ratings ──────────────────────────────────────────────────────────────────
export async function addRating(venueId, cliqueId, userId, rating, tags, comment, visitedDate) {
    const ratingData = {
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
export async function deleteRating(ratingId) {
    await deleteDoc(doc(db, 'ratings', ratingId));
}
/**
 * Update just the comment field on an existing rating.
 * Pass undefined to clear the comment entirely.
 * Only call after confirming current user is the owner (userId).
 */
export async function updateRatingComment(ratingId, comment) {
    await updateDoc(doc(db, 'ratings', ratingId), {
        comment: comment ?? null,
    });
}
export async function getCliqueRatings(cliqueId) {
    const q = query(collection(db, 'ratings'), where('cliqueId', '==', cliqueId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
export function listenToCliqueRatings(cliqueId, callback) {
    const q = query(collection(db, 'ratings'), where('cliqueId', '==', cliqueId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
}
