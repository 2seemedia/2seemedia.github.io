export const slideshowControlNames={previous:['زر السابق','Previous button'],next:['زر التالي','Next button'],dots:['نقاط التنقّل','Navigation dots'],pause:['زر تشغيل وإيقاف الحركة','Play / pause button']} as const;
export type SlideshowControl=keyof typeof slideshowControlNames;
export type ControlVisibility='visible'|'hidden'|'deleted';
export type SlideshowSettings={autoplay:boolean;intervalSeconds:number;controls:Record<SlideshowControl,ControlVisibility>};
export const defaultSlideshow:SlideshowSettings={autoplay:true,intervalSeconds:3,controls:{previous:'visible',next:'visible',dots:'visible',pause:'hidden'}};
export function validateSlideshow(input:unknown):SlideshowSettings{
 if(input===undefined)return structuredClone(defaultSlideshow);
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Invalid slideshow');
 const x=input as SlideshowSettings;if(typeof x.autoplay!=='boolean'||typeof x.intervalSeconds!=='number'||!Number.isInteger(x.intervalSeconds)||x.intervalSeconds<1||x.intervalSeconds>30)throw new Error('Invalid slideshow timing');
 if(!x.controls||typeof x.controls!=='object'||Array.isArray(x.controls))throw new Error('Invalid slideshow controls');
 const controls={} as SlideshowSettings['controls'];for(const k of Object.keys(defaultSlideshow.controls) as SlideshowControl[]){if(!['visible','hidden','deleted'].includes(x.controls[k]))throw new Error('Invalid slideshow control');controls[k]=x.controls[k]}
 return {autoplay:x.autoplay,intervalSeconds:x.intervalSeconds,controls};
}
