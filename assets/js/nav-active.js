/* 2See Media — stable navigation state: active PAGE only, no scrolling tracker. */
(function(){
 'use strict';
 var header=document.querySelector('.site-header');
 if(!header)return;
 var page=window.SEE_PREVIEW_PAGE||(location.pathname.split('/').pop()||'index.html');
 if(page==='case-study.html')page='work.html';
 var pages=['index.html','work.html','services.html','about.html','careers.html','contact.html'];
 if(!pages.includes(page))return;
 header.querySelectorAll('nav ul a[href]').forEach(function(a){
  if(a.hasAttribute('data-language-toggle'))return;
  var href=a.getAttribute('href')||'';
  var target=href.replace(/^\.\//,'').split(/[?#]/)[0];
  var active=target===page;
  a.toggleAttribute('data-see-active',active && target!=='index.html');
  if(active)a.setAttribute('aria-current','page');
  else a.removeAttribute('aria-current');
 });
})();
