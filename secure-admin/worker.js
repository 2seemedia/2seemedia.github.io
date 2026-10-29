import {passwordRoute,verifyPasswordSession,LoginError} from './password-auth.js';
import {createRemoteJWKSet, jwtVerify} from 'jose';
const jwksCache = new Map();
const PAGES = new Set(['index.html','services.html','work.html','case-study.html','about.html','contact.html','careers.html','404.html']);
const TARGET = 'assets/js/site-data.js';
export class HttpError extends Error { constructor(status,message){super(message);this.status=status;} }
const fail=(status,message)=>{throw new HttpError(status,message);};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8'}});
export async function authenticate(req,env){
 if(env.AUTH_MODE==='password')return verifyPasswordSession(req,env);
 const domain=env.ACCESS_TEAM_DOMAIN;
 if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(domain||'')||!env.ACCESS_AUD||env.ACCESS_AUD.startsWith('REPLACE'))fail(503,'إعداد تسجيل الدخول غير مكتمل');
 const token=req.headers.get('Cf-Access-Jwt-Assertion');
 if(!token)fail(401,'سجّلي الدخول عبر Cloudflare Access');
 let payload;
 try{
  if(!jwksCache.has(domain))jwksCache.set(domain,createRemoteJWKSet(new URL(`https://${domain}/cdn-cgi/access/certs`)));
  ({payload}=await jwtVerify(token,jwksCache.get(domain),{issuer:`https://${domain}`,audience:env.ACCESS_AUD,algorithms:['RS256'],requiredClaims:['exp','iat','email','sub']}));
 }catch{fail(401,'جلسة الدخول غير صالحة أو انتهت');}
 const allowed=(env.ALLOWED_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
 if(!allowed.includes(String(payload.email||'').toLowerCase()))fail(403,'هذا الحساب غير مخوّل');
 return payload;
}
function secured(response,path){
 const r=new Response(response.body,response);
 for(const [k,v] of Object.entries({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow','Permissions-Policy':'camera=(), microphone=(), geolocation=()'}))r.headers.set(k,v);
 r.headers.set('Content-Security-Policy',`frame-ancestors ${path==='/'||path==='/dashboard.html'?"'none'":"'self'"}; object-src 'none'; base-uri 'self'`);
 if(['/login','/login.html','/assets/js/login.js'].includes(path))r.headers.set('Content-Security-Policy',"default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
 return r;
}
export function parseContent(source){
 const m=source.match(/^\s*window\.SEE_CMS_DATA\s*=\s*([\s\S]*?)\s*;\s*$/);
 if(!m)fail(502,'صيغة المحتوى المنشور غير معروفة');
 return JSON.parse(m[1]);
}
export function validateContent(data,baseline){
 if(!data||typeof data!=='object'||Array.isArray(data)||!data.brand||!data.settings||!data.sections||!data.pages||!Array.isArray(data.works))fail(422,'بنية المحتوى غير صالحة');
 if(data.version!==baseline.version)fail(422,'إصدار المحتوى غير متوافق');
 if(Object.keys(data.pages).sort().join()!==Object.keys(baseline.pages).sort().join())fail(422,'قائمة الصفحات غير متوافقة');
 for(const [page,entries] of Object.entries(data.pages)){
  if(!PAGES.has(page)||!Array.isArray(entries)||entries.length!==baseline.pages[page].length)fail(422,'عناصر الصفحة غير متوافقة');
  const known=new Map(baseline.pages[page].map(e=>[e.key,e.kind]));
  for(const e of entries){if(!e||known.get(e.key)!==e.kind||!known.delete(e.key))fail(422,'معرّف عنصر غير صالح');}
 }
 if(data.works.length>1000||!Array.isArray(data.collaborations?.logos)||data.collaborations.logos.length>200)fail(422,'عدد العناصر يتجاوز الحد');
 if(baseline.packages){
  const p=data.packages;
  if(!p||!Array.isArray(p.names)||p.names.length!==3||p.names.some(x=>typeof x!=='string'||x.length>80))fail(422,'أسماء الباقات غير صالحة');
  for(const values of [p.quantities,p.sessions,p.prices?.basic,p.prices?.premium])if(!Array.isArray(values)||values.length!==3||values.some(x=>!Number.isFinite(x)||x<0||x>100000))fail(422,'قيم الباقات غير صالحة');
  for(const tier of ['basic','premium'])if(!/^https:\/\/[^\s<>"']+$/i.test(p.examples?.[tier]||''))fail(422,'رابط مثال الباقة غير صالح');
 }
 function walk(value,depth=0,key=''){
  if(depth>15)fail(422,'المحتوى معقّد أكثر من المسموح');
  if(typeof value==='string'){
   if(value.length>2_000_000)fail(422,'حجم الحقل أكبر من المسموح');
   if(/^(?:url|image|logo|instagram|mohamadInstagram|esraaInstagram|youtube|facebook)$/i.test(key)&&value&&!/^(?:https?:\/\/|assets\/|data:image\/(?:png|jpeg|webp);base64,|#)/i.test(value))fail(422,'رابط غير آمن');
  }else if(value&&typeof value==='object')for(const [k,v] of Object.entries(value)){
   if(['__proto__','prototype','constructor'].includes(k))fail(422,'مفتاح غير صالح');walk(v,depth+1,k);
  }
 }
 walk(data);
 return data;
}
export function createHandler({verify=authenticate,request=fetch}={}){
 async function gh(env,path,method='GET',body){
  const r=await request(`https://api.github.com/repos/${env.GITHUB_REPO}/${path}`,{method,headers:{...(env.GITHUB_TOKEN?{Authorization:`Bearer ${env.GITHUB_TOKEN}`} : {}),Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'2SEE-secure-admin','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  const out=await r.json();if(!r.ok)fail(r.status===409||r.status===422?409:502,r.status===409||r.status===422?'المحتوى تغيّر؛ أعيدي تحميل النسخة المنشورة قبل النشر':'تعذّر الاتصال بـ GitHub');return out;
 }
 async function read(env){
  const file=await gh(env,`contents/${TARGET}?ref=${encodeURIComponent(env.GITHUB_BRANCH)}`);
  const source=new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\s/g,'')),c=>c.charCodeAt(0)));
  return {content:parseContent(source),revision:file.sha};
 }
 async function publish(env,input,user){
  if(!input||typeof input!=='object'||Array.isArray(input))fail(400,'طلب غير صالح');
  if(env.PUBLISH_ENABLED!=='true')fail(423,'النشر مقفل حتى اكتمال الاختبار والموافقة');
  if(env.GITHUB_BRANCH===(env.PRODUCTION_BRANCH||'main')&&env.PRODUCTION_APPROVED!=='true')fail(423,'النشر الرسمي يحتاج موافقة التفعيل');
  if(!/^[\w.-]+\/[\w.-]+$/.test(env.GITHUB_REPO||'')||!env.GITHUB_BRANCH)fail(503,'إعداد المستودع غير مكتمل');
  if(!env.GITHUB_TOKEN)fail(503,'بقي ربط صلاحية النشر بـGitHub');
  const head=await gh(env,`git/ref/heads/${env.GITHUB_BRANCH}`);
  const current=await read({...env,GITHUB_BRANCH:head.object.sha});
  if(input.baseRevision!==current.revision)fail(409,'توجد تعديلات أحدث؛ احفظي مسودتك ثم حمّلي النسخة المنشورة وراجعي الفرق');
  if(!input.content||typeof input.content!=='object'||Array.isArray(input.content))fail(422,'بنية المحتوى غير صالحة');
  const content=structuredClone(input.content);delete content.__adminRevision;
  validateContent(content,current.content);
  const pending=[];
  function collect(obj,key){if(obj[key]?.startsWith('data:image/'))pending.push([obj,key]);}
  collect(content.brand,'logo');for(const w of content.works)collect(w,'image');
  for(const w of content.collaborations.logos)collect(w,'image');
  for(const entries of Object.values(content.pages))for(const e of entries)if(e.kind==='image'){collect(e,'en');collect(e,'ar');}
  if(pending.length>30)fail(422,'الحد الأقصى 30 صورة في النشر الواحد');
  // Validate every upload before creating any Git objects.
  const uploads=pending.map(([obj,key])=>{
   const m=/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(obj[key]);
   if(!m||m[2].length>1_800_000||m[2].length%4)fail(422,'صورة غير صالحة أو كبيرة');
   let bytes;try{bytes=atob(m[2]);}catch{fail(422,'ترميز الصورة غير صالح');}
   const valid=m[1]==='png'?bytes.startsWith('\x89PNG\r\n\x1a\n'):m[1]==='jpeg'?bytes.startsWith('\xff\xd8\xff'):bytes.startsWith('RIFF')&&bytes.slice(8,12)==='WEBP';
   if(!valid)fail(422,'محتوى الصورة لا يطابق نوع الملف');
   return {obj,key,encoded:m[2],path:`assets/uploads/2see-${crypto.randomUUID()}.${m[1]==='jpeg'?'jpg':m[1]}`};
  });
  const tree=[];
  for(const upload of uploads){
   const blob=await gh(env,'git/blobs','POST',{content:upload.encoded,encoding:'base64'});
   tree.push({path:upload.path,mode:'100644',type:'blob',sha:blob.sha});upload.obj[upload.key]=upload.path;
  }
  const js='window.SEE_CMS_DATA = '+JSON.stringify(content)+';\n';
  const blob=await gh(env,'git/blobs','POST',{content:js,encoding:'utf-8'});
  tree.push({path:TARGET,mode:'100644',type:'blob',sha:blob.sha});
  tree.push({path:'data/site-content.json',mode:'100644',type:'blob',content:JSON.stringify(content,null,2)+'\n'});
  const parent=await gh(env,`git/commits/${head.object.sha}`);
  const newTree=await gh(env,'git/trees','POST',{base_tree:parent.tree.sha,tree});
  const commit=await gh(env,'git/commits','POST',{message:`Publish 2SEE content by ${user.email} [${new Date().toISOString()}]`,tree:newTree.sha,parents:[head.object.sha]});
  // A concurrent commit makes this fail without replacing its edits.
  await gh(env,`git/refs/heads/${env.GITHUB_BRANCH}`,'PATCH',{sha:commit.sha,force:false});
  return {ok:true,content,revision:blob.sha,commit:commit.sha,branch:env.GITHUB_BRANCH,production:env.GITHUB_BRANCH===(env.PRODUCTION_BRANCH||'main')};
 }
 return {async fetch(req,env){
  const u=new URL(req.url);
  try{
   if(env.AUTH_MODE==='password'){const result=await passwordRoute(req,env);if(result)return secured(result,u.pathname);}
   const user=await verify(req,env);
   if(u.pathname.startsWith('/api/')){
    if(u.pathname==='/api/content'&&req.method==='GET')return secured(json(await read(env)),u.pathname);
    if(u.pathname==='/api/session'&&req.method==='GET')return secured(json({name:user.name||user.email,email:user.email,branch:env.GITHUB_BRANCH,publishEnabled:env.PUBLISH_ENABLED==='true'&&(env.GITHUB_BRANCH!==(env.PRODUCTION_BRANCH||'main')||env.PRODUCTION_APPROVED==='true'),production:env.GITHUB_BRANCH===(env.PRODUCTION_BRANCH||'main')}),u.pathname);
    if(u.pathname==='/api/publish'){
     if(req.method!=='POST')fail(405,'POST required');
     if(req.headers.get('origin')!==u.origin||req.headers.get('x-2see-admin')!=='1')fail(403,'طلب من مصدر غير مسموح');
     if(req.headers.get('content-type')?.split(';')[0]!=='application/json')fail(415,'JSON required');
     const reader=req.body?.getReader();if(!reader)fail(400,'محتوى الطلب مفقود');let size=0;const chunks=[];
     while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>20_000_000){await reader.cancel();fail(413,'حجم الطلب أكبر من المسموح');}chunks.push(value);}
     const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
     let input;try{input=JSON.parse(new TextDecoder().decode(bytes));}catch{fail(400,'JSON غير صالح');}
     return secured(json(await publish(env,input,user)),u.pathname);
    }
    fail(404,'المسار غير موجود');
   }
   if(req.method!=='GET'&&req.method!=='HEAD')fail(405,'Method not allowed');
   const path=u.pathname==='/'?'/dashboard.html':u.pathname;
   if(!PAGES.has(path.slice(1))&&path!=='/dashboard.html'&&!/^\/assets\/[\w./-]+$/.test(path))fail(404,'المسار غير موجود');
   // Fetch current content, never a stale bundle, including for preview pages.
   if(path==='/assets/js/site-data.js'){
    const {content}=await read(env);return secured(new Response('window.SEE_CMS_DATA = '+JSON.stringify(content)+';',{headers:{'Content-Type':'text/javascript; charset=utf-8'}}),path);
   }
   u.pathname=path;
   const asset=await env.ASSETS.fetch(new Request(u,req));
   if(asset.status===404&&/^\/assets\/uploads\/[\w.-]+\.(?:png|jpg|jpeg|webp)$/.test(path)){
    let file=await gh(env,`contents/${path.slice(1)}?ref=${encodeURIComponent(env.GITHUB_BRANCH)}`);
    if(!file.content)file=await gh(env,`git/blobs/${file.sha}`);
    const bytes=Uint8Array.from(atob(file.content.replace(/\s/g,'')),c=>c.charCodeAt(0));
    const type=path.endsWith('.png')?'image/png':path.endsWith('.webp')?'image/webp':'image/jpeg';
    return secured(new Response(req.method==='HEAD'?null:bytes,{headers:{'Content-Type':type}}),path);
   }
   return secured(asset,path);
  }catch(e){
   if(env.AUTH_MODE==='password'&&[401,503].includes(e.status)&&req.method==='GET'&&['/','/dashboard.html'].includes(u.pathname))return secured(new Response(null,{status:303,headers:{Location:'/login'}}),u.pathname);
   return secured(json({error:e instanceof HttpError||e instanceof LoginError?e.message:'حدث خطأ في الخدمة؛ لم يتم تأكيد النشر'},e.status||500),u.pathname);
  }
 }};
}
export default createHandler();
