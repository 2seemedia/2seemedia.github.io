import assetMap from './image-assets.json';
export type ImageVariants={width:number;height:number;sources:{url:string;width:number}[]};
export type StudioImage={url:string;altAr:string;altEn:string;visible:boolean;variants?:ImageVariants};
export const emptyStudio:StudioImage={url:'',altAr:'من داخل استوديو 2SEE Media',altEn:'Inside the 2SEE Media studio',visible:true};
export function safeImageUrl(value:unknown){if(typeof value!=='string'||value.length>2000)throw Error('Invalid image');if(value===''||/^\/(assets|media)\/[A-Za-z0-9_.-]+$/.test(value))return value;const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)throw Error('Invalid image URL');return u.href}
export function validateImageVariants(input:unknown):ImageVariants|undefined{if(input===undefined)return;const x=input as ImageVariants;if(!x||!Number.isInteger(x.width)||!Number.isInteger(x.height)||x.width<1||x.width>30000||x.height<1||x.height>30000||!Array.isArray(x.sources)||x.sources.length>4)throw Error('Invalid image sizes');return {width:x.width,height:x.height,sources:x.sources.map(s=>{if(!Number.isInteger(s.width)||s.width<1||s.width>x.width)throw Error('Invalid image width');return {url:safeImageUrl(s.url),width:s.width}}).sort((a,b)=>a.width-b.width)}}
export function imageAttributes(url:string,provided?:ImageVariants,sizes='(max-width: 600px) 50vw, (max-width: 960px) 50vw, 33vw'){
 const v=provided||(assetMap as Record<string,ImageVariants>)[url];if(!v||!v.sources.length)return {src:url};
 const preferred=v.sources.find(s=>s.width>=960)||v.sources.at(-1)!;
 return {src:preferred.url,srcSet:v.sources.map(s=>s.url+' '+s.width+'w').join(', '),sizes,width:v.width,height:v.height};
}
export function responsiveHomeImages(html:string){return html.replace(/<img\b[^>]*>/gi,tag=>{const m=tag.match(/\bsrc=["']([^"']+)["']/);if(!m)return tag;const attrs=imageAttributes(m[1],undefined,'(max-width: 650px) 90vw, 40vw');if(!attrs.srcSet)return tag;return tag.replace(/\s(?:src|srcset|sizes|width|height|decoding)=["'][^"']*["']/gi,'').replace(/\/?\s*>$/,` src="${attrs.src}" srcset="${attrs.srcSet}" sizes="${attrs.sizes}" width="${attrs.width}" height="${attrs.height}" decoding="async">`)})}
