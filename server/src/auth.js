const DEVICE_ID_PATTERN = /^[a-zA-Z0-9-]{12,80}$/;
export function requireAuth(req,res,next) {
 const id=String(req.headers['x-revisebac-device']||'');
 if(!DEVICE_ID_PATTERN.test(id)) return res.status(400).json({error:'Identifiant de cet appareil invalide. Recharge la page.'});
 req.user={id:'device_'+id,name:'Élève',email:'',phoneNumber:''};
 next();
}
