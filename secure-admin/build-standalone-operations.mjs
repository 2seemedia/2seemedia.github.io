import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('./',import.meta.url);
export async function bundle(){
 const read=path=>readFile(new URL(path,root),'utf8');
 const [worker,monitor,page,app,style]=await Promise.all(['standalone-operations-worker.js','standalone-monitoring-worker.js','operations-ui/index.html','operations-ui/app.js','operations-ui/styles.css'].map(read));
 return monitor.replace('export default {','const monitoring = {')+'\n'+`const PAGE=${JSON.stringify(page)}, APP=${JSON.stringify(app)}, STYLE=${JSON.stringify(style)};\n`+worker.replace(/^import .*;\n/gm,'');
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const out=process.argv[2];if(!out)throw Error('Pass an explicit output file outside website assets');await writeFile(out,await bundle());console.log('Standalone Operations bundle ready: '+out);}
