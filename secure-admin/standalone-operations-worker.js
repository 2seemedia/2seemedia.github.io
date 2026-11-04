import monitoring from './standalone-monitoring-worker.js';
// Assets are embedded by build-standalone-operations.mjs; no website CMS dependency.
import {PAGE, APP, STYLE} from './standalone-operations-assets.generated.js';
export const SCHEMA = [
`CREATE TABLE IF NOT EXISTS ops_records (id TEXT PRIMARY KEY, kind TEXT NOT NULL, client_id TEXT, data TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, mutation_id TEXT NOT NULL)`,
`CREATE INDEX IF NOT EXISTS ops_records_scope ON ops_records(kind,client_id)`,
`CREATE TABLE IF NOT EXISTS ops_audit (id TEXT PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, record_id TEXT NOT NULL, kind TEXT NOT NULL, client_id TEXT, created_at TEXT NOT NULL, detail TEXT NOT NULL)`,
`CREATE TABLE IF NOT EXISTS ops_login_limits (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires_at INTEGER NOT NULL)`
];
const TYPES = new Set(['clients','contracts','content','tasks','payments']);
const fields = {
 clients:['name','handle','platforms','voice','audience','services','constraints','notes','archived'],
 contracts:['name','start','end','reels','posts','stories','fee','currency','notes','file_url','archived'],
 content:['title','type','platform','scheduled_at','status','caption','script','asset_url','published_url','owner','notes','contract_id'],
 tasks:['title','status','due','owner','notes','content_id'],
 payments:['amount','currency','date','reference','notes','contract_id','voided']
};
const enc = new TextEncoder(), COOKIE='__Host-2see_ops', TTL=4*60*60;
class ApiError extends Error { constructor(status,message){super(message);this.status=status;} }
const fail=(status,message)=>{throw new ApiError(status,message);};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8',...headers}});
function secure(response){const r=new Response(response.body,response);for(const [k,v] of Object.entries({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",'Permissions-Policy':'camera=(), microphone=(), geolocation=()'}))r.headers.set(k,v);return r;}
const configured=env=>typeof env.OPERATIONS_ADMIN_PASSWORD==='string'&&env.OPERATIONS_ADMIN_PASSWORD.length>=24&&env.OPERATIONS_ADMIN_PASSWORD.length<=256;
const base64=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const decode=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
async function key(env){return crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',enc.encode('2see-operations-v1\0'+env.OPERATIONS_ADMIN_PASSWORD)),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
async function token(env,origin){const body=base64(enc.encode(JSON.stringify({sub:'2SEE',aud:origin,exp:Math.floor(Date.now()/1000)+TTL,nonce:crypto.randomUUID()})));return body+'.'+base64(new Uint8Array(await crypto.subtle.sign('HMAC',await key(env),enc.encode(body))));}
async function authenticate(req,env){
 if(!configured(env))fail(503,'بقي تعيين كلمة مرور اللوحة المستقلة في Cloudflare (24 حرفاً على الأقل).');
 const cookies=(req.headers.get('Cookie')||'').split(';').map(s=>s.trim()).filter(s=>s.startsWith(COOKIE+'='));
 if(cookies.length!==1)fail(401,'سجّلي الدخول أولاً');
 try {const [body,sig,extra]=cookies[0].slice(COOKIE.length+1).split('.');if(extra||!body||!sig||body.length>1000)throw Error();if(!await crypto.subtle.verify('HMAC',await key(env),decode(sig),enc.encode(body)))throw Error();const p=JSON.parse(new TextDecoder().decode(decode(body)));if(p.sub!=='2SEE'||p.aud!==new URL(req.url).origin||!Number.isFinite(p.exp)||p.exp<=Date.now()/1000)throw Error();return p.sub;}catch{fail(401,'انتهت جلسة الدخول؛ سجّلي الدخول مجدداً');}
}
function originCheck(req){if(req.headers.get('origin')!==new URL(req.url).origin||req.headers.get('x-2see-ops')!=='1')fail(403,'طلب من مصدر غير مسموح');}
async function body(req){if(req.headers.get('content-type')?.split(';')[0]!=='application/json')fail(415,'JSON required');const reader=req.body?.getReader();if(!reader)fail(400,'الطلب فارغ');let size=0,s='';const decoder=new TextDecoder();while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>65536){await reader.cancel();fail(413,'الطلب كبير جداً');}s+=decoder.decode(value,{stream:true});}s+=decoder.decode();try{const out=JSON.parse(s);if(!out||typeof out!=='object'||Array.isArray(out))throw Error();return out;}catch{fail(400,'بيانات غير صالحة');}}
async function schema(db){await db.batch(SCHEMA.map(sql=>db.prepare(sql)));}
async function login(req,env){
 if(!configured(env))fail(503,'بقي تعيين OPERATIONS_ADMIN_PASSWORD في أسرار العامل المستقل (24 حرفاً على الأقل).');
 const now=Math.floor(Date.now()/1000),window=Math.floor(now/60),ip=req.headers.get('CF-Connecting-IP')||'unknown';
 const hash=base64(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(ip+env.OPERATIONS_ADMIN_PASSWORD))));
 const keys=['ip:'+hash+':'+window,'global:'+window];
 await env.OPERATIONS_DB.batch([env.OPERATIONS_DB.prepare('DELETE FROM ops_login_limits WHERE expires_at < ?').bind(now),...keys.map(k=>env.OPERATIONS_DB.prepare('INSERT INTO ops_login_limits (key,attempts,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=attempts+1').bind(k,now+120))]);
 const limits=await env.OPERATIONS_DB.prepare('SELECT key,attempts FROM ops_login_limits WHERE key IN (?,?)').bind(...keys).all();
 if(limits.results.some(x=>x.attempts>(x.key.startsWith('ip:')?8:60)))return json({error:'محاولات كثيرة؛ انتظري دقيقة'},429,{'Retry-After':'60'});
 const input=await body(req);if(typeof input.password!=='string'||input.password.length>256)fail(401,'بيانات الدخول غير صحيحة');
 const a=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(input.password))),b=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(env.OPERATIONS_ADMIN_PASSWORD)));let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];if(diff||String(input.username).toLowerCase()!=='2see')fail(401,'بيانات الدخول غير صحيحة');
 return json({ok:true},200,{'Set-Cookie':COOKIE+'='+await token(env,new URL(req.url).origin)+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+TTL});
}
function text(v,label,max=4000,required=false){if(typeof v!=='string'||v.length>max||(required&&!v.trim()))fail(422,'قيمة غير صالحة: '+label);return v.trim();}
function date(v,label,required=false){if(v===''&&!required)return '';if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v)))fail(422,'تاريخ غير صالح: '+label);return v;}
function amount(v,label,max=10000000){if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>max)fail(422,'رقم غير صالح: '+label);return v;}
function url(v){text(v,'الرابط',2000);if(v){let u;try{u=new URL(v);}catch{fail(422,'الرابط غير صالح');}if(u.protocol!=='https:'||u.username||u.password)fail(422,'استخدمي رابط HTTPS بدون بيانات دخول');}return v;}
function enumValue(v,options){if(!options.includes(v))fail(422,'حالة أو نوع غير صالح');return v;}
export function validate(kind,input){
 const d={};for(const name of fields[kind]){if(input[name]!==undefined)d[name]=input[name];}
 for(const [name,value] of Object.entries(d)){
  if(['archived','voided'].includes(name)){if(typeof value!=='boolean')fail(422,'قيمة غير صالحة');}
  else if(['fee','amount','reels','posts','stories'].includes(name)){amount(value,name);if(['reels','posts','stories'].includes(name)&&!Number.isInteger(value))fail(422,'الكمية يجب أن تكون عدداً صحيحاً');}
  else text(value,name,['caption','script','notes','constraints'].includes(name)?12000:2000);
 }
 if(kind==='clients')text(d.name,'اسم العميل',150,true);
 if(kind==='contracts'){text(d.name,'اسم الباقة / العقد',150,true);date(d.start,'بداية العقد',true);date(d.end,'نهاية العقد',true);if(d.end<d.start)fail(422,'نهاية العقد قبل بدايته');for(const k of ['fee','reels','posts','stories'])amount(d[k],k);enumValue(d.currency,['USD','SYP','EUR']);url(d.file_url||'');}
 if(kind==='content'){text(d.title,'عنوان المحتوى',200,true);enumValue(d.type,['reel','post','story']);enumValue(d.platform,['instagram','facebook','tiktok','youtube','linkedin']);enumValue(d.status,['idea','production','review','approved','scheduled','published','cancelled']);if(d.scheduled_at){if(!/^\d{4}-\d\d-\d\dT/.test(d.scheduled_at)||!/(Z|[+-]\d\d:\d\d)$/.test(d.scheduled_at)||!Number.isFinite(Date.parse(d.scheduled_at)))fail(422,'موعد النشر غير صالح');d.scheduled_at=new Date(d.scheduled_at).toISOString();}else if(d.status==='scheduled')fail(422,'حددي موعد النشر أولاً');url(d.asset_url||'');url(d.published_url||'');}
 if(kind==='tasks'){text(d.title,'المهمة',200,true);enumValue(d.status,['todo','doing','blocked','done']);date(d.due||'','موعد المهمة');}
 if(kind==='payments'){amount(d.amount,'المبلغ');if(d.amount===0)fail(422,'أدخلي مبلغاً أكبر من صفر');date(d.date,'تاريخ الدفعة',true);enumValue(d.currency,['USD','SYP','EUR']);text(d.contract_id,'العقد',100,true);}
 return d;
}
async function record(db,id,kind){const row=await db.prepare('SELECT * FROM ops_records WHERE id=? AND kind=?').bind(id,kind).first();if(!row)fail(404,'السجل غير موجود');return row;}
const view=r=>({...JSON.parse(r.data),id:r.id,client_id:r.client_id,version:r.version,created_at:r.created_at,updated_at:r.updated_at});
async function related(db,kind,d,clientId){
 if(kind==='clients')return;
 await record(db,clientId,'clients');
 if(d.contract_id){const c=await record(db,d.contract_id,'contracts');if(c.client_id!==clientId)fail(422,'العقد لا يتبع لهذا العميل');if(kind==='payments'&&JSON.parse(c.data).currency!==d.currency)fail(422,'عملة الدفعة يجب أن تطابق عملة العقد');}
 if(d.content_id){const c=await record(db,d.content_id,'content');if(c.client_id!==clientId)fail(422,'المحتوى لا يتبع لهذا العميل');}
}
async function save(req,env,kind,id){
 const input=await body(req),db=env.OPERATIONS_DB;
 let previous;if(id)previous=await record(db,id,kind);else id=crypto.randomUUID();
 if(previous&&input.version!==previous.version)fail(409,'هذا السجل تغير؛ حدّثي الصفحة قبل التعديل');
 const clientId=kind==='clients'?null:previous?.client_id||input.client_id;
 if(kind!=='clients'&&(typeof clientId!=='string'||!clientId))fail(422,'اختاري العميل');
 if(previous&&input.client_id&&input.client_id!==previous.client_id)fail(422,'لا يمكن نقل السجل بين العملاء');
 const d=validate(kind,input);await related(db,kind,d,clientId);
 const now=new Date().toISOString(),data=JSON.stringify(d),version=previous?previous.version+1:1,mutation=crypto.randomUUID();
 const statements=[];
 if(previous)statements.push(db.prepare('UPDATE ops_records SET data=?,version=?,updated_at=?,mutation_id=? WHERE id=? AND version=?').bind(data,version,now,mutation,id,previous.version));
 else statements.push(db.prepare('INSERT INTO ops_records (id,kind,client_id,data,version,created_at,updated_at,mutation_id) VALUES (?,?,?,?,1,?,?,?)').bind(id,kind,clientId,data,now,now,mutation));
 statements.push(db.prepare("INSERT INTO ops_audit (id,actor,action,record_id,kind,client_id,created_at,detail) SELECT ?,'2SEE',?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM ops_records WHERE id=? AND mutation_id=?)").bind(crypto.randomUUID(),previous?'update':'create',id,kind,clientId,now,JSON.stringify({version,status:d.status||null,voided:d.voided||false}),id,mutation));
 if(kind==='content'){
  // Publication identity includes the due timestamp: rescheduling never reuses old dedup keys.
  const pubId='ops-'+id+'-'+(d.scheduled_at?Date.parse(d.scheduled_at):'unscheduled');
  statements.push(db.prepare("UPDATE scheduled_publications SET status='cancelled' WHERE id LIKE ? AND id!=? AND EXISTS (SELECT 1 FROM ops_records WHERE id=? AND mutation_id=?)").bind('ops-'+id+'-%',pubId,id,mutation));
  if(d.scheduled_at){const client=JSON.parse((await record(db,clientId,'clients')).data);const status=d.status==='published'?'published':d.status==='scheduled'?'scheduled':'cancelled';
   statements.push(db.prepare("INSERT INTO scheduled_publications (id,client_name,content_title,platform,scheduled_at,status,verification_status) SELECT ?,?,?,?,?,?,'not_checked' WHERE EXISTS (SELECT 1 FROM ops_records WHERE id=? AND mutation_id=?) ON CONFLICT(id) DO UPDATE SET client_name=excluded.client_name,content_title=excluded.content_title,platform=excluded.platform,status=excluded.status").bind(pubId,client.name,d.title,d.platform,d.scheduled_at,status,id,mutation));
  }
 }
 const result=await db.batch(statements);if(previous&&!result[0].meta.changes)fail(409,'تعديل متزامن؛ أعيدي تحميل السجل');
 return json({record:view(await record(db,id,kind))},previous?200:201);
}
export default {
 async scheduled(event,env,ctx){return monitoring.scheduled(event,env,ctx);},
 async fetch(req,env){const u=new URL(req.url);try{
  if(u.protocol!=='https:'&&u.hostname!=='localhost')fail(400,'HTTPS required');
  if(req.method==='GET'||req.method==='HEAD'){
   const assets={'/':[PAGE,'text/html'],'/app.js':[APP,'text/javascript'],'/styles.css':[STYLE,'text/css']};if(assets[u.pathname])return secure(new Response(req.method==='HEAD'?null:assets[u.pathname][0],{headers:{'content-type':assets[u.pathname][1]+'; charset=utf-8'}}));
   if(u.pathname==='/health')return secure(json({service:'2SEE Operations',version:'1.0.0'}));
  }
  if(!u.pathname.startsWith('/api/'))fail(404,'المسار غير موجود');
  if(!env.OPERATIONS_DB)fail(503,'قاعدة البيانات غير مربوطة');
  if(!['GET','POST','PUT'].includes(req.method))fail(405,'Method not allowed');
  if(req.method!=='GET')originCheck(req);
  if(u.pathname==='/api/logout'&&req.method==='POST')return secure(json({ok:true},200,{'Set-Cookie':COOKIE+'=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'}));
  if(u.pathname==='/api/login'&&req.method==='POST'){if(!configured(env))fail(503,'بقي تعيين OPERATIONS_ADMIN_PASSWORD في أسرار العامل المستقل (24 حرفاً على الأقل).');await schema(env.OPERATIONS_DB);return secure(await login(req,env));}
  await authenticate(req,env);await schema(env.OPERATIONS_DB);
  if(u.pathname==='/api/session'&&req.method==='GET')return secure(json({name:'2SEE',timezone:'Asia/Damascus'}));
  if(u.pathname==='/api/data'&&req.method==='GET'){
   const rows=await env.OPERATIONS_DB.prepare('SELECT * FROM ops_records ORDER BY created_at DESC').all();
   const result=Object.fromEntries([...TYPES].map(k=>[k,[]]));for(const r of rows.results)if(result[r.kind])result[r.kind].push(view(r));
   const alerts=await env.OPERATIONS_DB.prepare('SELECT id,publication_id,alert_type,status,created_at,sent_at,error FROM monitoring_alerts ORDER BY created_at DESC LIMIT 100').all();result.alerts=alerts.results;
   const audit=await env.OPERATIONS_DB.prepare('SELECT actor,action,kind,record_id,client_id,created_at,detail FROM ops_audit ORDER BY created_at DESC LIMIT 100').all();result.audit=audit.results;
   return secure(json(result));
  }
  const match=/^\/api\/(clients|contracts|content|tasks|payments)(?:\/([a-zA-Z0-9-]{1,100}))?$/.exec(u.pathname);
  if(match&&((req.method==='POST'&&!match[2])||(req.method==='PUT'&&match[2])))return secure(await save(req,env,match[1],match[2]));
  fail(404,'المسار غير موجود');
 }catch(e){if(!(e instanceof ApiError))console.error('2SEE Operations request failed',e.name);return secure(json({error:e instanceof ApiError?e.message:'تعذّر تنفيذ الطلب؛ حاولي مجدداً'},e.status||500));}}
};
