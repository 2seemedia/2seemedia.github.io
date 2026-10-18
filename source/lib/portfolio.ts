export type Work = {id:string; category:'reel'|'design'|'project';titleAr:string;titleEn:string;descriptionAr:string;descriptionEn:string;client:string;url:string;image:string;visible:boolean;featured:boolean;deleted:boolean};
export type Collection = {items:Work[];revision:number;updatedAt:string|null};
export function normalizeLink(value:string){
  if(!value.trim())return '';
  const u=new URL(value.trim());
  if(u.protocol!=='https:'||u.username||u.password)throw new Error('Use an HTTPS link');
  if(u.hostname==='instagram.com'||u.hostname==='www.instagram.com'){
    const match=u.pathname.match(/^\/(reel|reels|p)\/([A-Za-z0-9_-]+)(?:\/|$)/);
    if(match)return `https://www.instagram.com/${match[1]==='reels'?'reel':match[1]}/${match[2]}/`;
  }
  for(const k of [...u.searchParams.keys()])if(k.startsWith('utm_')||['igsh','igshid','fbclid','si'].includes(k))u.searchParams.delete(k);
  return u.href;
}
export function embedLink(value:string){
  try{const u=new URL(value);if(['instagram.com','www.instagram.com'].includes(u.hostname)&&/^\/(reel|p)\/[\w-]+\/$/.test(u.pathname))return u.origin+u.pathname+'embed/';
    const id=u.hostname==='youtu.be'?u.pathname.slice(1):['www.youtube.com','youtube.com'].includes(u.hostname)?(u.searchParams.get('v')||u.pathname.match(/^\/shorts\/([\w-]+)/)?.[1]):null;
    if(id&&/^[\w-]{11}$/.test(id))return 'https://www.youtube-nocookie.com/embed/'+id;
    if(u.hostname==='vimeo.com'&&/^\/\d+$/.test(u.pathname))return 'https://player.vimeo.com/video'+u.pathname;
  }catch{}return '';
}
export function validateItems(input:unknown):Work[]{
  if(!Array.isArray(input)||input.length>500)throw new Error('Invalid collection');
  const ids=new Set<string>(),links=new Set<string>();
  return input.map((x)=>{
    if(!x||typeof x!=='object')throw new Error('Invalid work');
    const value=x as Record<string,unknown>;
    const str=(key:string,max:number)=>{if(typeof value[key]!=='string'||(value[key] as string).length>max)throw new Error('Invalid '+key);return (value[key] as string).trim()};
    const id=str('id',80);if(!/^[\w-]+$/.test(id)||ids.has(id))throw new Error('Duplicate ID');ids.add(id);
    const category=str('category',20) as Work['category'];if(!['reel','design','project'].includes(category))throw new Error('Invalid category');
    const titleAr=str('titleAr',140),titleEn=str('titleEn',140);if(category!=='reel'&&(!titleAr||!titleEn))throw new Error('Both titles are required');
    const url=normalizeLink(str('url',2000));if(category!=='design'&&!url)throw new Error('A link is required');
    if(category==='reel'&&!embedLink(url))throw new Error('Use an Instagram, YouTube or Vimeo video link');
    const image=str('image',2000);if(image&&!/^\/(assets|media)\/[A-Za-z0-9._-]+$/.test(image)){const u=new URL(image);if(u.protocol!=='https:'||u.username||u.password)throw new Error('Invalid cover URL')}
    if(category==='design'&&!image&&!url)throw new Error('Add an image or link');
    for(const k of ['visible','featured','deleted'])if(typeof value[k]!=='boolean')throw new Error('Invalid status');
    if(url&&!value.deleted){if(links.has(url))throw new Error('This link already exists');links.add(url)}
    return {id,category,titleAr,titleEn,descriptionAr:str('descriptionAr',2000),descriptionEn:str('descriptionEn',2000),client:str('client',100),url,image,visible:value.visible as boolean,featured:value.featured as boolean,deleted:value.deleted as boolean};
  });
}
