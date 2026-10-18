import type {Work} from './portfolio';
export type ArtworkLayout={span:number;mobileSpan:number;width:number;mobileWidth:number;align:'start'|'center'|'end'};
export type DesignGallerySettings={columns:number;mobileColumns:number;gap:number;order:string[];artworks:Record<string,ArtworkLayout>};
export const defaultArtwork:ArtworkLayout={span:1,mobileSpan:1,width:100,mobileWidth:100,align:'center'};
export const defaultDesignGallery:DesignGallerySettings={columns:2,mobileColumns:1,gap:28,order:[],artworks:{}};
export function validateDesignGallery(input:unknown):DesignGallerySettings{
 if(input===undefined)return structuredClone(defaultDesignGallery);
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Invalid design gallery');const x=input as DesignGallerySettings;
 const number=(v:unknown,min:number,max:number)=>{if(typeof v!=='number'||!Number.isInteger(v)||v<min||v>max)throw new Error('Invalid artwork size');return v};
 const id=(v:unknown)=>typeof v==='string'&&/^[\w-]{1,80}$/.test(v)&&!['__proto__','prototype','constructor'].includes(v);
 if(!Array.isArray(x.order)||x.order.length>500||new Set(x.order).size!==x.order.length||!x.order.every(id))throw new Error('Invalid artwork order');
 if(!x.artworks||typeof x.artworks!=='object'||Array.isArray(x.artworks)||Object.keys(x.artworks).length>500)throw new Error('Invalid artworks');
 const artworks:Record<string,ArtworkLayout>={};for(const [key,v] of Object.entries(x.artworks)){if(!id(key)||!v||!['start','center','end'].includes(v.align))throw new Error('Invalid artwork');artworks[key]={span:number(v.span,1,4),mobileSpan:number(v.mobileSpan,1,2),width:number(v.width,25,100),mobileWidth:number(v.mobileWidth,25,100),align:v.align}}
 return {columns:number(x.columns,1,4),mobileColumns:number(x.mobileColumns,1,2),gap:number(x.gap,0,60),order:[...x.order],artworks};
}
export function arrangeDesigns(items:Work[],layout:DesignGallerySettings){const order=new Map(layout.order.map((id,i)=>[id,i]));return items.filter(x=>x.category==='design').map((item,index)=>({item,index})).sort((a,b)=>(order.get(a.item.id)??layout.order.length+a.index)-(order.get(b.item.id)??layout.order.length+b.index)).map(x=>x.item)}
export function reorderDesigns(ids:string[],id:string,before:string){if(!ids.includes(id))return ids;const next=ids.filter(x=>x!==id),at=next.indexOf(before);if(at<0||id===before)return ids;next.splice(at,0,id);return next}
export function portfolioCategoryLabel(copy:Record<string,string>|undefined,key:string,lang:'ar'|'en'){return copy?.[key]?.trim()||({all:['الكل','All work'],reel:['ريلز','Reels'],design:['تصاميم','Designs'],project:['مشاريع','Projects']}[key]||[key,key])[lang==='ar'?0:1]}
