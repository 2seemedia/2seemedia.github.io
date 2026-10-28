import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
import {parseContent} from '../worker.js';
const root=new URL('../',import.meta.url);
const baseline=()=>parseContent(fs.readFileSync(new URL('../../assets/js/site-data.js',import.meta.url),'utf8'));
async function open({saved,publishEnabled=false}={}){
 const errors=[],calls=[];
 const html=fs.readFileSync(new URL('ui/dashboard.html',root),'utf8').replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g,'');
 const console=new VirtualConsole();console.on('jsdomError',e=>{if(e.type!=='css-parsing')errors.push(e.message);});
 const dom=new JSDOM(html,{url:'https://admin.example.test/dashboard.html',runScripts:'outside-only',virtualConsole:console});const w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=()=>{};w.confirm=()=>true;w.alert=msg=>errors.push(msg);
 w.fetch=async(url,options)=>{
  calls.push({url,options});
  if(url==='/api/content')return Response.json({content:baseline(),revision:'latest-revision'});
  if(url==='/api/session')return Response.json({email:'founder@example.test',branch:'admin/content-staging',publishEnabled,production:false});
  if(url==='/api/publish')return Response.json({error:'conflict fixture'},{status:409});
  throw Error('Unexpected URL '+url);
 };
 if(saved)w.localStorage.setItem('2see-agency-draft-v12',JSON.stringify(saved));
 await w.eval(fs.readFileSync(new URL('ui/dashboard.js',root),'utf8'));
 return {dom,w,doc:w.document,errors,calls};
}
test('dashboard loads all editor tabs without JavaScript errors or token fields',async()=>{
 const {dom,doc,errors}=await open();
 for(const name of ['content','sections','works','collaborations','brand','visual','preview','publish']){
  doc.querySelector(`[data-tab="${name}"]`).click();assert.equal(doc.querySelector('#tab-'+name).classList.contains('hidden'),false,name);
 }
 assert.equal(doc.querySelector('#github-token'),null);assert.equal(doc.querySelector('#publish-github').disabled,true);assert.deepEqual(errors,[]);dom.window.close();
});
test('editing a brand field saves local draft with its original revision',async()=>{
 const {dom,w,doc}=await open();doc.querySelector('[data-tab="brand"]').click();const input=doc.querySelector('#brand-fields input');input.value='2SEE preview test';input.dispatchEvent(new w.Event('input'));
 const saved=JSON.parse(w.localStorage.getItem('2see-agency-draft-v12'));assert.equal(saved.brand.name,'2SEE preview test');assert.equal(saved.__adminRevision,'latest-revision');
 doc.querySelector('[data-tab="preview"]').click();assert.match(doc.querySelector('#preview-frame').src,/cms-preview=1/);dom.window.close();
});
test('reopening a stale draft preserves stale revision on publish',async()=>{
 const saved={...baseline(),__adminRevision:'old-revision'};const {dom,doc,calls}=await open({saved,publishEnabled:true});doc.querySelector('#publish-github').click();await new Promise(resolve=>setImmediate(resolve));
 const call=calls.find(c=>c.url==='/api/publish');assert.equal(JSON.parse(call.options.body).baseRevision,'old-revision');assert.equal(call.options.headers['X-2SEE-Admin'],'1');assert.match(doc.querySelector('#publish-status').textContent,/conflict fixture/);dom.window.close();
});
test('adding a work creates an unpublished draft entry',async()=>{const {dom,w,doc,errors}=await open();doc.querySelector('[data-tab="works"]').click();doc.querySelector('#add-work').click();const saved=JSON.parse(w.localStorage.getItem('2see-agency-draft-v12'));assert.equal(saved.works.length,baseline().works.length+1);assert.equal(saved.works[0].visible,false);assert.deepEqual(errors,[]);dom.window.close();});
