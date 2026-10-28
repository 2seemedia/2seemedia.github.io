/* 2SEE interaction layer: native cursor, progressive enhancement, no scroll hijack. */
(function(){
 'use strict';
 var hero=document.querySelector('.see-cinematic-hero');
 if(!hero)return;
 var motion=matchMedia('(prefers-reduced-motion: reduce)');
 var pointer=matchMedia('(hover: hover) and (pointer: fine)');
 var enabled=function(){return pointer.matches&&!motion.matches&&!(navigator.connection&&navigator.connection.saveData)};
 var lang=function(){return document.documentElement.lang==='ar'};
 var layer=document.createElement('div');layer.className='see-pointer-art';layer.setAttribute('aria-hidden','true');hero.append(layer);
 var pool=[],index=0,lastX=-999,lastY=-999,lastTime=0;
 var works=(window.SEE_CMS_DATA&&window.SEE_CMS_DATA.works||[]).filter(function(w){return w.visible!==false&&w.image});
 var sources=works.slice(0,3).map(function(w){return w.image});
 function clear(){pool.forEach(function(img){img.classList.remove('is-visible')});lastX=-999;lastY=-999}
 function setup(){
  if(pool.length||!sources.length)return;
  sources.forEach(function(src,i){var image=document.createElement('img');image.alt='';image.decoding='async';image.src=src;image.className='see-pointer-frame';image.style.setProperty('--turn',((i%2?1:-1)*(7+i*2))+'deg');layer.append(image);pool.push(image)});
 }
 hero.addEventListener('pointermove',function(e){
  if(!enabled()||e.pointerType==='touch'||e.target.closest('a,button,input,select,textarea'))return;
  var box=hero.getBoundingClientRect(),x=e.clientX-box.left,y=e.clientY-box.top;
  if(Math.hypot(x-lastX,y-lastY)<110||e.timeStamp-lastTime<140)return;
  setup();if(!pool.length)return;
  var image=pool[index++%pool.length];image.style.left=x+'px';image.style.top=y+'px';
  image.classList.remove('is-visible');void image.offsetWidth;image.classList.add('is-visible');
  lastX=x;lastY=y;lastTime=e.timeStamp;
 });
 hero.addEventListener('pointerleave',clear);
 var tip=document.createElement('div');tip.className='see-work-pointer';tip.setAttribute('aria-hidden','true');document.body.append(tip);
 var frame=0;
 document.addEventListener('pointermove',function(e){
  if(!enabled()){tip.classList.remove('is-visible');return}
  var cover=e.target.closest('#cms-home-work .see-work-cover,#cms-work-grid .see-work-cover');
  if(!cover){tip.classList.remove('is-visible');return}
  tip.textContent=lang()?'شاهد ↗':'VIEW ↗';tip.classList.add('is-visible');
  var x=e.clientX,y=e.clientY;
  if(frame)cancelAnimationFrame(frame);
  frame=requestAnimationFrame(function(){tip.style.transform='translate3d('+x+'px,'+y+'px,0)';frame=0});
 });
 document.addEventListener('pointerleave',function(){tip.classList.remove('is-visible')});
 document.addEventListener('focusin',function(){tip.classList.remove('is-visible')});
 function reset(){clear();tip.classList.remove('is-visible')}
 motion.addEventListener('change',reset);pointer.addEventListener('change',reset);
 document.addEventListener('visibilitychange',function(){if(document.hidden)reset()});
 var reveals=document.querySelectorAll('[data-cms-section="index.section5"] li,[data-cms-section="index.section7"] li');
 if('IntersectionObserver'in window&&!motion.matches){
  var observer=new IntersectionObserver(function(items){items.forEach(function(item){if(item.isIntersecting){item.target.classList.add('see-in-view');observer.unobserve(item.target)}})},{threshold:.12});
  reveals.forEach(function(el,i){el.classList.add('see-entry-reveal');el.style.setProperty('--reveal-delay',(i%4*65)+'ms');observer.observe(el)});
 }
})();