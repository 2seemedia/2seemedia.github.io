// Internal scheduled alert dispatcher. Requires env.OPERATIONS_DB (D1),
// env.TELEGRAM_BOT_TOKEN (secret), env.TELEGRAM_ALERT_CHAT_ID (secret).
// Does not verify Meta publication or auto-publish. Never report 'unpublished'
// when confirmation data is missing.
const TYPES = [
 {name:'before_15', offset:-15, title:'⏰ تذكير قبل النشر بـ15 دقيقة'},
 {name:'after_5', offset:5, title:'⚠️ لم يتم تأكيد النشر بعد 5 دقائق'},
 {name:'after_15', offset:15, title:'🚨 متابعة عاجلة: النشر غير مؤكد بعد 15 دقيقة'}
];
function minutesBetween(a,b){return Math.floor((a-b)/60000);}
export function dueAlertTypes(item,now=Date.now()){
 if(item.status!=='scheduled'||item.verification_status==='confirmed')return [];
 const scheduled=Date.parse(item.scheduled_at);
 if(!Number.isFinite(scheduled))return [];
 const delta=minutesBetween(now,scheduled);
 return TYPES.filter(t=>delta>=t.offset && delta<t.offset+3).map(t=>t.name);
}
export function formatTelegramAlert(item,type){
 const spec=TYPES.find(t=>t.name===type);
 if(!spec)throw Error('Unknown alert type');
 return [spec.title,'','العميل: '+item.client_name,'المحتوى: '+item.content_title,'المنصة: '+item.platform,'موعد النشر (UTC): '+item.scheduled_at,'الحالة: '+(item.verification_status==='not_found'?'لم يتم العثور على المنشور':'النشر غير مؤكّد'),'','راجعي لوحة 2SEE للتأكد من حالة المنشور.'].join('\n');
}
export async function sendTelegramMessage(token,chatId,message,request=fetch){
 if(!token||!chatId)throw Error('Telegram configuration missing');
 const response=await request('https://api.telegram.org/bot'+encodeURIComponent(token)+'/sendMessage',{
  method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({chat_id:chatId,text:message,disable_web_page_preview:true})
 });
 if(!response.ok)throw Error('Telegram delivery failed: '+response.status);
 const data=await response.json();
 if(!data.ok)throw Error('Telegram delivery rejected');
 return data;
}
export async function runPublicationMonitoring(env,{now=Date.now(),request=fetch}={}){
 if(!env.OPERATIONS_DB)throw Error('OPERATIONS_DB binding missing');
 if(!env.TELEGRAM_BOT_TOKEN||!env.TELEGRAM_ALERT_CHAT_ID)throw Error('Telegram secrets missing');
 const start=new Date(now-20*60_000).toISOString();
 const end=new Date(now+16*60_000).toISOString();
 const {results=[]}=await env.OPERATIONS_DB.prepare(
  "SELECT * FROM scheduled_publications WHERE status='scheduled' AND verification_status!='confirmed' AND scheduled_at BETWEEN ? AND ? LIMIT 250"
 ).bind(start,end).all();
 let sent=0,failed=0;
 for(const item of results){
  for(const type of dueAlertTypes(item,now)){
   const id=item.id+':'+type;
   const inserted=await env.OPERATIONS_DB.prepare(
    "INSERT OR IGNORE INTO monitoring_alerts (id,publication_id,alert_type) VALUES (?,?,?)"
   ).bind(id,item.id,type).run();
   if(!inserted.meta?.changes)continue;
   try{
    await sendTelegramMessage(env.TELEGRAM_BOT_TOKEN,item.responsible_chat_id||env.TELEGRAM_ALERT_CHAT_ID,formatTelegramAlert(item,type),request);
    await env.OPERATIONS_DB.prepare("UPDATE monitoring_alerts SET status='sent',sent_at=? WHERE id=?").bind(new Date(now).toISOString(),id).run();
    sent++;
   }catch(error){
    await env.OPERATIONS_DB.prepare("UPDATE monitoring_alerts SET status='failed',error=? WHERE id=?").bind(String(error.message).slice(0,200),id).run();
    failed++;
   }
  }
 }
 return {checked:results.length,sent,failed};
}
