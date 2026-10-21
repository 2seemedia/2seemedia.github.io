import assets from './founder-assets.json';
import {safeImageUrl,validateImageVariants,type ImageVariants} from './images';
import type {SiteContent,Section} from './content';
export type Founder={id:string;nameAr:string;nameEn:string;roleAr:string;roleEn:string;image:string;imageVariants?:ImageVariants;positionY:number;visible:boolean;deleted:boolean};
export const defaultFounders:Founder[]=[
 {id:'mohamad-alshafi',nameAr:'Mohamad alshafi',nameEn:'Mohamad alshafi',roleAr:'Co-Founder',roleEn:'Co-Founder',image:assets['mohamad-alshafi'].url,imageVariants:assets['mohamad-alshafi'].variants,positionY:50,visible:true,deleted:false},
 {id:'esraa-mansour',nameAr:'Esraa mansour',nameEn:'Esraa mansour',roleAr:'Co-Founder',roleEn:'Co-Founder',image:assets['esraa-mansour'].url,imageVariants:assets['esraa-mansour'].variants,positionY:50,visible:true,deleted:false}
];
export function validateFounders(input:unknown):Founder[]{
 if(input===undefined)return structuredClone(defaultFounders);
 if(!Array.isArray(input)||input.length>12)throw Error('Invalid founders');
 const ids=new Set<string>(),text=(v:unknown,max:number)=>{if(typeof v!=='string'||v.length>max)throw Error('Invalid founder text');return v};
 return input.map(f=>{
  if(!f||typeof f!=='object'||!/^[a-zA-Z0-9_-]{1,80}$/.test(f.id)||['__proto__','constructor','prototype'].includes(f.id)||ids.has(f.id))throw Error('Invalid founder ID');ids.add(f.id);
  if(typeof f.visible!=='boolean'||typeof f.deleted!=='boolean')throw Error('Invalid founder visibility');
  const positionY=f.positionY===undefined?50:f.positionY;
  if(typeof positionY!=='number'||!Number.isFinite(positionY)||positionY<0||positionY>100)throw Error('Invalid portrait position');
  return {id:f.id,nameAr:text(f.nameAr,160),nameEn:text(f.nameEn,160),roleAr:text(f.roleAr,160),roleEn:text(f.roleEn,160),image:safeImageUrl(f.image),imageVariants:validateImageVariants(f.imageVariants),positionY,visible:f.visible,deleted:f.deleted};
 });
}
export function withFoundersSection(value:SiteContent):SiteContent{
 if(!Array.isArray(value.sections)||value.sections.some(s=>s.id==='founders'))return value;
 const sections=[...value.sections],at=sections.findIndex(s=>s.id==='about');
 const section:Section={id:'founders',kind:'original',labelAr:'المؤسسون',labelEn:'Founders',visible:true,deleted:false};
 sections.splice(at<0?sections.length:at+1,0,section);return {...value,sections};
}
