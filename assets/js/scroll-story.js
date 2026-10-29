/* 2SEE scroll story — normal page scroll, pinned headline, real project covers. */
(function(){
 'use strict';
 var ar=document.documentElement.lang==='ar',data=window.SEE_CMS_DATA||{},motion=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 var clamp=function(x,a,b){return Math.max(a,Math.min(b,x))};
 function rgb(hex){var m=/^#([0-9a-f]{6})$/i.exec(hex.trim());return m?[0,2,4].map(function(i){return parseInt(m[1].slice(i,i+2),16)}):[201,21,36]}
 function mix(a,b,t){return a.map(function(v,i){return Math.round(v+(b[i]-v)*t)})}
 function localize(){document.querySelectorAll('[data-v3-en]').forEach(function(e){e.textContent=e.getAttribute(ar?'data-v3-ar':'data-v3-en')})}
 localize();document.querySelectorAll('.v3-nav').forEach(function(nav){nav.setAttribute('aria-label',ar?'القائمة الرئيسية':'Main navigation')});
 var track=document.getElementById('v3-opening-track'),opening=document.querySelector('.v3-opening'),stack=document.querySelector('.v3-stack-pictures'),stackImages=stack?Array.from(stack.querySelectorAll('img')):[],stackIndex=-1,stackManual=false;
 function setStack(index){if(!stackImages.length)return;index=(index+stackImages.length)%stackImages.length;if(index===stackIndex)return;stackIndex=index;stackImages.forEach(function(image,i){var active=i===index;image.style.zIndex=active?'3':'1';image.style.transform='translateY('+(active?0:8)+'px) rotate('+(active?-2:(i%2?6:-6))+'deg)';image.style.opacity=active?'1':'.9'})}
 var founderBoxes=Array.from(document.querySelectorAll('.v3-founder-bio'));
 function selectFounder(index){stackManual=true;setStack(index);founderBoxes.forEach(function(box,i){box.classList.toggle('is-active',i===index);box.setAttribute('aria-pressed',i===index?'true':'false')});stackImages.forEach(function(image,i){image.style.opacity=i===index?'1':'0'});}
 founderBoxes.forEach(function(box,i){box.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')selectFounder(i)});box.addEventListener('focus',function(){selectFounder(i)});box.addEventListener('click',function(){selectFounder(i)});box.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();selectFounder(i)}})});
 if(founderBoxes.length)selectFounder(0);else setStack(0);
 document.querySelectorAll('.v2-service').forEach(function(detail){detail.open=false;detail.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'&&fine.matches){document.querySelectorAll('.v2-service').forEach(function(other){other.open=other===detail})}});detail.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'&&!detail.contains(document.activeElement))detail.open=false});});
 document.querySelectorAll('[data-stack-next],[data-stack-prev]').forEach(function(button){button.addEventListener('click',function(){stackManual=true;setStack(stackIndex+(button.hasAttribute('data-stack-next')?1:-1))})});
 function safeUrl(value){try{var url=new URL(value,location.href);return ['http:','https:'].includes(url.protocol)?url.href:'#'}catch(e){return '#'}}
 if(track){
  var works=(data.works||[]).filter(function(w){return w.visible!==false&&w.image}),seen=new Set(),featured=works.filter(function(w){return w.featured}),designs=works.filter(function(w){return w.type==='design'});
  var selected=featured.concat(designs,works).filter(function(w){if(seen.has(w.image))return false;seen.add(w.image);return true}).slice(0,10);
  selected.forEach(function(work,i){
   var card=document.createElement('article');card.className='v3-project';
   var link=document.createElement('a');link.href=safeUrl(work.url||work.image);link.target='_blank';link.rel='noopener noreferrer';link.draggable=false;link.setAttribute('aria-label',ar?'عرض المشروع':'View project');
   var image=document.createElement('img');image.src=safeUrl(work.image);image.alt='';image.width=360;image.height=640;image.decoding='async';image.loading=i<2?'eager':'lazy';image.draggable=false;
   image.onerror=function(){image.onerror=null;image.src='assets/img/2see-placeholder.svg'};
   var label=document.createElement('span');label.className='v3-project-open';label.textContent=ar?'عرض المشروع ↗':'View project ↗';
   link.append(image,label);card.append(link);
   var caption=document.createElement('p');caption.className='v3-project-caption';caption.textContent=work.type==='design'?(ar?'تصميم غرافيكي':'Graphic design'):(ar?'إنتاج وصناعة محتوى':'Production & content');card.append(caption);track.append(card);
  });
  var previous=document.querySelector('[data-gallery-prev]'),next=document.querySelector('[data-gallery-next]');
  function scrollCards(direction){track.scrollBy({left:direction*track.clientWidth*.65,behavior:motion.matches?'auto':'smooth'})}
  function updateControls(){if(previous)previous.disabled=track.scrollLeft<=1;if(next)next.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-2}
  track.addEventListener('scroll',updateControls,{passive:true});addEventListener('resize',updateControls);requestAnimationFrame(updateControls);
  if(previous)previous.addEventListener('click',function(){scrollCards(-1)});if(next)next.addEventListener('click',function(){scrollCards(1)});
  var drag=null,dragged=false;
  track.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,left:track.scrollLeft};dragged=false});
  track.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-drag.x;if(Math.abs(dx)>6){dragged=true;track.classList.add('is-dragging');if(!track.hasPointerCapture(e.pointerId))track.setPointerCapture(e.pointerId);track.scrollLeft=drag.left-dx}});
  function stopDrag(){drag=null;track.classList.remove('is-dragging')}
  track.addEventListener('pointerup',stopDrag);track.addEventListener('pointercancel',stopDrag);track.addEventListener('lostpointercapture',stopDrag);
  track.addEventListener('click',function(e){if(dragged){e.preventDefault();dragged=false}},true);
 }
 var intro=document.querySelector('.v2-intro'),services=document.querySelector('.v2-services'),team=document.querySelector('.v2-team'),process=document.querySelector('.v2-process');
 if(opening)document.body.classList.add('story-ready');
 var accent=rgb(getComputedStyle(document.documentElement).getPropertyValue('--color-cobalt')||'#c91524');
 var themes=[{el:opening,color:accent},{el:intro,color:[244,242,235]},{el:services,color:[207,207,201]},{el:team,color:[244,242,235]},{el:process,color:[224,223,217]}].filter(function(x){return x.el});
 var pending=false;
 function update(){
  pending=false;document.body.classList.toggle('v3-is-scrolled',scrollY>40);
  if(opening){
   var rect=opening.getBoundingClientRect(),p=clamp(-rect.top/Math.max(1,rect.height-innerHeight),0,1);
   document.body.style.setProperty('--story-title-opacity',motion.matches?1:1-clamp((p-.7)/.3,0,1));
   document.body.style.setProperty('--story-hint-opacity',1-clamp(p/.2,0,1));
   document.body.style.setProperty('--story-label-opacity',clamp((p-.18)/.42,0,1));
   var color=accent.slice(),previousColor=accent.slice();
   themes.slice(1).forEach(function(theme){var top=theme.el.getBoundingClientRect().top,t=clamp((innerHeight*.82-top)/(innerHeight*.82),0,1);if(t>0)color=mix(previousColor,theme.color,motion.matches?1:t);previousColor=theme.color});
   document.body.style.setProperty('--story-bg','rgb('+color.join(',')+')');
  }
  if(stack&&!stackManual&&!motion.matches){var box=stack.parentElement.getBoundingClientRect(),progress=clamp((innerHeight*.72-box.top)/Math.max(1,box.height),0,.999);setStack(Math.floor(progress*stackImages.length))}
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(update)}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);motion.addEventListener('change',schedule);update();
 var scenes=[['1765372860684-69f0e2524694','kqLeFAf9npk'],['1637665599155-abfcf9fc3f78','bV5dFLEYecM'],['1768885509990-1ebfd3e0257b','WPxiEFsSEzw'],['1768076955015-dd4f057e96f6','beHPut9RwUM'],['1768222935380-0a3a76fbb42e','X8uonmU2Ssw']];
 var sceneImage=document.querySelector('.v4-scene-image'),sceneButtons=Array.from(document.querySelectorAll('[data-scene]')),credit=document.querySelector('.v4-photo-credit a');
 function selectScene(index){if(!sceneImage)return;var scene=scenes[index];sceneImage.src='https://images.unsplash.com/photo-'+scene[0]+'?auto=format&fit=crop&w=1600&q=80';sceneButtons.forEach(function(button,i){button.setAttribute('aria-pressed',i===index?'true':'false')});if(credit)credit.href='https://unsplash.com/photos/'+scene[1];}
 sceneButtons.forEach(function(button,i){button.addEventListener('click',function(){selectScene(i)})});
 var page=location.pathname.split('/').pop().replace('.html','');selectScene(({about:1,work:2,services:3,careers:4,'case-study':4})[page]||0);
 var footerEmail=document.querySelector('.v3-footer-email');if(footerEmail&&data.brand&&data.brand.email){footerEmail.href='mailto:'+data.brand.email;footerEmail.textContent=data.brand.email+' ↗'}
 var floor=document.querySelector('.v3-footer-floor');if(!floor)return;
 var badges=Array.from(floor.querySelectorAll('.v3-badge')),bodies=[],raf=0,visible=false,started=false,last=0,frames=0,held=null,moved=false;
 var brand=data.brand||{};var replacements=[brand.instagram,brand.whatsapp?'https://wa.me/'+brand.whatsapp:null,brand.email?'mailto:'+brand.email:null,brand.youtube];replacements.forEach(function(href,i){if(href&&badges[i])badges[i].href=href});
 function placeStatic(){floor.classList.add('has-layout');var width=floor.clientWidth||800,height=floor.clientHeight||230,x=10,y=0,row=0,layout=[];badges.forEach(function(el){var w=el.offsetWidth||100,h=el.offsetHeight||44;if(x+w>width-10&&x>10){y+=row+16;x=10;row=0}layout.push({el:el,x:x,y:y,h:h});x+=w+12;row=Math.max(row,h)});var total=y+row,offset=Math.max(8,height-total-15);layout.forEach(function(item,i){item.el.style.left='0';item.el.style.top='0';item.el.style.transform='translate('+item.x+'px,'+(item.y+offset)+'px) rotate('+((i%3-1)*7)+'deg)'})}
 function measure(){var width=floor.clientWidth,height=floor.clientHeight;if(!width||!height){placeStatic();return false}
  bodies=badges.map(function(el,i){return {el:el,x:clamp((i+.4)/badges.length*width,4,width-(el.offsetWidth||110)-4),y:-70-i*26,w:el.offsetWidth||110,h:el.offsetHeight||44,vx:(i%2?1:-1)*1.1,vy:0,angle:(i%3-1)*12}});
  return true;
 }
 function render(){bodies.forEach(function(b){b.el.style.left='0';b.el.style.top='0';b.el.style.transform='translate('+b.x.toFixed(2)+'px,'+b.y.toFixed(2)+'px) rotate('+b.angle+'deg)'})}
 function tick(time){raf=0;if(!visible)return;var dt=last?clamp((time-last)/16.667,.2,1.6):1;last=time;frames++;var width=floor.clientWidth,height=floor.clientHeight;
  bodies.forEach(function(b){if(b===held)return;b.vy+=.48*dt;b.vx*=.993;b.x+=b.vx*dt;b.y+=b.vy*dt;
   if(b.x<6){b.x=6;b.vx=Math.abs(b.vx)*.4}if(b.x+b.w>width-6){b.x=Math.max(6,width-b.w-6);b.vx=-Math.abs(b.vx)*.4}
   if(b.y+b.h>height-12){b.y=height-b.h-12;b.vy=Math.abs(b.vy)<1?0:-Math.abs(b.vy)*.28;b.vx*=.88}
  });
  for(var i=0;i<bodies.length;i++)for(var j=i+1;j<bodies.length;j++){var a=bodies[i],b=bodies[j],dx=a.x+a.w/2-b.x-b.w/2,dy=a.y+a.h/2-b.y-b.h/2,ox=(a.w+b.w)/2-Math.abs(dx),oy=(a.h+b.h)/2-Math.abs(dy);if(ox>0&&oy>0&&a!==held&&b!==held){if(ox<oy){var push=ox/2+.1;a.x+=dx>0?push:-push;b.x+=dx>0?-push:push;a.vx*=.5;b.vx*=.5}else{var shift=oy/2+.1;a.y+=dy>0?shift:-shift;b.y+=dy>0?-shift:shift;a.vy*=.3;b.vy*=.3}}}
  bodies.forEach(function(b){if(b!==held){b.x=clamp(b.x,6,Math.max(6,width-b.w-6));b.y=Math.min(b.y,height-b.h-12)}});
  render();var moving=held||bodies.some(function(b){return Math.abs(b.vx)+Math.abs(b.vy)>.12||b.y<0});
  if((moving&&frames<520)||held)raf=requestAnimationFrame(tick);
 }
 function run(){if(!raf){last=0;frames=0;raf=requestAnimationFrame(tick)}}
 function start(){if(motion.matches||!fine.matches){placeStatic();return}if(!started){started=measure();if(!started)return}run()}
 if('IntersectionObserver'in window){new IntersectionObserver(function(items){visible=items[0].isIntersecting;if(visible)start();else{if(raf)cancelAnimationFrame(raf);raf=0}},{threshold:.1}).observe(floor)}else{placeStatic()}
 badges.forEach(function(el){el.draggable=false;
  el.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||motion.matches||!fine.matches)return;var b=bodies.find(function(x){return x.el===el});if(!b)return;held=b;moved=false;var rect=floor.getBoundingClientRect();b.grabX=e.clientX-rect.left-b.x;b.grabY=e.clientY-rect.top-b.y;b.startX=e.clientX;b.startY=e.clientY;run()});
  el.addEventListener('pointermove',function(e){if(!held||held.el!==el)return;var rect=floor.getBoundingClientRect(),x=e.clientX-rect.left-held.grabX,y=e.clientY-rect.top-held.grabY;if(Math.hypot(e.clientX-held.startX,e.clientY-held.startY)>6){moved=true;if(!el.hasPointerCapture(e.pointerId))el.setPointerCapture(e.pointerId);held.vx=(x-held.x)*.3;held.vy=(y-held.y)*.3;held.x=clamp(x,5,floor.clientWidth-held.w-5);held.y=clamp(y,0,floor.clientHeight-held.h-12);render()}});
  function release(){if(held&&held.el===el){held=null;run()}}
  el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);el.addEventListener('lostpointercapture',release);
  el.addEventListener('click',function(e){if(moved){e.preventDefault();moved=false}});
 });
 addEventListener('resize',function(){started=false;if(visible)start();else placeStatic()});
 motion.addEventListener('change',function(){if(raf)cancelAnimationFrame(raf);raf=0;started=false;if(visible)start();else placeStatic()});placeStatic();
})();