// API is mounted only behind the existing Worker authentication.
// Scheduled posts are internal reminders; this API never publishes to Meta.
const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
const error=(status,message)=>reply({error:message},status);
const validId=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(x);
const validText=(x,max)=>typeof x==='string'&&x.trim().length>0&&x.trim().length<=max;
const validDate=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(x)&&Number.isFinite(Date.parse(x));
export async function handlePublicationApi(req,env){
 if(!env.OPERATIONS_DB)return error(503,'قاعدة بيانات العمليات غير متصلة');
 const url=new URL(req.url);
 if(req.method==='GET'){
  const {results=[]}=await env.OPERATIONS_DB.prepare(
   'SELECT id,client_name,content_title,platform,scheduled_at,status,published_at,verification_status,created_at FROM scheduled_publications ORDER BY scheduled_at DESC LIMIT 250'
  ).all();
  return reply({items:results});
 }
 if(req.method!=='POST')return error(405,'Method not allowed');
 if(req.headers.get('origin')!==url.origin||req.headers.get('x-2see-admin')!=='1')return error(403,'طلب من مصدر غير مسموح');
 if(req.headers.get('content-type')?.split(';')[0]!=='application/json')return error(415,'JSON required');
 const raw=await req.text();
 if(raw.length>12000)return error(413,'الطلب كبير جداً');
 let data;try{data=JSON.parse(raw);}catch{return error(400,'JSON غير صالح');}
 if(!data||typeof data!=='object'||Array.isArray(data))return error(422,'بيانات غير صالحة');
 if(!validText(data.client_name,120)||!validText(data.content_title,180)||!['instagram','facebook'].includes(data.platform)||!validDate(data.scheduled_at))return error(422,'راجعي اسم العميل والمحتوى والمنصة وموعد النشر بصيغة UTC');
 if(Date.parse(data.scheduled_at)<Date.now()-60000)return error(422,'موعد النشر يجب أن يكون بالمستقبل');
 const id=crypto.randomUUID();
 await env.OPERATIONS_DB.prepare(
  'INSERT INTO scheduled_publications (id,client_name,content_title,platform,scheduled_at) VALUES (?,?,?,?,?)'
 ).bind(id,data.client_name.trim(),data.content_title.trim(),data.platform,data.scheduled_at).run();
 return reply({ok:true,id},201);
}
export async function handlePublicationStatus(req,env){
 if(!env.OPERATIONS_DB)return error(503,'قاعدة بيانات العمليات غير متصلة');
 const url=new URL(req.url);
 if(req.method!=='POST')return error(405,'Method not allowed');
 if(req.headers.get('origin')!==url.origin||req.headers.get('x-2see-admin')!=='1'||req.headers.get('content-type')?.split(';')[0]!=='application/json')return error(403,'طلب غير مسموح');
 let data;try{const raw=await req.text();if(raw.length>3000)return error(413,'الطلب كبير');data=JSON.parse(raw);}catch{return error(400,'JSON غير صالح');}
 if(!validId(data?.id)||!['published','cancelled','scheduled'].includes(data?.status))return error(422,'حالة غير صالحة');
 const item=await env.OPERATIONS_DB.prepare('SELECT id,status FROM scheduled_publications WHERE id=?').bind(data.id).first();
 if(!item)return error(404,'المنشور غير موجود');
 if(data.status==='published'){
  // Manual confirmation is not Meta API verification; preserve distinction.
  await env.OPERATIONS_DB.prepare("UPDATE scheduled_publications SET status='published',published_at=?,verification_status='not_checked' WHERE id=?").bind(new Date().toISOString(),data.id).run();
 }else{
  await env.OPERATIONS_DB.prepare("UPDATE scheduled_publications SET status=?,published_at=NULL,verification_status='not_checked' WHERE id=?").bind(data.status,data.id).run();
 }
 return reply({ok:true});
}
