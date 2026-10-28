/* 2SEE Studio V2: native details and normal scrolling. */
(function(){
 var bar=document.createElement('div');bar.className='v2-scroll-progress';bar.setAttribute('aria-hidden','true');document.body.append(bar);
 var pending=false;
 function draw(){var max=document.documentElement.scrollHeight-innerHeight;bar.style.transform='scaleX('+(max>0?Math.min(1,scrollY/max):0)+')';pending=false}
 addEventListener('scroll',function(){if(!pending){pending=true;requestAnimationFrame(draw)}},{passive:true});addEventListener('resize',draw);draw();
 document.querySelectorAll('.v2-service').forEach(function(detail){detail.addEventListener('toggle',function(){if(detail.open)document.querySelectorAll('.v2-service').forEach(function(other){if(other!==detail)other.open=false})})});
})();