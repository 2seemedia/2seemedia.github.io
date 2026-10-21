'use client';
import {Play,ArrowUpRight} from 'lucide-react';
import {embedLink,type Work} from '../../lib/portfolio';
import {imageAttributes} from '../../lib/images';
import {publicProjectName,workService} from '../../lib/work-presentation';
import type {Service} from '../../lib/services';
export default function WorkGallery({items,lang,onOpen,services}:{items:Work[];lang:'ar'|'en';onOpen:(item:Work)=>void;services?:Service[]}){
 return <div className="works-grid spec-work-grid">{items.map(item=>{const name=publicProjectName(item,lang),label=name||(lang==='ar'?'مشاهدة العمل':'View project'),video=!!embedLink(item.url)&&item.category!=='design';const image=item.image?<img {...imageAttributes(item.image,item.imageVariants)} alt={item.category==='design'?label:''} loading="lazy" decoding="async"/>:<div className="spec-cover-empty"><span>2SEE MEDIA</span></div>;return <article className={'spec-work-card '+item.category} key={item.id} data-work-id={item.id}>
  {item.category==='design'?<a className="spec-design-media" href={item.image||item.url} target="_blank" rel="noopener noreferrer" aria-label={(lang==='ar'?'فتح التصميم الكامل: ':'Open full design: ')+label}>{image}<span className="spec-design-expand" aria-hidden="true"><ArrowUpRight size={18}/></span></a>:<button type="button" className="spec-work-media" aria-label={label} aria-haspopup="dialog" onClick={()=>onOpen(item)}>{image}<span className="spec-work-open" aria-hidden="true">{video?<Play size={21} fill="currentColor"/>:<ArrowUpRight size={23}/>}</span></button>}
  <div className="spec-work-caption">{name&&<h2>{name}</h2>}<p>{workService(item,lang,services)}</p></div>
 </article>})}</div>
}
