import test from 'node:test';
import assert from 'node:assert/strict';
import {handlePublicationApi,handlePublicationStatus} from '../publication-api.js';
const origin='https://admin.example';
const future=new Date(Date.now()+3600_000).toISOString().replace(/\.\d{3}Z$/,'Z');
const payload={client_name:'طبيب',content_title:'بوست',platform:'instagram',scheduled_at:future};
const records=[];
const db={prepare(sql){return {bind(...values){return {async run(){records.push({sql,values});return {meta:{changes:1}};},async first(){return {id:values[0],status:'scheduled'};}};},async all(){return {results:[]};}};}};
const req=(path,data,headers={})=>new Request(origin+path,{method:'POST',headers:{'content-type':'application/json','origin':origin,'x-2see-admin':'1',...headers},body:JSON.stringify(data)});
test('valid schedule creates a D1 record',async()=>{
 const res=await handlePublicationApi(req('/api/operations/publications',payload),{OPERATIONS_DB:db});
 assert.equal(res.status,201);
 assert.equal(records.at(-1).values[1],'طبيب');
});
test('wrong origin is rejected',async()=>{
 const res=await handlePublicationApi(req('/api/operations/publications',payload,{origin:'https://evil.example'}),{OPERATIONS_DB:db});
 assert.equal(res.status,403);
});
test('past schedule is rejected',async()=>{
 const res=await handlePublicationApi(req('/api/operations/publications',{...payload,scheduled_at:'2020-01-01T00:00:00Z'}),{OPERATIONS_DB:db});
 assert.equal(res.status,422);
});
test('manual published status is not recorded as Meta verified',async()=>{
 const res=await handlePublicationStatus(req('/api/operations/publication-status',{id:'p1',status:'published'}),{OPERATIONS_DB:db});
 assert.equal(res.status,200);
 assert.match(records.at(-1).sql,/verification_status='not_checked'/);
});
