import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';
import { requireAuth, signToken } from './auth.js';

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET est obligatoire.');
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit:'1mb' }));
app.get('/api/health', (_req,res)=>res.json({ status:'ok', service:'revisebac-api' }));

app.post('/api/auth/register', async (req,res,next)=>{
 try {
  const { name,email,password } = req.body;
  if (!name?.trim() || !email?.trim() || typeof password !== 'string' || password.length < 8) return res.status(400).json({error:'Nom, e-mail et mot de passe de 8 caractères minimum requis.'});
  const hash = await bcrypt.hash(password,12);
  const result = await pool.query('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email',[name.trim(),email.trim().toLowerCase(),hash]);
  const user=result.rows[0]; res.status(201).json({ user, token:signToken(user) });
 } catch(e) { if(e.code==='23505') return res.status(409).json({error:'Cette adresse e-mail possède déjà un compte.'}); next(e); }
});
app.post('/api/auth/login', async (req,res,next)=>{
 try {
  const {email,password}=req.body;
  const result=await pool.query('SELECT id,name,email,password_hash FROM users WHERE email=$1',[String(email||'').toLowerCase()]);
  const row=result.rows[0];
  if(!row || !await bcrypt.compare(password||'',row.password_hash)) return res.status(401).json({error:'E-mail ou mot de passe incorrect.'});
  const user={id:row.id,name:row.name,email:row.email}; res.json({user,token:signToken(user)});
 } catch(e){next(e);}
});
app.get('/api/auth/me',requireAuth,async(req,res,next)=>{try{const r=await pool.query('SELECT id,name,email FROM users WHERE id=$1',[req.user.id]);if(!r.rows[0])return res.status(404).json({error:'Compte introuvable.'});res.json({user:r.rows[0]});}catch(e){next(e);}});

app.get('/api/subjects',requireAuth,async(req,res,next)=>{try{const r=await pool.query('SELECT s.*,COUNT(n.id)::int AS lesson_count FROM subjects s LEFT JOIN notes n ON n.subject_id=s.id WHERE s.user_id=$1 GROUP BY s.id ORDER BY s.created_at DESC',[req.user.id]);res.json({subjects:r.rows});}catch(e){next(e);}});
app.post('/api/subjects',requireAuth,async(req,res,next)=>{try{const name=String(req.body.name||'').trim();if(!name)return res.status(400).json({error:'Le nom de la matière est obligatoire.'});const r=await pool.query('INSERT INTO subjects(user_id,name,emoji) VALUES($1,$2,$3) RETURNING *',[req.user.id,name,'📘']);res.status(201).json({subject:r.rows[0]});}catch(e){next(e);}});
app.delete('/api/subjects/:id',requireAuth,async(req,res,next)=>{try{const r=await pool.query('DELETE FROM subjects WHERE id=$1 AND user_id=$2 RETURNING id',[req.params.id,req.user.id]);if(!r.rowCount)return res.status(404).json({error:'Matière introuvable.'});res.json({ok:true});}catch(e){next(e);}});
app.get('/api/subjects/:id/notes',requireAuth,async(req,res,next)=>{try{const r=await pool.query('SELECT id,title,content,created_at FROM notes WHERE subject_id=$1 AND user_id=$2 ORDER BY created_at DESC',[req.params.id,req.user.id]);res.json({notes:r.rows});}catch(e){next(e);}});
app.post('/api/subjects/:id/notes',requireAuth,async(req,res,next)=>{try{const {title,content}=req.body;if(!String(title||'').trim()||!String(content||'').trim())return res.status(400).json({error:'Titre et contenu obligatoires.'});const own=await pool.query('SELECT id FROM subjects WHERE id=$1 AND user_id=$2',[req.params.id,req.user.id]);if(!own.rowCount)return res.status(404).json({error:'Matière introuvable.'});const r=await pool.query('INSERT INTO notes(subject_id,user_id,title,content) VALUES($1,$2,$3,$4) RETURNING *',[req.params.id,req.user.id,String(title).trim(),String(content).trim()]);res.status(201).json({note:r.rows[0]});}catch(e){next(e);}});
app.use((err,_req,res,_next)=>{console.error(err);res.status(500).json({error:'Erreur serveur. Vérifie la configuration et réessaie.'});});
const port=Number(process.env.PORT)||4000;
app.listen(port,()=>console.log('RéviseBac API démarrée sur le port '+port));
