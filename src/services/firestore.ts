import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  arrayUnion, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface Clique {
  id?: string;
  name: string;
  ownerId: string;
  members: string[];
  inviteCode: string;
  createdAt: Timestamp;
}

// Generate a random 6-character invite code (uppercase letters + numbers)
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new clique
export async function createClique(name: string, ownerId: string): Promise<{ id: string; inviteCode: string }> {
  const inviteCode = generateInviteCode();
  const cliqueData: Omit<Clique, 'id'> = {
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
export async function getCliqueByInviteCode(inviteCode: string): Promise<Clique | null> {
  const q = query(collection(db, 'cliques'), where('inviteCode', '==', inviteCode));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Clique;
}

// Join a clique
export async function joinClique(cliqueId: string, userId: string): Promise<void> {
  const cliqueRef = doc(db, 'cliques', cliqueId);
  await updateDoc(cliqueRef, {
    members: arrayUnion(userId),
  });
}

// Get all cliques a user belongs to
export async function getUserCliques(userId: string): Promise<Clique[]> {
  const q = query(collection(db, 'cliques'), where('members', 'array-contains', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Clique));
}

// Get a single clique by ID
export async function getCliqueById(cliqueId: string): Promise<Clique | null> {
  const docRef = doc(db, 'cliques', cliqueId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Clique;
}