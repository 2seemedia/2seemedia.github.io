import {readFile,stat,readdir} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'.snapshot');
const home=await readFile(path.join(root,'index.html'),'utf8');
const work=await readFile(path.join(root,'work/index.html'),'utf8');
const content=JSON.parse(await readFile(path.join(root,'data/content.json'),'utf8'));
const portfolio=JSON.parse(await readFile(path.join(root,'data/portfolio.json'),'utf8'));
const manifest=JSON.parse(await readFile(path.join(root,'data/snapshot.json'),'utf8'));
if(/chatgpt\.(?:site|com)|OAI-Sites-Authorization|https?:[^"<>\s]+\/admin/.test(home+work+JSON.stringify(content)+JSON.stringify(portfolio)))throw Error('Public output contains a private-host dependency');
if(/http-equiv=["']?refresh/i.test(home)||!home.includes('cmsRaw')||!home.includes('homeReelTrack'))throw Error('Homepage export is incomplete');
if(!portfolio.items.length||manifest.works!==portfolio.items.length)throw Error('Portfolio was not copied');
if(portfolio.items.some(w=>w.deleted||!w.visible))throw Error('Non-public work in snapshot');
async function allFiles(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await allFiles(p));else out.push(p)}return out}
const texts=[];for(const p of await allFiles(root))if(/\.(html|css|js|json)$/.test(p))texts.push(await readFile(p,'utf8'));
const paths=[...new Set([...texts.join('\n').matchAll(/\/(?:assets|media)\/[A-Za-z0-9_.-]+/g)].map(m=>m[0]))];
for(const p of paths)if(!(await stat(path.join(root,p))).isFile())throw Error('Missing local asset: '+p);
if(!content.design.logo||!content.design.designGallery)throw Error('Saved visual settings missing');
console.log(`PASS: real homepage, ${portfolio.items.length} public works, ${paths.length} local assets, saved design settings, no ChatGPT dependency.`);
