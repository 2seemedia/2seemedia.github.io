// 2SEE standalone monitoring Worker. Deploy separately from the website.
// D1 binding: OPERATIONS_DB; secrets: TELEGRAM_BOT_TOKEN, TELEGRAM_ALERT_CHAT_ID.
// Cron trigger: * * * * * (UTC). Does NOT publish or verify Instagram posts.
const ALERTS = [
  {type:"before_15",offset:-15,label:"⏰ بقي 15 دقيقة على موعد النشر"},
  {type:"after_5",offset:5,label:"⚠️ مرّت 5 دقائق ولم يتم تأكيد النشر"},
  {type:"after_15",offset:15,label:"🚨 مرّت 15 دقيقة ولم يتم تأكيد النشر"}
];
const MINUTE = 60000;
function dueAlerts(item, now) {
  if (item.status !== "scheduled" || item.verification_status === "confirmed") return [];
  const scheduled = Date.parse(item.scheduled_at);
  if (!Number.isFinite(scheduled)) return [];
  const delta = (now - scheduled) / MINUTE;
  return ALERTS.filter(a => delta >= a.offset && delta < a.offset + 3);
}
function message(item, alert) {
  const time = new Date(item.scheduled_at).toLocaleString("ar-SY", {
    timeZone:"Asia/Damascus",dateStyle:"medium",timeStyle:"short"
  });
  return ["📢 2SEE Alerts",alert.label,"",
    "العميل: "+item.client_name,
    "المحتوى: "+item.content_title,
    "المنصة: "+item.platform,
    "موعد النشر (دمشق): "+time,"",
    "الحالة: النشر غير مؤكّد في النظام؛ هذا لا يعني أنه لم يُنشر."
  ].join("\n");
}
async function sendTelegram(env, chatId, text) {
  const response = await fetch("https://api.telegram.org/bot"+env.TELEGRAM_BOT_TOKEN+"/sendMessage", {
    method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({chat_id:chatId,text})
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error("Telegram rejected message: HTTP "+response.status);
}
async function run(env) {
  if (!env.OPERATIONS_DB || !env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_ALERT_CHAT_ID)
    throw new Error("Missing OPERATIONS_DB or Telegram secrets");
  const now = Date.now();
  // julianday normalizes both ISO forms: with and without fractional seconds.
  const start = new Date(now-20*MINUTE).toISOString();
  const end = new Date(now+16*MINUTE).toISOString();
  const {results=[]} = await env.OPERATIONS_DB.prepare(
    "SELECT * FROM scheduled_publications WHERE status='scheduled' AND verification_status!='confirmed' AND julianday(scheduled_at) BETWEEN julianday(?) AND julianday(?) LIMIT 250"
  ).bind(start,end).all();
  let sent=0,failed=0;
  for (const item of results) {
    for (const alert of dueAlerts(item,now)) {
      const id = item.id+":"+alert.type;
      const inserted = await env.OPERATIONS_DB.prepare(
        "INSERT OR IGNORE INTO monitoring_alerts (id,publication_id,alert_type) VALUES (?,?,?)"
      ).bind(id,item.id,alert.type).run();
      if (!inserted.meta?.changes) continue;
      try {
        await sendTelegram(env,item.responsible_chat_id||env.TELEGRAM_ALERT_CHAT_ID,message(item,alert));
        await env.OPERATIONS_DB.prepare(
          "UPDATE monitoring_alerts SET status='sent',sent_at=? WHERE id=?"
        ).bind(new Date().toISOString(),id).run();
        sent++;
      } catch(error) {
        await env.OPERATIONS_DB.prepare(
          "UPDATE monitoring_alerts SET status='failed',error=? WHERE id=?"
        ).bind(String(error.message).slice(0,200),id).run();
        failed++;
        console.error("2SEE Telegram failed",id,String(error.message));
      }
    }
  }
  console.log("2SEE scheduled monitoring",{checked:results.length,sent,failed});
}
export default {
  async fetch() {
    return new Response("2SEE standalone monitoring ready",{headers:{"content-type":"text/plain"}});
  },
  async scheduled(_event,env,ctx) {
    ctx.waitUntil(run(env));
  }
};
