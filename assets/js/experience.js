/* Quiet progressive enhancement; native pointer and scrolling throughout. */
(function(){
 'use strict';
 var motion=matchMedia('(prefers-reduced-motion: reduce)');
 if(motion.matches||!('IntersectionObserver'in window))return;
 var observer=new IntersectionObserver(function(items){items.forEach(function(item){if(item.isIntersecting){item.target.classList.add('see-in-view');observer.unobserve(item.target)}})},{threshold:.1});
 document.querySelectorAll('[data-cms-section="index.section5"] li,[data-cms-section="index.section7"] li').forEach(function(el,i){el.classList.add('see-entry-reveal');el.style.setProperty('--reveal-delay',(i%4*45)+'ms');observer.observe(el)});
 motion.addEventListener('change',function(){if(motion.matches){observer.disconnect();document.querySelectorAll('.see-entry-reveal').forEach(function(el){el.classList.add('see-in-view')})}});
})();