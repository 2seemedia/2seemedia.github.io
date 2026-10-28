/* 2SEE Media content layer. Original Agency animations remain in main.js. */
(function(){
  'use strict';
  var base=window.SEE_CMS_DATA;
  if(!base)return;
  var params=new URLSearchParams(location.search);
  var preview=params.get('cms-preview')==='1';
  var visualEdit=preview&&params.get('cms-edit')==='1';
  var draft=null;
  if(preview){try{draft=JSON.parse(localStorage.getItem('2see-agency-draft-v12')||'null')}catch(e){}}
  var data=draft&&draft.pages&&draft.brand?draft:base;
  var storedLanguage='';try{storedLanguage=sessionStorage.getItem('2see-language')||''}catch(e){}
  var forcedLang=window.SEE_PREVIEW_LANG;
  var lang=params.get('lang')==='ar'?'ar':(params.get('lang')==='en'?'en':((forcedLang==='ar'||forcedLang==='en'?forcedLang:null)||storedLanguage||data.settings.defaultLanguage||'en'));
  if(lang==='ar'&&!data.settings.arabicEnabled)lang='en';
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  document.documentElement.style.setProperty('--color-cobalt',data.brand.accent||'#C91524');
  document.documentElement.style.setProperty('--color-cobalt-600',data.brand.accentHover||'#A70E1E');
  document.documentElement.style.setProperty('--color-lime',data.brand.highlight||'#C4C4C4');
  // Font families mirror the former 2SEE website and can be adjusted from the dashboard.
  function safeFont(v,fallback){return /^[\w -]{2,45}$/.test(v||'')?v:fallback}
  document.documentElement.style.setProperty('--font-display','"'+safeFont(data.brand.headingFont,'Manrope')+'",system-ui,sans-serif');
  document.documentElement.style.setProperty('--font-sans','"'+safeFont(data.brand.bodyFont,'DM Sans')+'",system-ui,sans-serif');
  document.documentElement.style.setProperty('--see-gallery-columns',Math.max(2,Math.min(5,Number(data.settings.galleryColumns)||4)));
  document.documentElement.style.setProperty('--see-title-scale',Math.max(.8,Math.min(1.2,Number(data.settings.headlineScale)||1)));
  document.documentElement.style.setProperty('--see-marquee-scale',Math.max(.8,Math.min(1.2,Number(data.settings.marqueeScale)||1)));
  if(lang==='ar'){
    var arabicFont=safeFont(data.brand.arabicFont,'Tajawal');
    document.documentElement.style.setProperty('--font-display','"'+arabicFont+'",sans-serif');
    document.documentElement.style.setProperty('--font-sans','"'+arabicFont+'",sans-serif');
  }

  var page=window.SEE_PREVIEW_PAGE||(location.pathname.split('/').pop()||'index.html');
  if(!data.pages[page])page='index.html';
  var entries=data.pages[page]||[];
  var byKey={};entries.forEach(function(e){byKey[e.key]=e});
  function value(entry){var v=lang==='ar'?entry.ar:entry.en;return String(v===undefined||v===null?(entry.en??''):v)}
  function applyEntryStyle(element,entry){
    var st=entry.style||{};
    if(st.hidden===true){element.hidden=true;element.style.setProperty('display','none','important');}
    if(st.fontSize!==undefined&&st.fontSize!==null&&st.fontSize!==''){
      var size=Number(st.fontSize);if(Number.isFinite(size))element.style.fontSize=Math.min(150,Math.max(9,size))+'px';
    }
    if(typeof st.color==='string'&&/^#[0-9a-f]{6}$/i.test(st.color))element.style.color=st.color;
    if(['normal','500','600','700','800','900'].includes(String(st.fontWeight)))element.style.fontWeight=String(st.fontWeight);
    if(st.italic===true)element.style.fontStyle='italic';
    if(st.underline===true)element.style.textDecoration='underline';
    if(visualEdit){
      element.dataset.seeEditKey=entry.key;
      element.title=(lang==='ar'?'انقري لتعديل: ':'Click to edit: ')+(entry.label||entry.key);
      element.style.cursor='pointer';
    }
  }
  var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_COMMENT);
  var comments=[];while(walker.nextNode())comments.push(walker.currentNode);
  comments.forEach(function(node){
    if(!node.nodeValue.startsWith('cms:'))return;
    var item=byKey[node.nodeValue.slice(4)],next=node.nextSibling;
    if(!item||!next||next.nodeType!==Node.TEXT_NODE)return;
    var old=next.nodeValue||'',left=old.match(/^\s*/)[0],right=old.match(/\s*$/)[0];
    // Keep whitespace separate, but wrap the actual CMS text in an inline span.
    // This enables precise per-text styling without affecting icons or neighbouring links.
    var parent=next.parentNode;
    var span=document.createElement('span');span.setAttribute('data-see-text-key',item.key);
    span.textContent=value(item);
    parent.insertBefore(document.createTextNode(left),next);
    parent.insertBefore(span,next);
    if(right)parent.insertBefore(document.createTextNode(right),next);
    parent.removeChild(next);
    applyEntryStyle(span,item);
  });
  function safeLink(u){
    try{
      if(/^(?:#|(?:[\w-]+\.html)(?:[?#].*)?|mailto:|tel:)/i.test(u))return u;
      var parsed=new URL(u,location.href);
      return ['https:','http:'].includes(parsed.protocol)?u:'#';
    }catch(e){return '#'}
  }
  entries.forEach(function(e){
    if(e.kind==='text')return;
    var el=document.querySelector('[data-cms-'+e.kind+'="'+e.key+'"]');
    if(!el)return;
    var v=value(e);
    if(e.kind==='title')document.title=v;
    else if(e.kind==='link')el.setAttribute('href',safeLink(v));
    else if(e.kind==='image')el.setAttribute('src',v);
    else if(e.kind==='meta')el.setAttribute('content',v);
    else if(e.kind==='placeholder')el.setAttribute('placeholder',v);
    else if(e.kind==='label')el.setAttribute('aria-label',v);
    else if(e.kind==='option')el.textContent=v;
    if(e.kind!=='title'&&e.kind!=='meta')applyEntryStyle(el,e);
  });
  // Select CMS text on the actual website preview, without navigating links/forms.
  if(visualEdit){
    var editCss=document.createElement('style');editCss.textContent='[data-see-edit-key]:hover{outline:2px dashed #c91524!important;outline-offset:4px;box-shadow:0 0 0 4px rgba(201,21,36,.12)}[data-see-edit-key]{position:relative}';document.head.appendChild(editCss);
    document.addEventListener('click',function(evt){var hit=evt.target.closest('[data-see-edit-key]');if(!hit)return;evt.preventDefault();evt.stopImmediatePropagation();
      if(window.parent&&window.parent!==window)window.parent.postMessage({type:'2see:edit-element',page:page,key:hit.dataset.seeEditKey},location.origin);
    },true);
  }
  // Brand image and verified contact info can be changed from one place.
  document.querySelectorAll('header a[href="index.html"] img,footer a[href="index.html"] img,.see-marquee-logo,.see-intro-logo').forEach(function(img){
    if(data.brand.logo)img.src=data.brand.logo;
  });
  // Global contact details override repeated header/footer copies in every page.
  document.querySelectorAll('a[href^="mailto:"]').forEach(function(a){
    var email=data.brand.email||'2see.mediaa@gmail.com';
    a.href='mailto:'+email;
    if(a.textContent.includes('@'))a.textContent=email;
  });
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function(a){
    a.href='https://wa.me/'+String(data.brand.whatsapp||'963964603742').replace(/\D/g,'');
  });
  document.querySelectorAll('a[href*="instagram.com"]:not([data-founder-instagram])').forEach(function(a){
    if(data.brand.instagram)a.href=safeLink(data.brand.instagram);
  });
  document.querySelectorAll('[data-founder-instagram]').forEach(function(a){
    var who=a.getAttribute('data-founder-instagram');
    var name=who==='mohamad'?'Mohamad Al-Shafi':'Esraa Mansour';
    var link=who==='mohamad'?data.brand.mohamadInstagram:data.brand.esraaInstagram;
    if(link)a.href=safeLink(link);
    a.setAttribute('aria-label',lang==='ar'?'إنستغرام '+(who==='mohamad'?'محمد الشافي':'إسراء منصور'):'Instagram — '+name);
  });
  document.querySelectorAll('a[href*="youtube.com"]').forEach(function(a){
    if(data.brand.youtube)a.href=safeLink(data.brand.youtube);
  });
  document.querySelectorAll('[data-cms-section]').forEach(function(sec){
    var v=data.sections[sec.getAttribute('data-cms-section')];
    if(v&&v.visible===false){sec.hidden=true;sec.style.display='none'}
  });
  document.querySelectorAll('[data-language-toggle]').forEach(function(a){
    if(!data.settings.arabicEnabled){a.closest('li')?.remove();return;}
    a.textContent=lang==='en'?'العربية':'English';a.setAttribute('aria-label',lang==='en'?'Switch to Arabic':'التبديل إلى الإنجليزية');
    a.href='?lang='+(lang==='en'?'ar':'en')+(preview?'&cms-preview=1':'');
    a.addEventListener('click',function(e){
      e.preventDefault();var next=lang==='en'?'ar':'en';try{sessionStorage.setItem('2see-language',next)}catch(err){}
      var u=new URL(location.href);u.searchParams.set('lang',next);location.href=u.href;
    });
  });
  if(lang==='ar'){document.querySelectorAll('select option').forEach(function(opt){var dict={'Choose a timeframe':'اختر الموعد','As soon as possible':'في أقرب وقت','In 1–3 months':'خلال 1–3 أشهر','In 3–6 months':'خلال 3–6 أشهر','Just exploring':'أستفسر فقط','Choose one':'اختر','Recommendation':'توصية','Saw your work':'اطّلعت على أعمالكم','Search':'بحث','Social media':'السوشال ميديا','Event or talk':'فعالية'};if(dict[opt.textContent.trim()])opt.textContent=dict[opt.textContent.trim()]});}
  document.querySelectorAll('[data-social-facebook]').forEach(function(a){a.href=safeLink(data.brand.facebook||'#')});
  if(lang==='ar'){document.querySelectorAll('a').forEach(function(a){if(a.textContent.trim()==='About 2SEE ↗')a.textContent='عن 2SEE ↗';if(a.textContent.trim()==='See our work ↗')a.textContent='استعرض أعمالنا ↗'});document.querySelectorAll('h3').forEach(function(h){if(h.textContent.trim()==='What you get')h.textContent='ما الذي نقدّمه؟'})}
  document.querySelectorAll('[data-year]').forEach(function(x){x.textContent=new Date().getFullYear()});

  // Collaborations are not presented as long-term clients; one-off work also counts.
  // Empty published list stays hidden. Preview uses numbered, explicitly fictional placeholders.
  (function renderCollaborations(){
    var config=data.collaborations||{};
    var logos=Array.isArray(config.logos)?config.logos.filter(function(x){return x&&x.image&&x.visible!==false}):[];
    var demo=logos.length===0&&(preview||!!window.SEE_PREVIEW_PAGE);
    document.querySelectorAll('.see-collabs').forEach(function(section){
      if(!logos.length&&!demo){section.hidden=true;section.style.display='none';return;}
      var heading=section.querySelector('.see-collabs-title');
      if(heading)heading.textContent=lang==='ar'?(config.headingAr||'من تعاونّا معهم'):(config.headingEn||'Who we have worked with');
      var win=section.querySelector('.see-collabs-window');
      if(win)win.setAttribute('aria-label',lang==='ar'?'شعارات جهات وأشخاص تعاونّا معهم':'Logos of people and organizations we have collaborated with');
      var note=section.querySelector('.see-collabs-demo-note');
      if(note){note.hidden=!demo;note.textContent=lang==='ar'?'شعارات توضيحية للمعاينة فقط — أضيفي الشعارات الحقيقية من لوحة التحكم':'Preview placeholders only — add real logos in the dashboard';}
      var track=section.querySelector('[data-collabs-track]');if(!track)return;
      track.replaceChildren();
      var list=demo?Array.from({length:8},function(_,i){return {name:lang==='ar'?'شعار '+String(i+1).padStart(2,'0'):'LOGO '+String(i+1).padStart(2,'0'),placeholder:true}}):logos;
      var copies=Math.max(1,Math.ceil(10/list.length));
      var group=document.createElement('div');group.className='see-collabs-group';
      for(var c=0;c<copies;c++)list.forEach(function(logo){
        var box=document.createElement(logo.url?'a':'div');box.className='see-collabs-item'+(logo.tone==='dark'?' see-collabs-item--dark':' see-collabs-item--light');
        if(logo.url){box.href=safeLink(logo.url);box.target='_blank';box.rel='noopener noreferrer';}
        if(logo.placeholder){
          var icon=document.createElement('span');icon.className='see-collabs-placeholder';
          var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.5');
          var path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M4 18l4-8 4 5 4-10 4 13H4Z');svg.appendChild(path);
          icon.append(svg,document.createTextNode(logo.name));box.appendChild(icon);
        }else{
          // Transparent PNG image: drop-shadow uses the alpha silhouette, never a rectangular image frame.
          var art=document.createElement('img');art.className='see-collabs-logo';
          art.src=logo.image;art.alt=logo.name||'شعار التعاون';
          art.loading='lazy';art.decoding='async';art.width=200;art.height=116;
          box.appendChild(art);
        }
        group.appendChild(box);
      });
      var clone=group.cloneNode(true);clone.setAttribute('aria-hidden','true');
      // Duplicate groups are identical: -50% translation produces a seamless loop.
      track.append(group,clone);
      var speed=Math.max(15,Math.min(100,Number(config.speedSeconds)||34));
      track.style.setProperty('--see-collabs-speed',speed+'s');
    });
  })();

  // Projects use exactly the original template's case-card layout and reveal/filter JS.
  var works=Array.isArray(data.works)?data.works.filter(function(w){return w.visible!==false}):[];
  function elt(tag,cls,content){var e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e}
  function openWork(w){
    if(w.type==='design'){
      window.open(safeLink(w.url||w.image),'_blank','noopener,noreferrer');return;
    }
    var modal=document.getElementById('see-work-modal');
    if(!modal)return;
    var iframe=modal.querySelector('iframe'),link=modal.querySelector('[data-original]'),title=modal.querySelector('[data-modal-title]');
    title.textContent='2SEE Media';
    link.href=safeLink(w.url||'#');
    var url='';
    try{var u=new URL(w.url);if(['www.instagram.com','instagram.com'].includes(u.hostname)&&/^\/(reel|p)\/[\w-]+\/?$/.test(u.pathname))url=u.origin+u.pathname.replace(/\/$/,'')+'/embed/';
      else if(['youtube.com','www.youtube.com','youtu.be'].includes(u.hostname)){var id=u.hostname==='youtu.be'?u.pathname.slice(1):(u.searchParams.get('v')||u.pathname.match(/\/shorts\/([\w-]+)/)?.[1]);if(/^[\w-]{11}$/.test(id||''))url='https://www.youtube-nocookie.com/embed/'+id}
    }catch(e){}
    iframe.src=url||'about:blank';iframe.hidden=!url;
    if(!modal.open)modal.showModal();
  }
  function card(w,i){
    var art=elt('article','case-card reveal');art.dataset.category=w.type==='design'?'design':'reel';art.style.setProperty('--d',String((i%4)*75)+'ms');
    var a=elt('a','group block see-work-cover');a.href=w.url||w.image||'#';
    a.setAttribute('aria-label',w.type==='reel'?(lang==='ar'?'شاهد الفيديو':'Watch video'):(lang==='ar'?'عرض التصميم':'View design'));
    if(w.type!=='design'){a.addEventListener('click',function(e){e.preventDefault();openWork(w)})}
    else{a.target='_blank';a.rel='noopener noreferrer'}
    var media=elt('div','case-media');
    var img=elt('img');img.src=w.image||'assets/img/2see-placeholder.svg';img.alt='';img.loading='lazy';img.decoding='async';img.width=500;img.height=625;
    img.onerror=function(){if(!img.src.includes('2see-placeholder.svg')){img.onerror=null;img.src='assets/img/2see-placeholder.svg'}};
    media.appendChild(img);
    if(w.type==='reel'){var play=elt('span','see-work-play','▶');play.setAttribute('aria-hidden','true');media.appendChild(play)}
    a.appendChild(media);art.appendChild(a);return art;
  }
  var home=document.getElementById('cms-home-work');if(home)works.filter(function(w){return w.featured}).slice(0,4).forEach(function(w,i){home.appendChild(card(w,i))});
  var grid=document.getElementById('cms-work-grid');if(grid){grid.dataset.pageSize=String(Math.max(4,Math.min(40,Number(data.settings.workPageSize)||12)));works.forEach(function(w,i){grid.appendChild(card(w,i))})}
  if(home||grid){
    var modal=elt('dialog','see-modal');modal.id='see-work-modal';modal.innerHTML='<div class="see-modal-header"><strong data-modal-title>2SEE Media</strong><button type="button" aria-label="Close video" data-modal-close>✕</button></div><iframe title="Video player" loading="lazy" allow="autoplay; fullscreen; encrypted-media" referrerpolicy="strict-origin-when-cross-origin"></iframe><div class="see-modal-bottom"><span>Instagram may restrict embedded playback.</span><a data-original href="#" target="_blank" rel="noopener noreferrer">Open original ↗</a></div>';
    document.body.appendChild(modal);
    if(lang==='ar'){modal.querySelector('[data-modal-close]').setAttribute('aria-label','إغلاق الفيديو');modal.querySelector('.see-modal-bottom span').textContent='قد يمنع إنستغرام تشغيل الفيديو داخل الموقع.';modal.querySelector('[data-original]').textContent='فتح الفيديو الأصلي ↗'}
    modal.querySelector('[data-modal-close]').addEventListener('click',function(){modal.close()});
    modal.addEventListener('close',function(){modal.querySelector('iframe').src='about:blank'});
    modal.addEventListener('click',function(e){if(e.target===modal)modal.close()});
  }

// Career application: browser-side CV chooser. GitHub Pages has no upload backend.
(function(){
 var form=document.querySelector('form[data-send-choice] #a-cv')?.closest('form');
 if(!form)return;
 var fileInput=form.querySelector('#a-cv'),state=form.querySelector('[data-cv-state]'),error=form.querySelector('[data-cv-error]');
 var role=form.querySelector('#apply-role'),otherWrap=form.querySelector('[data-other-role]'),otherInput=form.querySelector('#a-other-role');
 var accepted=/\.(pdf|doc|docx)$/i,limit=10*1024*1024;
 function setError(msg){error.textContent=msg;error.hidden=!msg;fileInput.setCustomValidity(msg||'');fileInput.setAttribute('aria-invalid',msg?'true':'false')}
 function update(){
  var file=fileInput.files&&fileInput.files[0];
  state.textContent=file?file.name:(lang==='ar'?'لم يتم اختيار ملف':'No file selected');
  state.classList.toggle('see-cv-selected',!!file);
  if(!file){setError('');return}
  if(!accepted.test(file.name)){setError(lang==='ar'?'اختر ملفاً بصيغة PDF أو Word فقط.':'Please choose a PDF or Word file.');return}
  if(file.size>limit){setError(lang==='ar'?'يجب ألا يتجاوز حجم الملف 10 ميغابايت.':'The file must be 10 MB or smaller.');return}
  if(file.size===0){setError(lang==='ar'?'الملف فارغ؛ يُرجى اختيار ملف آخر.':'This file is empty. Choose another.');return}
  setError('');
 }
 function updateOther(){
  var show=role.value==='other';otherWrap.hidden=!show;otherInput.required=show;
  if(!show){otherInput.value='';otherInput.setCustomValidity('')}
 }
 fileInput.addEventListener('change',update);
 role.addEventListener('change',updateOther);
 updateOther();
 window.SEE_VALIDATE_CV=function(){update();return !fileInput.validationMessage&&!!fileInput.files?.[0]};
})();

// Static hosting: prepare a message for the visitor's chosen app.
// Never claim that 2SEE received the message: the visitor must press Send there.
document.addEventListener('submit',function(e){
  var form=e.target;if(!form.matches('form[data-send-choice]'))return;
  e.preventDefault();e.stopImmediatePropagation();
  var method=(e.submitter&&e.submitter.dataset.sendMethod)||'email';
  var isCareer=page==='careers.html';
  var notice=form.querySelector('#see-form-notice');
  if(!notice){notice=elt('div','see-form-notice');notice.id='see-form-notice';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');form.appendChild(notice)}
  notice.replaceChildren();notice.dataset.error='false';
  if(isCareer&&window.SEE_VALIDATE_CV&&!window.SEE_VALIDATE_CV()){form.querySelector('#a-cv')?.focus();return;}
  if(!form.reportValidity())return;
  var group=form.querySelector('[data-required-group]');
  if(group&&!group.querySelector('input[type="checkbox"]:checked')){
    notice.dataset.error='true';
    notice.textContent=lang==='ar'?'اختر خدمة واحدة على الأقل لإعداد طلبك.':'Please select at least one service.';
    group.scrollIntoView({behavior:'smooth',block:'center'});return;
  }
  var texts={
    ar:{name:'الاسم',email:'البريد الإلكتروني',company:'الشركة',services:'الخدمات',message:'تفاصيل المشروع',source:'كيف تعرّفت إلينا',role:'الاختصاص',other_role:'اختصاص آخر',portfolio:'رابط الأعمال',location:'مكان الإقامة',note:'نبذة عن العمل',cv:'ملف الـCV',consent:'الموافقة'},
    en:{name:'Name',email:'Email',company:'Company',services:'Services',message:'Project details',source:'How you heard about us',role:'Specialty',other_role:'Other specialty',portfolio:'Portfolio',location:'Location',note:'About your work',cv:'CV file',consent:'Consent'}
  }[lang];
  var pairs=[];
  var fd=new FormData(form);
  ['name','email','company','role','other_role','portfolio','location','message','note','source'].forEach(function(k){
    var val=String(fd.get(k)||'').trim();
    if(!val)return;
    if(k==='role'||k==='source'){
      var s=form.querySelector('[name="'+k+'"]');
      if(s&&s.selectedOptions.length)val=s.selectedOptions[0].textContent.trim();
    }
    pairs.push(texts[k]+': '+val);
  });
  var cv=isCareer?form.querySelector('input[name="cv"]')?.files?.[0]:null;
  if(cv)pairs.push(texts.cv+': '+cv.name);
  var checked=Array.from(form.querySelectorAll('input[name="services"]:checked'));
  if(checked.length){pairs.push(texts.services+': '+checked.map(function(x){return x.closest('label').querySelector('span').textContent.trim()}).join(lang==='ar'?'، ':', '))}
  var body=(isCareer?(lang==='ar'?'طلب تعاون جديد إلى 2See Media':'New collaboration application — 2SEE Media'):(lang==='ar'?'طلب مشروع جديد إلى 2See Media':'New project enquiry — 2SEE Media'))+'\n\n'+pairs.join('\n');
  if(cv)body+='\n\n'+(lang==='ar'?'تنبيه: يجب إرفاق السيرة الذاتية يدوياً قبل إرسال الرسالة.':'Reminder: attach the CV file manually before sending.');
  var subject=isCareer?'2SEE Media | Collaboration application':'2SEE Media | Project enquiry';
  var url='';
  if(method==='whatsapp'){
    var phone=String(data.brand.whatsapp||'963964603742').replace(/\D/g,'');
    if(!phone){notice.textContent=lang==='ar'?'رقم واتساب غير متاح حالياً؛ يُرجى استخدام البريد الإلكتروني.':'WhatsApp is unavailable. Please use email.';notice.dataset.error='true';return}
    url='https://wa.me/'+phone+'?text='+encodeURIComponent(body);
  }else{
    var address=String(data.brand.email||'2see.mediaa@gmail.com').trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)){notice.textContent=lang==='ar'?'عنوان البريد الإلكتروني غير صالح حالياً؛ يُرجى استخدام واتساب.':'Email is unavailable. Please use WhatsApp.';notice.dataset.error='true';return}
    url='mailto:'+address+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  }
  var a=elt('a');a.href=url;a.textContent=method==='whatsapp'?(lang==='ar'?'فتح واتساب':'Open WhatsApp'):(lang==='ar'?'فتح البريد الإلكتروني':'Open email');
  if(method==='whatsapp'){a.target='_blank';a.rel='noopener noreferrer'}
  var handoff=cv?(lang==='ar'?' **مهم:** يُرجى إرفاق ملف السيرة الذاتية ( '+cv.name+' ) يدوياً قبل الضغط على «إرسال».':' **Important:** Attach your CV ('+cv.name+') before you press Send.'):'';
  var info=elt('span','',method==='whatsapp'?(lang==='ar'?'سيُفتح واتساب مع رسالة جاهزة؛ اضغط «إرسال» لإتمام الطلب.':'WhatsApp opens with your message. Press Send there.'):(lang==='ar'?'سيُفتح تطبيق البريد الإلكتروني مع رسالة جاهزة؛ اضغط «إرسال» لإتمام الطلب.':'Your email app opens with your message. Press Send there.'));
  info.textContent+=handoff;
  notice.append(info,document.createTextNode(' '),a);
  if(method==='whatsapp')window.open(url,'_blank','noopener,noreferrer');
  else window.location.href=url;
},true);
  window.SEE_CMS={data:data,page:page,lang:lang,preview:preview};
})();
