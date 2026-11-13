import admin from 'firebase-admin';
if(!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON est obligatoire sur le serveur.');
let serviceAccount;
try { serviceAccount=JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON); }
catch { throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON doit contenir un JSON valide.'); }
if(!admin.apps.length) admin.initializeApp({credential:admin.credential.cert(serviceAccount),projectId:serviceAccount.project_id});
export const adminAuth=admin.auth();
export const db=admin.firestore();
