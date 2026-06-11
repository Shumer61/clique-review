import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
export async function postStatus(userId, cliqueId, lat, lng, text, venueId) {
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromDate(new Date(now.toDate().getTime() + 4 * 60 * 60 * 1000));
    await addDoc(collection(db, 'statusMessages'), {
        userId,
        cliqueId,
        venueId: venueId || null,
        lat,
        lng,
        text,
        createdAt: now,
        expiresAt,
    });
    return 'ok';
}
export function listenToStatusMessages(cliqueId, callback) {
    const q = query(collection(db, 'statusMessages'), where('cliqueId', '==', cliqueId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const now = new Date();
        const valid = all.filter(msg => msg.expiresAt.toDate() > now);
        callback(valid);
    });
}
