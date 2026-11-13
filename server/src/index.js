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

app.get('/api/subjects/:id/flashcards',requireAuth,async(req,res,next)=>{try{const own=await pool.query('SELECT id FROM subjects WHERE id=$1 AND user_id=$2',[req.params.id,req.user.id]);if(!own.rowCount)return res.status(404).json({error:'Matière introuvable.'});const r=await pool.query('SELECT id,note_id,front,back,times_seen,times_wrong,last_result,created_at FROM flashcards WHERE subject_id=$1 AND user_id=$2 ORDER BY created_at DESC',[req.params.id,req.user.id]);res.json({flashcards:r.rows});}catch(e){next(e);}});
app.post('/api/subjects/:id/flashcards',requireAuth,async(req,res,next)=>{try{const {front,back,noteId}=req.body;if(!String(front||'').trim()||!String(back||'').trim())return res.status(400).json({error:'Question et réponse obligatoires.'});const own=await pool.query('SELECT id FROM subjects WHERE id=$1 AND user_id=$2',[req.params.id,req.user.id]);if(!own.rowCount)return res.status(404).json({error:'Matière introuvable.'});if(noteId){const note=await pool.query('SELECT id FROM notes WHERE id=$1 AND subject_id=$2 AND user_id=$3',[noteId,req.params.id,req.user.id]);if(!note.rowCount)return res.status(404).json({error:'Leçon introuvable.'});}const r=await pool.query('INSERT INTO flashcards(user_id,subject_id,note_id,front,back) VALUES($1,$2,$3,$4,$5) RETURNING *',[req.user.id,req.params.id,noteId||null,String(front).trim(),String(back).trim()]);res.status(201).json({flashcard:r.rows[0]});}catch(e){next(e);}});
app.post('/api/flashcards/:id/review',requireAuth,async(req,res,next)=>{try{const correct=Boolean(req.body.correct);const r=await pool.query('UPDATE flashcards SET times_seen=times_seen+1,times_wrong=times_wrong+$3,last_result=$4 WHERE id=$1 AND user_id=$2 RETURNING id,times_seen,times_wrong,last_result',[req.params.id,req.user.id,correct?0:1,correct]);if(!r.rowCount)return res.status(404).json({error:'Fiche introuvable.'});res.json({flashcard:r.rows[0]});}catch(e){next(e);}});
app.delete('/api/flashcards/:id',requireAuth,async(req,res,next)=>{try{const r=await pool.query('DELETE FROM flashcards WHERE id=$1 AND user_id=$2 RETURNING id',[req.params.id,req.user.id]);if(!r.rowCount)return res.status(404).json({error:'Fiche introuvable.'});res.json({ok:true});}catch(e){next(e);}});

const STOP_WORDS=new Set('alors au aucun aucune aussi autre aux avec avoir bon car ce cela ces ceux chaque ci comme comment dans des du dedans dehors depuis deux devrait doit donc elle elles en encore est et eu fait faites fois font hors ici il ils je juste la le les leur lui ma mais me même mes moi moins mon ne ni notre nous on ou où par parce pas peut peu plupart pour pourquoi quand que quel quelle quelles quels qui sa sans se ses seulement si sien son sont sous soyez sujet sur ta tandis tellement tels tes ton tous tout toute toutes très trop tu un une vos votre vous y'.split(/\s+/));
function makeQuizFromText(text,title){
 const sentences=String(text||'').replace(/\s+/g,' ').split(/(?<=[.!?;])\s+/).map(s=>s.trim()).filter(s=>s.length>=35&&s.length<=360);
 const candidates=[];
 for(const sentence of sentences){
  const words=sentence.match(/[A-Za-zÀ-ÿ0-9-]{5,}/g)||[];
  const counts={};
  for(const word of words){const key=word.toLocaleLowerCase('fr');if(!STOP_WORDS.has(key)&&!/^\d+$/.test(key))counts[key]=(counts[key]||0)+1;}
  const key=Object.keys(counts).sort((a,b)=>b.length-a.length)[0];
  if(!key)continue;
  const original=words.find(word=>word.toLocaleLowerCase('fr')===key);
  if(original)candidates.push({sentence,original,key});
 }
 const unique=[];const seen=new Set();
 for(const item of candidates){if(!seen.has(item.key)){seen.add(item.key);unique.push(item);}}
 const pool=unique.map(item=>item.original);
 const questions=[];
 for(const item of unique){
  const distractors=pool.filter(word=>word.toLocaleLowerCase('fr')!==item.key).slice(0,3);
  if(distractors.length<3)continue;
  const choices=[item.original,...distractors].sort((x,y)=>x.localeCompare(y,'fr'));
  const position=item.sentence.toLocaleLowerCase('fr').indexOf(item.original.toLocaleLowerCase('fr'));
  const context=item.sentence.slice(0,position)+'________'+item.sentence.slice(position+item.original.length);
  questions.push({prompt:'Quel terme complète correctement cette phrase du cours ?',context,options:choices,correct:choices.indexOf(item.original),explanation:'Le terme attendu est « '+item.original+' ». Il apparaît dans la phrase extraite de ta leçon.'});
  if(questions.length>=8)break;
 }
 if(questions.length<1)throw Object.assign(new Error('Cette leçon ne contient pas assez de phrases et de termes distincts pour créer un QCM. Ajoute un cours plus détaillé.'),{status:422});
 return {title:'QCM — '+title,questions,source:'extraction'};
}
app.post('/api/subjects/:id/notes/:noteId/quiz',requireAuth,async(req,res,next)=>{try{
 const r=await pool.query('SELECT n.id,n.title,n.content FROM notes n JOIN subjects s ON s.id=n.subject_id WHERE n.id=$1 AND n.subject_id=$2 AND n.user_id=$3 AND s.user_id=$3',[req.params.noteId,req.params.id,req.user.id]);
 if(!r.rowCount)return res.status(404).json({error:'Leçon introuvable.'});
 const quiz=makeQuizFromText(r.rows[0].content,r.rows[0].title);
 res.json({quiz:{...quiz,subjectId:req.params.id,noteId:r.rows[0].id}});
 }catch(e){if(e.status)return res.status(e.status).json({error:e.message});next(e);}});

app.get('/api/quiz-attempts',requireAuth,async(req,res,next)=>{try{const r=await pool.query('SELECT id,subject_id,note_id,title,score,total,answers,created_at FROM quiz_attempts WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50',[req.user.id]);res.json({attempts:r.rows});}catch(e){next(e);}});
app.post('/api/quiz-attempts',requireAuth,async(req,res,next)=>{try{const {subjectId,noteId,title,score,total,answers=[]}=req.body;const s=Number(score),t=Number(total);if(!String(title||'').trim()||!Number.isInteger(s)||!Number.isInteger(t)||t<1||s<0||s>t||!Array.isArray(answers))return res.status(400).json({error:'Résultat de QCM invalide.'});if(subjectId){const own=await pool.query('SELECT id FROM subjects WHERE id=$1 AND user_id=$2',[subjectId,req.user.id]);if(!own.rowCount)return res.status(404).json({error:'Matière introuvable.'});}const r=await pool.query('INSERT INTO quiz_attempts(user_id,subject_id,note_id,title,score,total,answers) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,title,score,total,answers,created_at',[req.user.id,subjectId||null,noteId||null,String(title).trim(),s,t,JSON.stringify(answers)]);res.status(201).json({attempt:r.rows[0]});}catch(e){next(e);}});

app.use((err,_req,res,_next)=>{console.error(err);res.status(500).json({error:'Erreur serveur. Vérifie la configuration et réessaie.'});});
const port=Number(process.env.PORT)||4000;
app.listen(port,()=>console.log('RéviseBac API démarrée sur le port '+port));
