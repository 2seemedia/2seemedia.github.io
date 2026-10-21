import type {ImageVariants} from './images';
async function send(file:File){const body=new FormData();body.append('file',file);const r=await fetch('/api/upload',{method:'POST',body});if(!r.ok)throw Error('upload');return (await r.json() as {url:string}).url}
export async function uploadImage(file:File):Promise<{url:string;variants?:ImageVariants}>{
 if(!file.size||file.size>8*1024*1024)throw Error('size');const url=await send(file);let objectUrl='';
 try{
  // Keep the original for full-size design viewing. Derived WebP files are
  // thumbnails only; no contact form or visitor data is uploaded here.
  objectUrl=URL.createObjectURL(file);const image=new Image();image.src=objectUrl;await image.decode();const width=image.naturalWidth,height=image.naturalHeight;
  const widths=[...new Set([320,640,1200].map(n=>Math.min(n,width)))].sort((a,b)=>a-b),sources=[];
  for(const w of widths){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=Math.max(1,Math.round(height*w/width));const context=canvas.getContext('2d');if(!context)throw Error('canvas');context.drawImage(image,0,0,canvas.width,canvas.height);const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',.84));if(!blob||blob.type!=='image/webp')throw Error('format');sources.push({url:await send(new File([blob],'preview.webp',{type:'image/webp'})),width:w})}
  return {url,variants:{width,height,sources}};
 }catch{return {url}}finally{if(objectUrl)URL.revokeObjectURL(objectUrl)}
}
