// Local public-data UI fixture only. Never deployed or used for authentication tests.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');
 res.setHeader('Cache-Control','no-store');
 if(url.pathname.startsWith('/api/')){
  res.setHeader('Content-Type','application/json');
  if(url.pathname==='/api/session'){res.end(JSON.stringify({email:'معاينة محلية — بدون جلسة حقيقية',branch:'admin/content-staging',publishEnabled:false,production:false}));return;}
  if(url.pathname==='/api/content'){
   const source=await fs.readFile(path.join(root,'assets/js/site-data.js'),'utf8');
   res.end(JSON.stringify({content:JSON.parse(source.match(/=\s*([\s\S]*);\s*$/)[1]),revision:'local-preview-only'}));return;
  }
  res.statusCode=423;res.end(JSON.stringify({error:'النشر غير متاح في المعاينة المحلية'}));return;
 }
 const file=path.resolve(root,'.'+(url.pathname==='/'?'/dashboard.html':url.pathname));
 if(!file.startsWith(root+path.sep)){res.statusCode=403;res.end();return;}
 try{res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.statusCode=404;res.end('Not found');}
}).listen(8789,'127.0.0.1',()=>console.log('Public-data UI fixture on 8789; publishing disabled.'));
