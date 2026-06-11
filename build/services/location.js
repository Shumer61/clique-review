import { doc, setDoc, deleteDoc, collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
// Save or update user's location
export async function setUserLocation(userId, cliqueId, lat, lng, color) {
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
export async function deleteUserLocation(userId) {
    const locationRef = doc(db, 'userLocations', userId);
    await deleteDoc(locationRef);
}
// Real‑time listener for locations of all members in a clique
export function listenToCliqueLocations(cliqueId, callback) {
    const q = query(collection(db, 'userLocations'), where('cliqueId', '==', cliqueId));
    return onSnapshot(q, (snapshot) => {
        const locations = snapshot.docs.map(doc => doc.data());
        callback(locations);
    });
}
