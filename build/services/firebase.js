// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Your Firebase config (replace with your actual config from Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyAD2KJuEDkBWnd_CwY10afV2YBr71FhqVY",
    authDomain: "reviews-app-c7c3c.firebaseapp.com",
    projectId: "reviews-app-c7c3c",
    storageBucket: "reviews-app-c7c3c.firebasestorage.app",
    messagingSenderId: "863519135042",
    appId: "1:863519135042:web:0d47b43eaf7941c7c264db",
    measurementId: "G-4N41RV8YDD"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Auth functions
export async function signUp(email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}
export async function logIn(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}
export async function logOut() {
    await signOut(auth);
}
export function onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
}
