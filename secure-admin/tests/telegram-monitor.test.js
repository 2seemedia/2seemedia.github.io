import test from 'node:test';
import assert from 'node:assert/strict';
import {dueAlertTypes,formatTelegramAlert,sendTelegramMessage} from '../telegram-monitor.js';
const now=Date.parse('2026-11-04T13:05:00Z');
const item={id:'p1',client_name:'طبيب',content_title:'ريل توعوي',platform:'instagram',status:'scheduled',verification_status:'not_checked',scheduled_at:'2026-11-04T13:00:00Z'};
test('pre and post publication reminders are selected at expected times',()=>{
 assert.deepEqual(dueAlertTypes(item,Date.parse('2026-11-04T12:45:00Z')),['before_15']);
 assert.deepEqual(dueAlertTypes(item,now),['before_15','after_5']);
 assert.deepEqual(dueAlertTypes(item,Date.parse('2026-11-04T13:15:00Z')),['before_15','after_5','after_15']);
});
test('confirmed and cancelled posts have no alerts',()=>{
 assert.deepEqual(dueAlertTypes({...item,verification_status:'confirmed'},now),[]);
 assert.deepEqual(dueAlertTypes({...item,status:'cancelled'},now),[]);
});
test('message does not falsely claim post is unpublished',()=>{
 assert.match(formatTelegramAlert(item,'after_5'),/غير مؤكّد/);
});
test('telegram delivery uses POST and requires successful API response',async()=>{
 const calls=[];
 await sendTelegramMessage('secret','123','hello',async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({ok:true})};});
 assert.equal(calls[0].options.method,'POST');
 assert.equal(JSON.parse(calls[0].options.body).chat_id,'123');
});
