'use client';
import type {CSSProperties} from 'react';
import type {Work} from '../../lib/portfolio';
import {defaultArtwork,type DesignGallerySettings} from '../../lib/design-gallery';
import {publicWorkTitle} from '../../lib/work-presentation';
import dimensions from '../../lib/design-dimensions.json';
export default function DesignGallery({items,layout,lang,editor,mobile=false}:{items:Work[];layout:DesignGallerySettings;lang:'ar'|'en';mobile?:boolean;editor?:{selected:string;onSelect:(id:string)=>void}}){
 return <div className={'works-grid gallery-grid design-gallery custom-design-gallery'+(mobile?' force-mobile':editor?' force-desktop':'')} style={{'--art-columns':layout.columns,'--art-mobile-columns':layout.mobileColumns,'--art-gap':layout.gap+'px'} as CSSProperties}>{items.map(item=>{const a=layout.artworks[item.id]||defaultArtwork,size=(dimensions as Record<string,{width:number;height:number}>)[item.image],label=publicWorkTitle(item,lang)||(lang==='ar'?'تصميم من أعمال 2SEE Media':'Design by 2SEE Media');return <article key={item.id} data-artwork-id={item.id} className={'work-card gallery-card design'+(editor?.selected===item.id?' artwork-selected':'')} style={{'--art-span':Math.min(a.span,layout.columns),'--art-mobile-span':Math.min(a.mobileSpan,layout.mobileColumns),'--art-width':a.width+'%','--art-mobile-width':a.mobileWidth+'%','--art-align':a.align} as CSSProperties}>
  <figure className="design-artwork">{item.image?<img src={item.image} alt={label} width={size?.width} height={size?.height} loading="lazy" decoding="async"/>:<div className="artwork-no-image">{editor?(lang==='ar'?'أضيفي صورة لهذا التصميم من إدارة الأعمال':'Add an image in Work & images'):<a href={item.url} target="_blank" rel="noopener noreferrer">{lang==='ar'?'عرض التصميم':'View design'}</a>}</div>}</figure>
  {editor&&<button type="button" className="artwork-select" aria-label={(lang==='ar'?'تعديل حجم ومكان: ':'Resize and arrange: ')+(item.titleAr||item.id)} aria-pressed={editor.selected===item.id} onClick={()=>editor.onSelect(item.id)}><span>{lang==='ar'?'تعديل التصميم':'Edit design'}</span></button>}
 </article>})}</div>
}
