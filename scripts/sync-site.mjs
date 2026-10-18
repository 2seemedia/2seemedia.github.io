import {readFile,writeFile,mkdir,readdir,cp,rm,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

// Only anonymous, published content is copied. No owner session or API key is used.
const origin='https://two-see-media.spryfairy257.chatgpt.site';
const output=path.resolve(process.env.SNAPSHOT_DIR||'.snapshot');
const cache=path.resolve(process.env.ASSET_CACHE||'.');
const hash=value=>createHash('sha256').update(value).digest('hex');
const requests=['/','/api/content','/api/portfolio'];
async function get(url){
 const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(90000)});
 if(!response.ok)throw Error(`Public source returned ${response.status}: ${new URL(url).pathname}`);
 return response;
}
async function readSource(){return Promise.all(requests.map(async p=>(await get(origin+p)).text()))}
async function files(dir){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())out.push(...await files(p));else if(entry.isFile())out.push(p)}return out.sort()}
async function put(relative,body){const p=path.join(output,relative);await mkdir(path.dirname(p),{recursive:true});await writeFile(p,body)}
const raw=await readSource();
const [home,contentText,portfolioText]=raw;
const content=JSON.parse(contentText),portfolio=JSON.parse(portfolioText);
if(!home.startsWith('<!DOCTYPE html>')||!home.includes('2SEE')||!home.includes('cmsRaw'))throw Error('The homepage is not a published 2SEE page');
if(!content.design||!content.portfolio?.ar||!content.portfolio?.en||!Array.isArray(portfolio.items)||portfolio.items.some(w=>w.deleted||!w.visible))throw Error('Invalid public content');
const clientFiles=await files('client');
const clientBytes=await Promise.all(clientFiles.map(p=>readFile(p)));
const fingerprint=hash(Buffer.concat([...raw.map(s=>Buffer.from(s)),...clientBytes]));
let previous=null;try{previous=JSON.parse(await readFile('data/snapshot.json','utf8'))}catch{}
if(previous?.fingerprint===fingerprint&&!process.env.FORCE_SNAPSHOT){
 if(process.env.GITHUB_OUTPUT)await writeFile(process.env.GITHUB_OUTPUT,'changed=false\n',{flag:'a'});
 console.log('Published content has not changed.');process.exit(0);
}
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
await cp('client',output,{recursive:true});
// The public site has only local links/assets; its owner dashboard stays separate.
const localize=text=>text.replaceAll(origin,'');
await put('index.html',localize(home));
await put('data/content.json',localize(JSON.stringify(content)));
await put('data/portfolio.json',localize(JSON.stringify(portfolio)));
const references=[...raw,...clientBytes.map(b=>b.toString())].join('\n');
const assetPaths=[...new Set([...references.matchAll(/\/(?:assets|media)\/[A-Za-z0-9_.-]+/g)].map(m=>m[0]))];
// Each uploaded asset has a unique immutable path. Reuse checked-in copies.
let cursor=0;let downloaded=0;
await Promise.all(Array.from({length:6},async()=>{
 while(cursor<assetPaths.length){const asset=assetPaths[cursor++],relative=asset.slice(1),target=path.join(output,relative);
  try{if((await stat(target)).isFile())continue}catch{}
  const existing=path.join(cache,relative);let bytes;
  try{bytes=await readFile(existing)}catch{bytes=Buffer.from(await (await get(origin+asset)).arrayBuffer());downloaded++}
  if(!bytes.length||bytes.length>15*1024*1024)throw Error(`Invalid asset: ${asset}`);
  await put(relative,bytes);
 }
}));
// Keep one coherent snapshot if the owner edits while the copy is being prepared.
const latest=await readSource();
if(latest.some((s,i)=>s!==raw[i]))throw Error('Content changed during synchronization; the previous published site is preserved. The next run will retry.');
const redirect=`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>أعمالنا | 2SEE Media</title></head><body><a href="/work/">عرض الأعمال · Our work</a><script>location.replace('/work/'+location.search+location.hash)</script></body></html>`;
await put('portfolio.html',redirect);
await put('404.html','<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>2SEE Media</title><body style="font-family:sans-serif;background:#f7f5f1;color:#801c2b;text-align:center;padding:15vh 1rem"><h1>2SEE MEDIA</h1><p>الصفحة غير موجودة · Page not found</p><a href="/">الرئيسية · Home</a> · <a href="/work/">أعمالنا · Our work</a></body></html>');
await put('.nojekyll','');
await put('robots.txt','User-agent: *\nAllow: /\nSitemap: https://2seemedia.github.io/sitemap.xml\n');
await put('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://2seemedia.github.io/</loc></url><url><loc>https://2seemedia.github.io/work/</loc></url></urlset>');
await put('data/snapshot.json',JSON.stringify({fingerprint,updatedAt:new Date().toISOString(),works:portfolio.items.length,assets:assetPaths.length}));
if(process.env.GITHUB_OUTPUT)await writeFile(process.env.GITHUB_OUTPUT,'changed=true\n',{flag:'a'});
console.log(`Snapshot ready: ${portfolio.items.length} works, ${assetPaths.length} local assets (${downloaded} downloaded).`);
