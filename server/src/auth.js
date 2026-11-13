import { adminAuth } from './firebaseAdmin.js';
export async function requireAuth(req,res,next) {
 const header=req.headers.authorization||'';
 const token=header.startsWith('Bearer ')?header.slice(7):'';
 if(!token)return res.status(401).json({error:'Connecte-toi pour continuer.'});
 try { const decoded=await adminAuth.verifyIdToken(token);req.user={id:decoded.uid,email:decoded.email||'',name:decoded.name||'',phoneNumber:decoded.phone_number||''};next(); }
 catch { return res.status(401).json({error:'Session Firebase expirée. Reconnecte-toi.'}); }
}
