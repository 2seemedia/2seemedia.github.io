/* Keep the current page selected, independently of scroll direction. */
(function(){
 'use strict';
 function pageName(value){
  var path=new URL(value,location.href).pathname.replace(/\/+$/,'');
  var name=(path.split('/').pop()||'index').replace(/\.html$/,'');
  if(['social-media-damascus','video-production-damascus'].includes(name))return 'services';
  return ['case-study','portfolio'].includes(name)?'work':name;
 }
 var page=pageName(window.SEE_PREVIEW_PAGE||location.href);
 document.querySelectorAll('.site-header nav a[href],.v3-header .v3-nav a[href]').forEach(function(a){
  if(a.hasAttribute('data-language-toggle')||a.matches('.v3-language,.v9-language'))return;
  var url=new URL(a.getAttribute('href'),location.href);
  if(url.origin!==location.origin||!['index','work','services','about','careers','contact'].includes(pageName(url.href)))return;
  var active=pageName(url.href)===page;
  a.toggleAttribute('data-see-active',active);
  if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
 });
})();
