import admin from 'firebase-admin';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  try {
    const filePath = resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    serviceAccount = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    throw new Error('Impossible de lire le fichier de compte de service Firebase. Vérifie FIREBASE_SERVICE_ACCOUNT_PATH.');
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON doit contenir un JSON valide.');
  }
} else {
  throw new Error('Configure FIREBASE_SERVICE_ACCOUNT_PATH ou FIREBASE_SERVICE_ACCOUNT_JSON sur le serveur.');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}
export const adminAuth = admin.auth();
export const db = admin.firestore();
