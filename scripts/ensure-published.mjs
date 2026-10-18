import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const expected=JSON.parse(await readFile('data/snapshot.json','utf8'));
let published=null;
try{
 const response=await fetch('https://2seemedia.github.io/data/snapshot.json',{cache:'no-store',signal:AbortSignal.timeout(20000)});
 if(response.ok)published=await response.json();
}catch{}
if(published?.fingerprint===expected.fingerprint){console.log('The latest complete website is already live.');process.exit(0)}
const repository=process.env.REPOSITORY;
if(!/^[\w.-]+\/[\w.-]+$/.test(repository||''))throw Error('Repository is required');
// Retry publication even when a prior run committed successfully but its Pages
// build failed or was delayed. GITHUB_TOKEN commits do not start Pages builds.
const result=spawnSync('gh',['api','--method','POST',`repos/${repository}/pages/builds`],{stdio:'inherit'});
if(result.status!==0)throw Error('GitHub Pages build request failed; the next sync will retry.');
