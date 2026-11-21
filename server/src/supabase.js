import { createClient } from '@supabase/supabase-js';

const url=process.env.SUPABASE_URL;
const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!serviceKey)throw new Error('Configure SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans server/.env. La clé service_role doit rester secrète et côté serveur uniquement.');
export const supabase=createClient(url,serviceKey,{auth:{autoRefreshToken:false,persistSession:false}});
