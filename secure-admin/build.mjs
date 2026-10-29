import {cp,mkdir,rm,copyFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
await rm(path.join(root,'public'),{recursive:true,force:true});
await mkdir(path.join(root,'public'),{recursive:true});
for(const file of ['social-media-damascus.html','video-production-damascus.html','index.html','services.html','work.html','case-study.html','about.html','contact.html','careers.html','404.html','assets'])
 await cp(path.join(root,'..',file),path.join(root,'public',file),{recursive:true});
await copyFile(path.join(root,'ui/dashboard.html'),path.join(root,'public/dashboard.html'));
await copyFile(path.join(root,'ui/dashboard.js'),path.join(root,'public/assets/js/dashboard.js'));
await copyFile(path.join(root,'ui/login.html'),path.join(root,'public/login.html'));
await copyFile(path.join(root,'ui/login.js'),path.join(root,'public/assets/js/login.js'));
// Assets are always served behind the Worker authentication check.
await writeFile(path.join(root,'public/_headers'),'/*\n  X-Robots-Tag: noindex, nofollow\n');
console.log('Private admin and unchanged website preview assembled.');
