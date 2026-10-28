import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {generateKeyPair,exportJWK,SignJWT} from 'jose';
import {createHandler,authenticate,parseContent,validateContent} from '../worker.js';
const sample=()=>parseContent(fs.readFileSync(new URL('../../assets/js/site-data.js',import.meta.url),'utf8'));
const env={GITHUB_REPO:'2seemedia/2seemedia.github.io',GITHUB_BRANCH:'admin/content-staging',PRODUCTION_BRANCH:'main',PUBLISH_ENABLED:'true',PRODUCTION_APPROVED:'false',GITHUB_TOKEN:'test-only'};
function setup({concurrent=false}={}){
 const calls=[];const content=sample();const revision='old-blob';
 const request=async(url,options)=>{
  const path=url.split('/2seemedia.github.io/')[1],body=options.body?JSON.parse(options.body):null;calls.push({path,method:options.method,body});
  let out;
  if(path.startsWith('contents/'))out={sha:revision,content:Buffer.from('window.SEE_CMS_DATA = '+JSON.stringify(content)+';\n').toString('base64')};
  else if(path.startsWith('git/ref/'))out={object:{sha:'old-head'}};
  else if(path==='git/commits/old-head')out={tree:{sha:'old-tree'}};
  else if(path==='git/blobs')out={sha:'new-blob'};
  else if(path==='git/trees')out={sha:'new-tree'};
  else if(path==='git/commits')out={sha:'new-head'};
  else if(path.startsWith('git/refs/'))return Response.json(concurrent?{message:'not fast forward'}:{object:{sha:'new-head'}},{status:concurrent?422:200});
  else throw Error('Unexpected '+path);
  return Response.json(out);
 };
 return {calls,content,handler:createHandler({verify:async()=>({email:'founder@example.test'}),request})};
}
function post(input,headers={}){return new Request('https://admin.example.test/api/publish',{method:'POST',headers:{Origin:'https://admin.example.test','Content-Type':'application/json','X-2SEE-Admin':'1',...headers},body:JSON.stringify(input)});}
test('missing Access configuration fails closed',async()=>{const r=await createHandler().fetch(new Request('https://admin.example.test/'),{});assert.equal(r.status,503);});
test('Access JWT validates signature, audience, expiry and founder allowlist',async()=>{
 const {publicKey,privateKey}=await generateKeyPair('RS256');const jwk=await exportJWK(publicKey);jwk.kid='test';
 const original=globalThis.fetch;globalThis.fetch=async()=>Response.json({keys:[jwk]});
 const authEnv={ACCESS_TEAM_DOMAIN:'2see-test.cloudflareaccess.com',ACCESS_AUD:'test-audience',ALLOWED_EMAILS:'esraa@example.test,mohamad@example.test'};
 const token=async(email,aud='test-audience',exp='2h')=>new SignJWT({email}).setProtectedHeader({alg:'RS256',kid:'test'}).setIssuer('https://2see-test.cloudflareaccess.com').setAudience(aud).setSubject('founder').setIssuedAt().setExpirationTime(exp).sign(privateKey);
 const req=t=>new Request('https://admin.example.test/',{headers:{'Cf-Access-Jwt-Assertion':t}});
 try{
  for(const email of ['esraa@example.test','mohamad@example.test'])assert.equal((await authenticate(req(await token(email)),authEnv)).email,email);
  await assert.rejects(authenticate(req(await token('visitor@example.test')),authEnv),e=>e.status===403);
  await assert.rejects(authenticate(req(await token('esraa@example.test','wrong')),authEnv),e=>e.status===401);
  await assert.rejects(authenticate(req(await token('esraa@example.test','test-audience','-1h')),authEnv),e=>e.status===401);
  await assert.rejects(authenticate(req('forged-token'),authEnv),e=>e.status===401);
  await assert.rejects(authenticate(new Request('https://admin.example.test/'),authEnv),e=>e.status===401);
 }finally{globalThis.fetch=original;}
});
test('all assets require authentication',async()=>{let touched=false;const handler=createHandler({verify:async()=>{throw Object.assign(Error('Unauthorized'),{status:401});}});for(const path of ['/','/dashboard.html','/assets/js/dashboard.js','/index.html','/api/content']){assert.equal((await handler.fetch(new Request('https://admin.example.test'+path),{ASSETS:{fetch:()=>{touched=true;}}})).status,401);}assert.equal(touched,false);});
test('cross-origin publishing rejected before GitHub access',async()=>{const {handler,calls,content}=setup();assert.equal((await handler.fetch(post({content},{Origin:'https://attacker.test'}),env)).status,403);assert.equal(calls.length,0);});
test('missing custom request header rejected',async()=>{const {handler,content}=setup();const req=post({content});req.headers.delete('X-2SEE-Admin');assert.equal((await handler.fetch(req,env)).status,403);});
test('publish disabled blocks all GitHub operations',async()=>{const {handler,calls,content}=setup();assert.equal((await handler.fetch(post({content}),{...env,PUBLISH_ENABLED:'false'})).status,423);assert.equal(calls.length,0);});
test('main requires separate production approval',async()=>{const {handler,calls,content}=setup();assert.equal((await handler.fetch(post({content}),{...env,GITHUB_BRANCH:'main'})).status,423);assert.equal(calls.length,0);});
test('stale drafts cannot overwrite current content',async()=>{const {handler,calls,content}=setup();assert.equal((await handler.fetch(post({content,baseRevision:'stale'}),env)).status,409);assert.ok(calls.every(c=>c.method==='GET'));});
test('content and images publish in one commit and one non-force branch update',async()=>{
 const {handler,calls,content}=setup();content.brand.name='2SEE اختبار';content.brand.logo='data:image/png;base64,'+Buffer.from('\x89PNG\r\n\x1a\n','latin1').toString('base64');
 const r=await handler.fetch(post({content,baseRevision:'old-blob'}),env);assert.equal(r.status,200);const out=await r.json();assert.equal(out.production,false);assert.match(out.content.brand.logo,/^assets\/uploads\//);
 const writes=calls.filter(c=>c.method!=='GET');assert.equal(writes.filter(c=>c.path==='git/commits').length,1);const patch=writes.filter(c=>c.method==='PATCH');assert.equal(patch.length,1);assert.equal(patch[0].body.force,false);assert.equal(writes.at(-1),patch[0]);
 const tree=calls.find(c=>c.path==='git/trees').body.tree;assert.deepEqual(tree.map(t=>t.path).slice(-2),['assets/js/site-data.js','data/site-content.json']);assert.equal(tree.length,3);
});
test('concurrent branch update rejects rather than overwrites',async()=>{const {handler,content}=setup({concurrent:true});assert.equal((await handler.fetch(post({content,baseRevision:'old-blob'}),env)).status,409);});
test('invalid image rejected before writing any Git objects',async()=>{const {handler,calls,content}=setup();content.brand.logo='data:image/png;base64,AAAA';assert.equal((await handler.fetch(post({content,baseRevision:'old-blob'}),env)).status,422);assert.ok(calls.every(c=>c.method==='GET'));});
test('schema and dangerous URLs rejected',()=>{const content=sample();assert.doesNotThrow(()=>validateContent(content,sample()));content.pages['index.html'][0].key='bad"]';assert.throws(()=>validateContent(content,sample()));const d=sample();d.works[0].url='javascript:alert(1)';assert.throws(()=>validateContent(d,sample()));});
test('body length measured even without content-length',async()=>{const {handler}=setup();assert.equal((await handler.fetch(post({text:'x'.repeat(20_000_001)}),env)).status,413);});
test('preview allows same-origin frame; dashboard blocks framing',async()=>{const {handler}=setup();const assets={fetch:()=>new Response('<html>preview</html>')};for(const [path,expected] of [['/index.html',"'self'"],['/',"'none'"]]){const r=await handler.fetch(new Request('https://admin.example.test'+path),{...env,ASSETS:assets});assert.equal(r.status,200);assert.ok(r.headers.get('Content-Security-Policy').includes('frame-ancestors '+expected));assert.equal(r.headers.get('Cache-Control'),'no-store');}});
test('unknown API endpoint and methods rejected',async()=>{const {handler}=setup();assert.equal((await handler.fetch(new Request('https://admin.example.test/api/nope'),env)).status,404);assert.equal((await handler.fetch(new Request('https://admin.example.test/api/publish'),env)).status,405);});
test('new published images are available without redeploying the Worker bundle',async()=>{
 const encoded=Buffer.from('\x89PNG\r\n\x1a\n','latin1').toString('base64');
 const handler=createHandler({verify:async()=>({email:'founder@example.test'}),request:async()=>Response.json({content:encoded,sha:'image-blob'})});
 const r=await handler.fetch(new Request('https://admin.example.test/assets/uploads/2see-test.png'),{...env,ASSETS:{fetch:async()=>new Response('Not found',{status:404})}});
 assert.equal(r.status,200);assert.equal(r.headers.get('Content-Type'),'image/png');assert.equal((await r.arrayBuffer()).byteLength,8);
});
