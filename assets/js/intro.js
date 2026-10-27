/* 2See Media — lightweight, one-time cinematic intro. */
(function(){
 'use strict';
 var root=document.documentElement,overlay=document.getElementById('see-intro');
 if(!overlay||!root.classList.contains('see-intro-playing'))return;
 var settings=window.SEE_CMS_DATA&&window.SEE_CMS_DATA.settings||{};
 var query=new URLSearchParams(location.search),force=query.get('intro')==='1';
 if(settings.introEnabled===false&&!force){root.classList.remove('see-intro-playing');return;}
 var ms=Math.max(1000,Math.min(2500,Number(settings.introDurationMs)||1600));
 var closed=false;
 try{sessionStorage.setItem('2see-intro-seen-v7','1')}catch(e){}
 function finish(){
  if(closed)return;closed=true;
  overlay.classList.add('see-intro--closing');
  setTimeout(function(){root.classList.remove('see-intro-playing');overlay.remove()},420);
 }
 var timer=setTimeout(finish,ms);
 var skip=overlay.querySelector('.see-intro-skip');
 if(skip)skip.addEventListener('click',function(){clearTimeout(timer);finish()});
 window.addEventListener('pagehide',function(){clearTimeout(timer);finish()},{once:true});
})();
