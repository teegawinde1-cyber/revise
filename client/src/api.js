import { auth, firebaseConfigured } from './firebase';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const getToken = () => auth?.currentUser ? 'firebase-authenticated' : null;
export const setToken = value => { if (!value && auth) import('firebase/auth').then(({ signOut }) => signOut(auth)); };
export async function request(path, options = {}) {
  if (!firebaseConfigured || !auth) throw new Error('Firebase n’est pas encore configuré. Renseigne les variables VITE_FIREBASE_* dans client/.env.');
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = 'Bearer ' + token;
  const response = await fetch(API + path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Une erreur est survenue.');
  return data;
}
