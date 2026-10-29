/* 2SEE scroll story — normal page scroll, pinned headline, real project covers. */
(function(){
 'use strict';
 var ar=document.documentElement.lang==='ar',data=window.SEE_CMS_DATA||{},motion=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 var userPaused=false;try{userPaused=sessionStorage.getItem('2see-motion-paused')==='1'}catch(e){}
 function still(){return motion.matches||userPaused}
 var clamp=function(x,a,b){return Math.max(a,Math.min(b,x))};
 function rgb(hex){var m=/^#([0-9a-f]{6})$/i.exec(hex.trim());return m?[0,2,4].map(function(i){return parseInt(m[1].slice(i,i+2),16)}):[201,21,36]}
 function mix(a,b,t){return a.map(function(v,i){return Math.round(v+(b[i]-v)*t)})}
 function localize(){document.querySelectorAll('[data-v3-en]').forEach(function(e){e.textContent=e.getAttribute(ar?'data-v3-ar':'data-v3-en')})}
 document.querySelectorAll('.chip .count,[data-filter-count]').forEach(function(el){el.hidden=true;el.setAttribute('aria-hidden','true')});
 localize();document.querySelectorAll('.v3-nav').forEach(function(nav){nav.setAttribute('aria-label',ar?'القائمة الرئيسية':'Main navigation')});
 var mobileHeader=document.querySelector('.v3-header'),mobileNav=document.querySelector('.v3-nav');
 if(mobileHeader&&mobileNav){
  mobileNav.id='v8-site-navigation';
  var menuBackdrop=document.createElement('button');menuBackdrop.type='button';menuBackdrop.className='v12-menu-backdrop';menuBackdrop.tabIndex=-1;menuBackdrop.setAttribute('aria-label',ar?'إغلاق القائمة':'Close menu');menuBackdrop.setAttribute('aria-hidden','true');document.body.append(menuBackdrop);menuBackdrop.addEventListener('click',function(){menuState(false)});
  var languageLink=document.querySelector('.v3-language');if(languageLink){languageLink.classList.remove('v3-language');languageLink.classList.add('v3-nav-item','v9-language');var languageText=languageLink.textContent;languageLink.textContent='';var languageSpan=document.createElement('span');languageSpan.textContent=languageText;languageLink.append(languageSpan);mobileNav.append(languageLink);}
  var menuButton=document.createElement('button');menuButton.type='button';menuButton.className='v8-menu-toggle';menuButton.setAttribute('aria-controls',mobileNav.id);menuButton.setAttribute('aria-expanded','false');
  function menuState(open){var modalOpen=open&&innerWidth<=640;document.querySelectorAll('main,footer').forEach(function(el){el.inert=modalOpen});if(modalOpen){mobileNav.setAttribute('role','dialog');mobileNav.setAttribute('aria-modal','true')}else{mobileNav.removeAttribute('role');mobileNav.removeAttribute('aria-modal')}document.body.classList.toggle('v12-menu-open',open);if(menuBackdrop)menuBackdrop.setAttribute('aria-hidden',String(!open));mobileHeader.classList.toggle('is-menu-open',open);menuButton.setAttribute('aria-expanded',String(open));menuButton.textContent=open?(ar?'إغلاق ×':'Close ×'):(ar?'القائمة ☰':'Menu ☰');if(modalOpen)requestAnimationFrame(function(){if(mobileHeader.classList.contains('is-menu-open'))mobileNav.querySelector('a')?.focus()});}
  menuState(false);mobileHeader.append(menuButton);menuButton.addEventListener('click',function(){menuState(menuButton.getAttribute('aria-expanded')!=='true')});
  mobileNav.addEventListener('click',function(e){if(e.target.closest('a'))menuState(false)});
  document.addEventListener('click',function(e){if(!mobileHeader.contains(e.target))menuState(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&menuButton.getAttribute('aria-expanded')==='true'){menuState(false);menuButton.focus()}});
  document.addEventListener('keydown',function(e){if(e.key!=='Tab'||innerWidth>640||menuButton.getAttribute('aria-expanded')!=='true')return;var stops=[menuButton].concat(Array.from(mobileNav.querySelectorAll('a'))),first=stops[0],last=stops[stops.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
  addEventListener('resize',function(){if(innerWidth>640)menuState(false)});
 }
 var track=document.getElementById('v3-opening-track'),opening=document.querySelector('.v3-opening'),stack=document.querySelector('.v3-stack-pictures'),stackImages=stack?Array.from(stack.querySelectorAll('img')):[],stackIndex=-1,founderScrollY=scrollY,founderTravel=0,founderDirection=0,founderLastSwap=0;
 function setStack(index){if(!stackImages.length)return;index=(index+stackImages.length)%stackImages.length;if(index===stackIndex)return;stackIndex=index;stackImages.forEach(function(image,i){var active=i===index;image.style.zIndex=active?'3':'1';image.style.transform='translateY('+(active?0:8)+'px) rotate('+(active?-2:(i%2?6:-6))+'deg)';image.style.opacity=active?'1':'.9'})}
 var founderBoxes=Array.from(document.querySelectorAll('.v3-founder-bio'));
 function selectFounder(index,fromScroll){index=(index+stackImages.length)%stackImages.length;if(!fromScroll){founderTravel=0;founderScrollY=scrollY;}setStack(index);founderBoxes.forEach(function(box,i){box.classList.toggle('is-active',i===index);box.setAttribute('aria-pressed',i===index?'true':'false')});stackImages.forEach(function(image,i){var active=i===index;image.style.opacity='1';image.style.setProperty('--founder-angle',(active?-2:(i%2?6:-6))+'deg');image.style.setProperty('--founder-offset',(active?0:8)+'px');});}
 founderBoxes.forEach(function(box,i){box.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')selectFounder(i)});box.addEventListener('focus',function(){selectFounder(i)});box.addEventListener('click',function(){selectFounder(i)});box.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();selectFounder(i)}})});
 if(founderBoxes.length)selectFounder(0);else setStack(0);
 document.querySelectorAll('.v2-service').forEach(function(detail){detail.open=false;detail.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'&&fine.matches){document.querySelectorAll('.v2-service').forEach(function(other){other.open=other===detail})}});detail.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'&&!detail.contains(document.activeElement))detail.open=false});});

 function workName(work){var name=(ar?(work.titleAr||work.title):work.title)||'';if(/^(reel|design|published video|ريل|تصميم|فيديو منشور)(\s|$)/i.test(name))name='';return work.client||name||(work.type==='design'?(ar?'تصميم غرافيكي':'Graphic design'):(ar?'إنتاج وصناعة محتوى':'Production & content'));}
 function safeUrl(value){try{var url=new URL(value,location.href);return ['http:','https:'].includes(url.protocol)?url.href:'#'}catch(e){return '#'}}
 if(track){
  var works=(data.works||[]).filter(function(w){return w.visible!==false&&w.image&&w.type==='reel'}),seen=new Set(),featured=works.filter(function(w){return w.featured});
  var selected=featured.concat(works).filter(function(w){if(seen.has(w.image))return false;seen.add(w.image);return true}).slice(0,10);
  selected.forEach(function(work,i){
   var card=document.createElement('article');card.className='v3-project';card.style.setProperty('--reel-color',['#101010','#b51222','#c4c4c4','#f4f2ed','#641a2b'][i%5]);
   var link=document.createElement('a');link.href=safeUrl(work.url||work.image);link.target='_blank';link.rel='noopener noreferrer';link.draggable=false;link.setAttribute('aria-label',workName(work)+' — '+(ar?'عرض المشروع':'View project'));if(window.SEE_OPEN_WORK)link.addEventListener('click',function(e){if(e.defaultPrevented)return;if(!dragged){e.preventDefault();window.SEE_OPEN_WORK(work)}});
   var image=document.createElement('img');image.src=safeUrl(work.image);image.alt=workName(work);image.width=360;image.height=640;image.decoding='async';image.loading=i<2?'eager':'lazy';image.draggable=false;
   image.onerror=function(){image.onerror=null;image.src='assets/img/2see-placeholder.svg'};
   var label=document.createElement('span');label.className='v3-project-open';label.textContent=ar?'عرض المشروع ↗':'View project ↗';
   link.append(image,label);card.append(link);
   var videoSource=work.videoUrl||(/\.(mp4|webm)(?:[?#]|$)/i.test(work.url||'')?work.url:'');
   if(videoSource){
    var preview=document.createElement('video');preview.className='studio-reel-preview';preview.muted=true;preview.loop=true;preview.playsInline=true;preview.preload='none';preview.setAttribute('aria-hidden','true');link.append(preview);
    function stopPreview(){preview.pause();link.classList.remove('is-preview-playing');try{preview.currentTime=0}catch(e){}}
    link.addEventListener('pointerenter',function(e){if(e.pointerType!=='mouse'||still()||!revealReady)return;if(!preview.src)preview.src=safeUrl(videoSource);var play=preview.play();if(play)play.then(function(){if(link.matches(':hover'))link.classList.add('is-preview-playing');else stopPreview()},stopPreview)});
    link.addEventListener('pointerleave',stopPreview);link.addEventListener('blur',stopPreview);preview.addEventListener('error',stopPreview);
    if('IntersectionObserver'in window)new IntersectionObserver(function(entries){if(!entries[0].isIntersecting)stopPreview()}).observe(link);
    document.addEventListener('visibilitychange',function(){if(document.hidden)stopPreview()});
   }
   track.append(card);
  });
  var revealReady=still(),galleryVisible=false,galleryPaused=false,galleryUserPaused=false,galleryTimer=0;var pauseButton=document.querySelector('[data-gallery-pause]');
  function pauseLabel(){if(pauseButton){pauseButton.textContent=galleryUserPaused?(ar?'تشغيل السحب':'Play slides'):(ar?'إيقاف السحب':'Pause slides');pauseButton.setAttribute('aria-pressed',String(galleryUserPaused))}}
  if(pauseButton)pauseButton.addEventListener('click',function(){galleryUserPaused=!galleryUserPaused;pauseLabel()});pauseLabel();
  track.addEventListener('pointerenter',function(){galleryPaused=true});track.addEventListener('pointerleave',function(){galleryPaused=false});
  if('IntersectionObserver'in window)new IntersectionObserver(function(entries){galleryVisible=entries[0].isIntersecting},{threshold:.1}).observe(track);else galleryVisible=true;
  galleryTimer=setInterval(function(){if((opening&&!still())||!revealReady||!galleryVisible||galleryPaused||galleryUserPaused||document.hidden||still()||drag||track.contains(document.activeElement))return;var step=(track.querySelector('.v3-project')||track).getBoundingClientRect().width+14;track.scrollTo({left:track.scrollLeft+track.clientWidth>=track.scrollWidth-3?0:track.scrollLeft+step,behavior:'smooth'});},5500);
  var previous=document.querySelector('[data-gallery-prev]'),next=document.querySelector('[data-gallery-next]');
  function scrollCards(direction){if(opening&&!still()){var left=clamp(track.scrollLeft+direction*track.clientWidth*.65,0,track.scrollWidth-track.clientWidth);window.scrollTo({top:opening.offsetTop+innerHeight*.7+left,behavior:'smooth'});}else track.scrollBy({left:direction*track.clientWidth*.65,behavior:'auto'})}
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
 var accent=[48,0,5];
 var themes=[{el:opening,color:accent},{el:intro,color:[244,242,235]},{el:services,color:[207,207,201]},{el:team,color:[244,242,235]},{el:process,color:[224,223,217]}].filter(function(x){return x.el});
 var pending=false,menuPreviousY=scrollY,menuDirectionTravel=0,menuDirection=0;
 function update(){
  pending=false;document.body.classList.toggle('v3-is-scrolled',scrollY>40);var menuDelta=scrollY-menuPreviousY;menuPreviousY=scrollY;
  if(scrollY<12){document.body.classList.remove('v12-menu-away');menuDirectionTravel=0;}
  else if(Math.abs(menuDelta)>.5){var nextDirection=menuDelta>0?1:-1;if(nextDirection!==menuDirection){menuDirectionTravel=0;menuDirection=nextDirection;}menuDirectionTravel+=Math.abs(menuDelta);if(menuDirectionTravel>8){var hideMenu=menuDirection>0;document.body.classList.toggle('v12-menu-away',hideMenu);if(hideMenu&&innerWidth<=640&&mobileHeader&&mobileHeader.classList.contains('is-menu-open'))menuState(false);}}

  if(opening){
   var rect=opening.getBoundingClientRect(),travel=track?Math.max(0,track.scrollWidth-track.clientWidth):0,distance=Math.max(0,-rect.top),p=clamp(distance/(innerHeight*1.05),0,1);
   if(track&&!still()){opening.style.setProperty('--reel-section-height',(innerHeight*1.85+travel)+'px');track.scrollLeft=clamp(distance-innerHeight*.7,0,travel);}
   else opening.style.removeProperty('--reel-section-height');
   document.body.style.setProperty('--story-title-opacity',still()?1:1-clamp((p-.12)/.35,0,1));
   if(track){
    var unfold=still()?1:clamp((p-.03)/.62,0,1),ease=1-Math.pow(1-unfold,3),reveal=still()?1:clamp((p-.16)/.3,0,1);
    revealReady=unfold>=.98;var shell=track.closest('.v3-gallery-shell');shell.inert=!revealReady;
    opening.style.setProperty('--reel-backdrop-blur',(still()?0:6*Math.sin(Math.PI*unfold))+'px');opening.style.setProperty('--reel-backdrop-opacity',String(still()?0:Math.sin(Math.PI*unfold)));opening.style.setProperty('--reel-reveal',String(reveal));opening.style.setProperty('--reel-controls',String(clamp((unfold-.8)/.2,0,1)));
    var trackBox=track.getBoundingClientRect();opening.style.setProperty('--reel-stage-visible',still()||p>.03?'1':'0');
    Array.from(track.children).forEach(function(card,i){var rise=still()?1:clamp((p-.035-(i%5)*.045)/.38,0,1),riseEase=1-Math.pow(1-rise,3),y=Math.max(innerHeight*.65,innerHeight-trackBox.top+40);card.style.setProperty('--reel-x','0px');card.style.setProperty('--reel-y',(y*(1-riseEase))+'px');card.style.setProperty('--reel-scale-y','1');card.style.setProperty('--reel-card-opacity',String(clamp(rise/.18,0,1)));card.style.setProperty('--reel-curtain','0');card.style.visibility=(i>=5&&!revealReady)||(!still()&&rise===0)?'hidden':'';card.style.zIndex=String(20-i);});
   }
   document.body.style.setProperty('--story-hint-opacity',1-clamp(p/.2,0,1));
   document.body.style.setProperty('--story-label-opacity',clamp((p-.18)/.42,0,1));
   var color=accent.slice(),previousColor=accent.slice();
   var glowFade=intro?clamp((innerHeight*.82-intro.getBoundingClientRect().top)/(innerHeight*.82),0,1):0;
   document.body.style.setProperty('--studio-glow-opacity',String(1-glowFade));
   themes.slice(1).forEach(function(theme){var top=theme.el.getBoundingClientRect().top,t=clamp((innerHeight*.82-top)/(innerHeight*.82),0,1);if(t>0)color=mix(previousColor,theme.color,still()?1:t);previousColor=theme.color});
   document.body.style.setProperty('--story-bg','rgb('+color.join(',')+')');
  }
  var founderDelta=scrollY-founderScrollY;founderScrollY=scrollY;
  if(stack&&stackImages.length>1&&!still()&&Math.abs(founderDelta)>.5){
   var portraitBox=stack.getBoundingClientRect(),founderVisible=portraitBox.bottom>80&&portraitBox.top<innerHeight*.9;
   if(founderVisible){var direction=founderDelta>0?1:-1;if(direction!==founderDirection){founderTravel=0;founderDirection=direction;}founderTravel+=Math.abs(founderDelta);
    var threshold=clamp(innerHeight*.4,260,420),target=direction>0?1:0;
    if(founderTravel>=threshold&&target!==stackIndex&&performance.now()-founderLastSwap>1000){selectFounder(target,true);founderLastSwap=performance.now();founderTravel=0;}
   }else{founderTravel=0;founderDirection=0;}
  }
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(update)}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);motion.addEventListener('change',schedule);update();
 var scenes=[['1765372860684-69f0e2524694','kqLeFAf9npk'],['1637665599155-abfcf9fc3f78','bV5dFLEYecM'],['1768885509990-1ebfd3e0257b','WPxiEFsSEzw'],['1768076955015-dd4f057e96f6','beHPut9RwUM'],['1768222935380-0a3a76fbb42e','X8uonmU2Ssw']];
 
 var sceneImage=document.querySelector('.v4-scene-image'),sceneFooter=document.querySelector('.v3-footer'),sceneIndex=0,sceneTimer=0,sceneVisible=false,sceneLoading=false,sceneOther=null;
 
 var page=location.pathname.split('/').pop().replace('.html','');sceneIndex=({about:1,work:2,services:3,careers:4,'case-study':4})[page]||0;
 function sceneUrl(index){return 'https://images.unsplash.com/photo-'+scenes[index][0]+'?auto=format&fit=crop&w='+(innerWidth<=640?900:1600)+'&q=75'}
 function sceneSchedule(){clearTimeout(sceneTimer);if(sceneVisible&&!document.hidden&&!still())sceneTimer=setTimeout(sceneAdvance,6500)}
 function sceneAdvance(){if(!sceneVisible||document.hidden||still()||sceneLoading)return;sceneLoading=true;var next=(sceneIndex+1)%scenes.length;sceneOther.onload=function(){sceneLoading=false;if(sceneVisible&&!document.hidden&&!still()){sceneImage.classList.remove('is-current');sceneOther.classList.add('is-current');var old=sceneImage;sceneImage=sceneOther;sceneOther=old;sceneIndex=next;}sceneSchedule()};sceneOther.onerror=function(){sceneLoading=false;sceneIndex=next;sceneSchedule()};sceneOther.src=sceneUrl(next);}
 if(sceneImage){sceneImage.classList.add('is-current');sceneImage.src=sceneUrl(sceneIndex);sceneOther=sceneImage.cloneNode(false);sceneOther.removeAttribute('src');sceneOther.classList.remove('is-current');sceneImage.parentElement.append(sceneOther);
 if('IntersectionObserver'in window)new IntersectionObserver(function(entries){sceneVisible=entries[0].isIntersecting;sceneSchedule()},{rootMargin:'100px'}).observe(sceneFooter);else{sceneVisible=true;sceneSchedule()}
 document.addEventListener('visibilitychange',sceneSchedule);motion.addEventListener('change',sceneSchedule);
 }
 var footerEmail=document.querySelector('.v3-footer-email');if(footerEmail&&data.brand&&data.brand.email){footerEmail.href='mailto:'+data.brand.email;footerEmail.textContent=data.brand.email+' ↗'}
 
 function openingIntro(){
  var root=document.documentElement,brand=document.querySelector('.v3-brand'),settings=data.settings||{};document.getElementById('see-intro')?.remove();
  if(!root.classList.contains('see-intro-playing')||!brand)return;
  if(still()||settings.introEnabled===false){root.classList.remove('see-intro-playing');return;}
  try{sessionStorage.setItem('2see-intro-seen-v7','1')}catch(e){}
  var veil=document.createElement('div');veil.className='v9-intro-veil';veil.setAttribute('aria-hidden','true');
  var circle=document.createElement('div');circle.className='v9-intro-circle';var mark=document.createElement('img');mark.src=safeUrl((data.brand||{}).logo||'assets/img/2see-logo.png');mark.alt='';circle.append(mark);
  var slogan=document.createElement('p');slogan.textContent='WE MAKE YOU SEEN.';veil.append(slogan);document.body.append(veil,circle);
  var size=Math.min(300,innerWidth*.62),oldOverflow=document.body.style.overflow,introDone=false,introTimer=0,introNodes=Array.from(document.querySelectorAll('.v3-header,main,footer'));introNodes.forEach(function(el){el.inert=true});var skip=document.createElement('button');skip.type='button';skip.className='studio-intro-skip';skip.textContent=ar?'تخطي المقدمة ↗':'Skip intro ↗';veil.removeAttribute('aria-hidden');veil.append(skip);skip.addEventListener('click',finish);skip.focus({preventScroll:true});
  circle.style.cssText='width:'+size+'px;height:'+size+'px;left:'+(innerWidth-size)/2+'px;top:'+(innerHeight-size)/2+'px';
  document.body.style.overflow='hidden';brand.style.opacity='0';
  function finish(){if(introDone)return;introDone=true;clearTimeout(introTimer);var restoreFocus=document.activeElement===skip;introNodes.forEach(function(el){el.inert=false});document.body.style.overflow=oldOverflow;brand.style.opacity='';root.classList.remove('see-intro-playing');veil.remove();circle.remove();if(restoreFocus)brand.focus({preventScroll:true});}
  introTimer=setTimeout(function(){if(introDone)return;var target=brand.getBoundingClientRect();veil.animate([{opacity:1},{opacity:0}],{duration:650,fill:'forwards'});slogan.style.opacity='0';
   circle.animate([{left:circle.style.left,top:circle.style.top,width:size+'px',height:size+'px'},{left:target.left+'px',top:target.top+'px',width:target.width+'px',height:target.height+'px'}],{duration:850,easing:'cubic-bezier(.65,0,.25,1)',fill:'forwards'}).finished.then(finish,finish);
  },3000);
 }
 openingIntro();

 var floor=document.querySelector('.v3-footer-floor');if(!floor)return;
 var badges=Array.from(floor.querySelectorAll('.v3-badge')),bodies=[],raf=0,visible=false,started=false,last=0,frames=0,held=null,moved=false;
 var brand=data.brand||{};var replacements=[brand.instagram,brand.whatsapp?'https://wa.me/'+brand.whatsapp:null,brand.email?'mailto:'+brand.email:null,brand.youtube];replacements.forEach(function(href,i){if(href&&badges[i])badges[i].href=href});
 function placeStatic(){floor.classList.add('has-layout');var width=floor.clientWidth||800,height=floor.clientHeight||230,x=10,y=0,row=0,layout=[];badges.forEach(function(el){var w=el.offsetWidth||100,h=el.offsetHeight||44;if(x+w>width-10&&x>10){y+=row+16;x=10;row=0}layout.push({el:el,x:x,y:y,h:h});x+=w+12;row=Math.max(row,h)});var total=y+row,offset=Math.max(8,height-total-15);layout.forEach(function(item,i){item.el.style.left='0';item.el.style.top='0';item.el.style.transform='translate('+item.x+'px,'+(item.y+offset)+'px) rotate('+((i%3-1)*7)+'deg)'})}
 function measure(){var width=floor.clientWidth,height=floor.clientHeight;if(!width||!height){placeStatic();return false}
  bodies=badges.map(function(el,i){return {el:el,x:clamp(Math.random()*width,4,width-(el.offsetWidth||110)-4),y:-70-Math.random()*240-i*12,w:el.offsetWidth||110,h:el.offsetHeight||44,vx:(i%2?1:-1)*1.1,vy:0,angle:(Math.random()-.5)*28}});
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
 function start(){if(still()){placeStatic();return}if(!started){started=measure();if(!started)return}run()}
 if('IntersectionObserver'in window){new IntersectionObserver(function(items){visible=items[0].isIntersecting;if(visible)start();else{if(raf)cancelAnimationFrame(raf);raf=0;started=false}},{threshold:.1}).observe(floor)}else{placeStatic()}
 badges.forEach(function(el){el.draggable=false;
  el.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||still()||!fine.matches)return;var b=bodies.find(function(x){return x.el===el});if(!b)return;held=b;moved=false;var rect=floor.getBoundingClientRect();b.grabX=e.clientX-rect.left-b.x;b.grabY=e.clientY-rect.top-b.y;b.startX=e.clientX;b.startY=e.clientY;run()});
  el.addEventListener('pointermove',function(e){if(!held||held.el!==el)return;var rect=floor.getBoundingClientRect(),x=e.clientX-rect.left-held.grabX,y=e.clientY-rect.top-held.grabY;if(Math.hypot(e.clientX-held.startX,e.clientY-held.startY)>6){moved=true;if(!el.hasPointerCapture(e.pointerId))el.setPointerCapture(e.pointerId);held.vx=(x-held.x)*.3;held.vy=(y-held.y)*.3;held.x=clamp(x,5,floor.clientWidth-held.w-5);held.y=clamp(y,0,floor.clientHeight-held.h-12);render()}});
  function release(){if(held&&held.el===el){held=null;run()}}
  el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);el.addEventListener('lostpointercapture',release);
  el.addEventListener('click',function(e){if(moved){e.preventDefault();moved=false}});
 });
 floor.addEventListener('focusin',function(){if(raf)cancelAnimationFrame(raf);raf=0;held=null;placeStatic()});
 var motionButton=document.querySelector('[data-motion-toggle]');
 function motionLabel(){if(!motionButton)return;motionButton.setAttribute('aria-pressed',String(userPaused));motionButton.textContent=userPaused?(ar?'تشغيل الحركات':'Play animations'):(ar?'إيقاف الحركات':'Pause animations');document.body.classList.toggle('studio-motion-paused',userPaused)}
 if(motionButton)motionButton.addEventListener('click',function(){userPaused=!userPaused;try{sessionStorage.setItem('2see-motion-paused',String(userPaused?1:0))}catch(e){}motionLabel();sceneSchedule();if(raf)cancelAnimationFrame(raf);raf=0;started=false;if(visible)start();else placeStatic();schedule()});motionLabel();
 var whatsapp=document.querySelector('[data-studio-whatsapp]');if(whatsapp&&brand.whatsapp)whatsapp.href='https://wa.me/'+String(brand.whatsapp).replace(/[^0-9]/g,'');
 addEventListener('resize',function(){started=false;if(visible)start();else placeStatic()});
 motion.addEventListener('change',function(){if(raf)cancelAnimationFrame(raf);raf=0;started=false;if(visible)start();else placeStatic()});placeStatic();
})();