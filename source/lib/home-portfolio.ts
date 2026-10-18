import type {Work} from './portfolio';
import type {SiteContent} from './content';
import {publicWorkTitle} from './work-presentation';
import {validateSlideshow} from './slideshow';
import {homeSliderScript} from './home-slider';

const escape=(value:string)=>value.replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]!));
const localized=(ar:string,en:string)=>`<span class="cms-ar" dir="rtl">${escape(ar)}</span><span class="cms-en" dir="ltr">${escape(en)}</span>`;

export function selectHomeWorks(items:Work[],limit=9){
 return items.filter(item=>item.category==='reel'&&item.visible&&!item.deleted&&item.image.trim()).sort((a,b)=>Number(b.featured)-Number(a.featured)).slice(0,limit);
}
export function projectPath(item:Pick<Work,'id'|'category'>){
 return `/work?type=${encodeURIComponent(item.category)}&work=${encodeURIComponent(item.id)}`;
}
export function renderHomePortfolio(content:SiteContent,items:Work[]){
 const selected=selectHomeWorks(items);
 const cards=selected.map((item,i)=>{
  const category=content.fieldStates?.['portfolio:reel']?'':localized(content.portfolio.ar.reel,content.portfolio.en.reel);
  const ar=publicWorkTitle(item,'ar'),en=publicWorkTitle(item,'en');
  return `<a class="home-work-card" href="${escape(projectPath(item))}" aria-label="${escape(ar||en||'▶ 2SEE Media')}" data-slide="${i}" data-title-ar="${escape(ar)}" data-title-en="${escape(en)}"><img class="home-work-image" src="${escape(item.image)}" alt="" width="720" height="1280" loading="lazy" decoding="async"><span class="home-work-shade"></span><span class="home-work-action" aria-hidden="true">▶</span><div class="home-work-caption">${category?`<span class="home-work-kind" data-text-id="portfolio:reel">${category}</span>`:''}${ar||en?`<h3>${localized(ar,en)}</h3>`:''}${item.client?`<span class="home-work-client">${escape(item.client)}</span>`:''}</div></a>`;
 }).join('');
 const slideshow=validateSlideshow(content.design?.slideshow),show=(key:keyof typeof slideshow.controls)=>slideshow.controls[key]==='visible';
 const previous=show('previous')?`<button type="button" data-slider-prev data-slideshow-control="previous">${localized('السابق','Previous')} <span aria-hidden="true">‹</span></button>`:'';
 const next=show('next')?`<button type="button" data-slider-next data-slideshow-control="next">${localized('التالي','Next')} <span aria-hidden="true">›</span></button>`:'';
 const dots=show('dots')?'<div class="home-slider-dots" data-slideshow-control="dots" aria-label="Slides"></div>':'';
 const pause=show('pause')?`<button type="button" class="home-slider-pause" data-slider-pause data-slideshow-control="pause" aria-pressed="false">${localized('إيقاف الحركة','Pause slideshow')}</button>`:'';
 const controls=selected.length>1&&(previous||next||dots||pause)?`<div class="home-slider-controls">${previous||next?`<div class="home-slider-arrows">${previous}${next}</div>`:''}${dots}${pause}</div>`:'';
 const status=selected.length>1?'<p class="sr-home-status" data-slider-status role="status" aria-live="polite"></p>':'';
 return `<section class="content-section home-portfolio" id="topWorkSpotlight"><div class="container"><div class="home-portfolio-head"><div><span class="kicker home-work-kicker"></span><h2>${escape(String(content.translations.ar.topWorkTitle))}</h2><p class="home-work-intro"></p></div><a class="btn btn-primary home-work-all" href="/work?type=reel"><span class="home-work-button"></span><span aria-hidden="true">↗</span></a></div>${cards?`<div class="home-reel-slider" data-autoplay="${slideshow.autoplay}" data-interval="${slideshow.intervalSeconds*1000}" role="region" aria-roledescription="carousel"><div class="home-work-grid" id="homeReelTrack">${cards}</div>${controls}${status}</div><script>${homeSliderScript}</script>`:''}</div></section>`;
}
