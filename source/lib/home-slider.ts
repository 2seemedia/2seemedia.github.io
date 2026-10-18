export const homeSliderScript=String.raw`
(()=>{
 const root=document.querySelector('.home-reel-slider');if(!root)return;
 const track=root.querySelector('.home-work-grid');if(!track)return;
 const cards=[...track.querySelectorAll('.home-work-card')];if(!cards.length)return;
 const dots=root.querySelector('.home-slider-dots'),pause=root.querySelector('[data-slider-pause]'),status=root.querySelector('[data-slider-status]');
 const small=matchMedia('(max-width:650px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const autoplay=root.dataset.autoplay!=='false';
 const delay=Math.max(1000,Math.min(30000,Number(root.dataset.interval)||3000));
 let page=0,paused=!autoplay||reduced.matches,inView=false,touching=false,timer,settle;
 const size=()=>small.matches?1:3,count=()=>Math.ceil(cards.length/size()),ar=()=>document.documentElement.lang==='ar';
 function clear(){clearInterval(timer);timer=undefined}
 function schedule(reset=false){if(reset)clear();const active=!paused&&inView&&!touching&&!track.contains(document.activeElement)&&!document.hidden&&count()>1;if(!active){clear();return}if(timer===undefined)timer=setInterval(()=>go(page+1),delay)}
 function labels(){
  cards.forEach((card,i)=>card.setAttribute('aria-label',card.dataset[ar()?'titleAr':'titleEn']||(ar()?'مشاهدة الريل ':'Watch reel ')+(i+1)+' / '+cards.length));
  if(pause){pause.setAttribute('aria-pressed',String(paused));pause.innerHTML='<span class="cms-ar">'+(paused?'تشغيل الحركة':'إيقاف الحركة')+'</span><span class="cms-en">'+(paused?'Play slideshow':'Pause slideshow')+'</span>'}
  root.setAttribute('aria-label',ar()?'مختارات من ريلز 2SEE':'Selected reels by 2SEE');root.dataset.sliderPage=String(page);root.dataset.sliderPaused=String(paused);
  if(dots){dots.setAttribute('aria-label',ar()?'مجموعات الريلز':'Reel slides');[...dots.children].forEach((b,i)=>{b.setAttribute('aria-label',(ar()?'انتقل للمجموعة ':'Go to slide ')+(i+1));b.setAttribute('aria-current',String(i===page))})}
 }
 function go(next,manual=false){page=(next+count())%count();const r=track.getBoundingClientRect(),c=cards[page*size()].getBoundingClientRect();track.scrollBy({left:document.documentElement.dir==='rtl'?c.right-r.right:c.left-r.left,behavior:reduced.matches?'instant':'smooth'});labels();if(manual&&status)status.textContent=(ar()?'المجموعة ':'Slide ')+(page+1)+' / '+count();schedule(manual)}
 function layout(){if(dots){dots.replaceChildren();for(let i=0;i<count();i++){const b=document.createElement('button');b.type='button';b.addEventListener('click',()=>go(i,true));dots.appendChild(b)}}page=Math.min(page,count()-1);labels();go(page)}
 root.querySelector('[data-slider-prev]')?.addEventListener('click',()=>go(page-1,true));root.querySelector('[data-slider-next]')?.addEventListener('click',()=>go(page+1,true));pause?.addEventListener('click',()=>{paused=!paused;labels();schedule(true)});
 track.addEventListener('scroll',()=>{clearTimeout(settle);settle=setTimeout(()=>{const r=track.getBoundingClientRect();let nearest=0,distance=Infinity;cards.forEach((card,i)=>{if(i%size())return;const c=card.getBoundingClientRect(),d=Math.abs(document.documentElement.dir==='rtl'?c.right-r.right:c.left-r.left);if(d<distance){distance=d;nearest=i/size()}});page=nearest;labels();schedule()},160)},{passive:true});
 root.addEventListener('focusin',()=>schedule());root.addEventListener('focusout',()=>setTimeout(schedule,0));track.addEventListener('pointerdown',()=>{touching=true;clear()});window.addEventListener('pointerup',()=>{touching=false;schedule()});track.addEventListener('pointercancel',()=>{touching=false;schedule()});
 document.addEventListener('visibilitychange',()=>schedule());new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule()},{threshold:.15}).observe(root);
 small.addEventListener('change',layout);reduced.addEventListener('change',()=>{paused=!autoplay||reduced.matches;labels();schedule(true)});new MutationObserver(()=>{labels();go(page)}).observe(document.documentElement,{attributes:true,attributeFilter:['dir']});layout();
})();`;
