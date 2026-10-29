import {SignJWT,jwtVerify} from 'jose';
const enc=new TextEncoder();
const COOKIE='__Host-2see_session';
const HOURS=4*60*60;
export class LoginError extends Error{constructor(status,message){super(message);this.status=status;}}
const reject=(status,message)=>{throw new LoginError(status,message);};
const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8',...headers}});
function configured(env){if(typeof env.ADMIN_PASSWORD!=='string'||env.ADMIN_PASSWORD.length<24||env.ADMIN_PASSWORD.length>256)reject(503,'بقي تعيين كلمة مرور لوحة 2SEE في إعدادات الخدمة');}
async function key(env){configured(env);return new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode('2see-session-v1\0'+env.ADMIN_PASSWORD)));}
export async function verifyPasswordSession(req,env){
 const secret=await key(env);
 const values=(req.headers.get('Cookie')||'').split(';').map(s=>s.trim()).filter(s=>s.startsWith(COOKIE+'='));
 if(values.length!==1)reject(401,'سجّلي الدخول إلى لوحة 2SEE');
 const token=values[0].slice(COOKIE.length+1);
 try{
  const {payload}=await jwtVerify(token,secret,{algorithms:['HS256'],issuer:'2SEE-admin',audience:new URL(req.url).origin,requiredClaims:['exp','iat','sub','jti'],maxTokenAge:HOURS});
  if(payload.sub!=='2SEE')throw Error('Invalid account');
  return {name:'2SEE',email:'2SEE',sub:payload.sub};
 }catch{reject(401,'جلسة الدخول انتهت؛ سجّلي الدخول مجدداً');}
}
function sameOrigin(req){const u=new URL(req.url);if(u.protocol!=='https:'||req.headers.get('origin')!==u.origin||req.headers.get('x-2see-admin')!=='1')reject(403,'طلب من مصدر غير مسموح');}
async function input(req){
 if(req.headers.get('content-type')?.split(';')[0]!=='application/json')reject(415,'JSON required');
 const reader=req.body?.getReader();if(!reader)reject(400,'بيانات الدخول مفقودة');
 let size=0;const parts=[];while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();reject(413,'الطلب أكبر من المسموح');}parts.push(value);}
 const bytes=new Uint8Array(size);let at=0;for(const part of parts){bytes.set(part,at);at+=part.length;}
 try{const data=JSON.parse(new TextDecoder().decode(bytes));if(!data||typeof data!=='object')throw Error();return data;}catch{reject(400,'بيانات الدخول غير صالحة');}
}
export async function passwordRoute(req,env){
 const u=new URL(req.url);
 if(['/login','/login.html','/assets/js/login.js'].includes(u.pathname)){
  if(!['GET','HEAD'].includes(req.method))reject(405,'Method not allowed');
  if(u.pathname!=='/assets/js/login.js')u.pathname='/login.html';
  return env.ASSETS.fetch(new Request(u,req));
 }
 if(!['/api/login','/api/logout'].includes(u.pathname))return null;
 if(req.method!=='POST')reject(405,'POST required');sameOrigin(req);
 if(u.pathname==='/api/logout')return json({ok:true},200,{'Set-Cookie':`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`});
 configured(env);
 // The bindings are mandatory; failure never falls back to unlimited attempts.
 if(!env.LOGIN_LIMITER||!env.LOGIN_GLOBAL_LIMITER)reject(503,'حماية محاولات الدخول غير مهيأة');
 const ip=req.headers.get('CF-Connecting-IP')||'unknown';
 const perIP=await env.LOGIN_LIMITER.limit({key:'2see-login:'+ip});
 const global=await env.LOGIN_GLOBAL_LIMITER.limit({key:'2see-login'});
 if(!perIP.success||!global.success)return json({error:'محاولات كثيرة؛ انتظري دقيقة ثم أعيدي المحاولة'},429,{'Retry-After':'60'});
 const data=await input(req);
 if(typeof data.username!=='string'||typeof data.password!=='string'||data.password.length>256)reject(401,'اسم الحساب أو كلمة المرور غير صحيحة');
 const a=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(data.password)));
 const b=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(env.ADMIN_PASSWORD)));
 let difference=0;for(let i=0;i<a.length;i++)difference|=a[i]^b[i];
 if(data.username.toLowerCase()!=='2see'||difference!==0)reject(401,'اسم الحساب أو كلمة المرور غير صحيحة');
 const token=await new SignJWT({}).setProtectedHeader({alg:'HS256',typ:'JWT'}).setIssuer('2SEE-admin').setAudience(u.origin).setSubject('2SEE').setJti(crypto.randomUUID()).setIssuedAt().setExpirationTime(Math.floor(Date.now()/1000)+HOURS).sign(await key(env));
 return json({ok:true},200,{'Set-Cookie':`${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${HOURS}`});
}
