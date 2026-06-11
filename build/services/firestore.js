import { collection, doc, addDoc, getDoc, getDocs, updateDoc, arrayUnion, query, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
// Generate a random 6-character invite code (uppercase letters + numbers)
function generateInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}
// Create a new clique
export async function createClique(name, ownerId) {
    const inviteCode = generateInviteCode();
    const cliqueData = {
        name,
        ownerId,
        members: [ownerId],
        inviteCode,
        createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, 'cliques'), cliqueData);
    return { id: docRef.id, inviteCode };
}
// Get a clique by invite code
export async function getCliqueByInviteCode(inviteCode) {
    const q = query(collection(db, 'cliques'), where('inviteCode', '==', inviteCode));
    const snapshot = await getDocs(q);
    if (snapshot.empty)
        return null;
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
}
// Join a clique
export async function joinClique(cliqueId, userId) {
    const cliqueRef = doc(db, 'cliques', cliqueId);
    await updateDoc(cliqueRef, {
        members: arrayUnion(userId),
    });
}
// Get all cliques a user belongs to
export async function getUserCliques(userId) {
    const q = query(collection(db, 'cliques'), where('members', 'array-contains', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
// Get a single clique by ID
export async function getCliqueById(cliqueId) {
    const docRef = doc(db, 'cliques', cliqueId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists())
        return null;
    return { id: snapshot.id, ...snapshot.data() };
}
