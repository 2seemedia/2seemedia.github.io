import {defaultDesignGallery,validateDesignGallery,type DesignGallerySettings} from './design-gallery';
import {defaultSlideshow,validateSlideshow,type SlideshowSettings} from './slideshow';
import {defaultTypography,validateTypography,type SiteTypography} from './typography';
export type LogoPosition='auto'|'left'|'center'|'right';
export type LogoPlacement={visible:boolean;width:number;position:LogoPosition};
export type MobileDesign={headerSticky:boolean;contactLayout:'stacked'|'columns';logo:{header:LogoPlacement;hero:LogoPlacement;contact:LogoPlacement}};
export const defaultMobileDesign:MobileDesign={headerSticky:true,contactLayout:'stacked',logo:{header:{visible:true,width:52,position:'auto'},hero:{visible:false,width:180,position:'center'},contact:{visible:true,width:156,position:'center'}}};
export type SiteDesign={mobile:MobileDesign;designGallery:DesignGallerySettings;slideshow:SlideshowSettings;typography:SiteTypography;logo:{url:string;visible:boolean;originalColors:boolean;header:LogoPlacement;hero:LogoPlacement;contact:LogoPlacement};theme:{enabled:boolean;background:string;surface:string;accent:string;silver:string;text:string;muted:string;spacing:number;radius:number}};
export const defaultDesign:SiteDesign={mobile:structuredClone(defaultMobileDesign),designGallery:structuredClone(defaultDesignGallery),slideshow:structuredClone(defaultSlideshow),typography:structuredClone(defaultTypography),logo:{url:'/assets/original-7.png',visible:true,originalColors:false,header:{visible:true,width:52,position:'auto'},hero:{visible:true,width:380,position:'center'},contact:{visible:true,width:270,position:'center'}},theme:{enabled:false,background:'#f7f5f1',surface:'#ffffff',accent:'#801c2b',silver:'#c4c4c4',text:'#262326',muted:'#746a70',spacing:84,radius:24}};
export function validateDesign(value:unknown):SiteDesign{
 if(value===undefined)return structuredClone(defaultDesign);
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid design');
 const x=value as SiteDesign,base=defaultDesign;
 const bool=(v:unknown)=>{if(typeof v!=='boolean')throw new Error('Invalid design option');return v};
 const num=(v:unknown,min:number,max:number)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw new Error('Invalid design size');return Math.round(v)};
 const color=(v:unknown)=>{if(typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v))throw new Error('Invalid design color');return v.toLowerCase()};
 const logo=x.logo;if(!logo||!x.theme)throw new Error('Invalid design');
 if(typeof logo.url!=='string'||logo.url.length>2000)throw new Error('Invalid logo');
 // Logos are uploaded through the owner's image uploader, never arbitrary HTML or SVG.
 if(logo.url&&!/^\/(?:assets|media)\/[A-Za-z0-9_-]+\.(?:png|jpe?g|webp|gif)$/i.test(logo.url))throw new Error('Upload a logo image');
 const place=(v:LogoPlacement,min:number,max:number):LogoPlacement=>{if(!v||!['auto','left','center','right'].includes(v.position))throw new Error('Invalid logo position');return {visible:bool(v.visible),width:num(v.width,min,max),position:v.position}};
 const m=x.mobile??{...structuredClone(defaultMobileDesign),logo:{...structuredClone(defaultMobileDesign.logo),header:{...defaultMobileDesign.logo.header,visible:logo.header?.visible??true},contact:{...defaultMobileDesign.logo.contact,visible:logo.contact?.visible??true}}};
 if(!m||typeof m!=='object'||!['stacked','columns'].includes(m.contactLayout)||!m.logo)throw new Error('Invalid mobile layout');
 const mobile:MobileDesign={headerSticky:bool(m.headerSticky),contactLayout:m.contactLayout,logo:{header:place(m.logo.header,28,110),hero:place(m.logo.hero,100,520),contact:place(m.logo.contact,60,360)}};
 const theme={...base.theme,enabled:bool(x.theme.enabled),spacing:num(x.theme.spacing,32,140),radius:num(x.theme.radius,0,48)};
 for(const key of ['background','surface','accent','silver','text','muted'] as const)theme[key]=color(x.theme[key]);
 return {mobile,designGallery:validateDesignGallery(x.designGallery),slideshow:validateSlideshow(x.slideshow),typography:validateTypography(x.typography),logo:{url:logo.url,visible:bool(logo.visible),originalColors:bool(logo.originalColors),header:place(logo.header,28,110),hero:place(logo.hero,100,520),contact:place(logo.contact,60,360)},theme};
}
export function logoIsVisible(design:SiteDesign,location:'header'|'hero'|'contact',device:'desktop'|'mobile'|'any'='desktop'){return !!design.logo.url&&design.logo.visible&&(device==='any'?(design.logo[location].visible||design.mobile.logo[location].visible):device==='mobile'?design.mobile.logo[location].visible:design.logo[location].visible)}
