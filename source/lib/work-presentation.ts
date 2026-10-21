import defaults from './reel-covers.json';
import {normalizeLink,type Work} from './portfolio';
import {serviceLabel,type Service} from './services';

// Original imports get a durable local cover; an owner's uploaded cover takes priority.
export function withWorkCover(item:Work):Work{
 let image=item.image;
 if(!image&&item.category==='reel'){
  try{image=(defaults as Record<string,string>)[normalizeLink(item.url)]||''}catch{}
 }
 return image===item.image?item:{...item,image};
}
export function publicWorkTitle(item:Work,lang:'ar'|'en'){
 const value=(lang==='ar'?item.titleAr:item.titleEn).trim();
 const generic=item.category==='reel'?/^(?:ريل(?:ز)?|reels?)\s*[\d٠-٩۰-۹\s._-]*$/i:item.category==='design'?/^(?:تصميم|تصاميم|ديزاين(?:ات)?|designs?)\s*[\d٠-٩۰-۹\s._-]*$/i:null;
 return generic?.test(value)?'':value;
}
export function publicProjectName(item:Work,lang:'ar'|'en'){return publicWorkTitle(item,lang)||item.client.trim()}
export function workService(item:Work,lang:'ar'|'en',services?:Service[]){return serviceLabel(item.service||({reel:'production',design:'design',ad:'marketing',motion:'editing',project:'content'}[item.category]),lang,services)}
