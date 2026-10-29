/* Local form feedback; the existing CMS handler prepares the chosen app message. */
(function(){
 'use strict';
 var forms=Array.from(document.querySelectorAll('form[data-send-choice]'));if(!forms.length)return;
 var ar=document.documentElement.lang==='ar',reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 var chosenPackage=new URLSearchParams(location.search).get('package')||'',brief=document.getElementById('c-message');
 if(brief&&!brief.value&&/^(basic|premium)-(spark|impact|icon)$/.test(chosenPackage)){var packageName=chosenPackage.replace('-', ' ').toUpperCase();brief.value=ar?'أرغب بالاستفسار عن باقة '+packageName+'.':'I would like to enquire about the '+packageName+' package.';}

 function message(field){
  if(field.type==='file'){
   if(!field.files||!field.files.length)return ar?'اختر ملف سيرتك الذاتية.':'Choose your CV file.';
   if(field.validationMessage)return field.validationMessage;return '';
  }
  if(field.required&&((field.type==='checkbox'&&!field.checked)||(field.type!=='checkbox'&&!field.value.trim())))return field.type==='checkbox'?(ar?'وافق على مشاركة بياناتك لإكمال الطلب.':'Confirm that you agree to share your details.'):(ar?'يرجى تعبئة هذا الحقل.':'Please complete this field.');
  if(field.validity.typeMismatch)return field.type==='email'?(ar?'اكتب بريداً إلكترونياً صالحاً، مثل name@example.com.':'Enter a valid email, such as name@example.com.'):(ar?'اكتب رابطاً كاملاً يبدأ بـ https://.':'Enter a complete link starting with https://.');
  if(field.minLength>0&&field.value&&field.value.trim().length<field.minLength)return ar?'اكتب '+field.minLength+' حرفاً على الأقل حتى نقدر نفهم مشروعك.':'Please write at least '+field.minLength+' characters so we can understand your project.';
  if(!field.validity.valid)return ar?'تحقق من قيمة هذا الحقل.':'Please check this field.';
  return '';
 }
 function feedback(field,text){
  var id=field.id+'-feedback',error=document.getElementById(id),holder=field.closest('[data-field]')||field.parentElement;
  if(!error){error=document.createElement('p');error.id=id;error.className='studio-field-feedback';error.setAttribute('role','alert');holder.append(error)}
  error.textContent=text;error.hidden=!text;
  var descriptions=(field.getAttribute('aria-describedby')||'').split(/\s+/).filter(function(x){return x&&x!==id});
  if(text){field.setAttribute('aria-invalid','true');descriptions.push(id)}else field.removeAttribute('aria-invalid');
  if(descriptions.length)field.setAttribute('aria-describedby',descriptions.join(' '));else field.removeAttribute('aria-describedby');
  return !text;
 }
 function fields(form){return Array.from(form.querySelectorAll('input,select,textarea')).filter(function(field){return !field.disabled&&!field.closest('[hidden]')&&!field.closest('[data-required-group]')&&(field.required||field.type==='email'||field.type==='url'||field.minLength>0)})}
 function groupValid(group){
  var error=group.querySelector('[data-service-feedback]'),ok=!!group.querySelector('input:checked');
  if(!error){error=document.createElement('p');error.className='studio-field-feedback';error.dataset.serviceFeedback='';error.id=group.id+'-feedback';error.setAttribute('role','alert');group.append(error)}
  error.hidden=ok;error.textContent=ok?'':(ar?'اختار خدمة واحدة على الأقل، أو «لم أحدّد بعد».':'Choose at least one service, or select “Not sure yet”.');
  var first=group.querySelector('input');if(!ok){first.setAttribute('aria-invalid','true');first.setAttribute('aria-describedby',error.id)}else{first.removeAttribute('aria-invalid');first.removeAttribute('aria-describedby')}
  return ok;
 }
 window.SEE_VALIDATE_FORM=function(form){
  var file=form.querySelector('input[type=file]');if(file&&file.files&&file.files.length&&window.SEE_VALIDATE_CV)window.SEE_VALIDATE_CV();
  var bad=null;fields(form).forEach(function(field){field.dataset.studioTouched='1';if(!feedback(field,message(field))&&!bad)bad=field});
  form.querySelectorAll('[data-required-group]').forEach(function(group){if(!groupValid(group)&&!bad)bad=group.querySelector('input')});
  if(bad){bad.focus({preventScroll:true});bad.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});return false;}return true;
 };
 forms.forEach(function(form){
  Array.from(form.querySelectorAll('input,select,textarea')).filter(function(field){return !field.closest('[data-required-group]')}).forEach(function(field){
   field.addEventListener('blur',function(){if(!field.value&&field.type!=='checkbox')return;field.dataset.studioTouched='1';feedback(field,message(field))});
   ['input','change'].forEach(function(event){field.addEventListener(event,function(){if(field.dataset.studioTouched)feedback(field,message(field))})});
   if(field.required&&field.id){var label=form.querySelector('label[for="'+field.id+'"]');if(label&&!label.textContent.includes('*')){var star=document.createElement('span');star.textContent=' *';star.setAttribute('aria-hidden','true');label.append(star)}}
  });
  form.querySelectorAll('[data-required-group]').forEach(function(group){group.addEventListener('change',function(e){var uncertain=group.querySelector('input[value="Not sure yet"]');if(uncertain&&e.target.checked){if(e.target===uncertain)group.querySelectorAll('input').forEach(function(box){if(box!==uncertain)box.checked=false});else uncertain.checked=false}if(group.querySelector('[data-service-feedback]'))groupValid(group)})});
  var file=form.querySelector('input[type=file]');if(!file)return;
  var tools=document.createElement('div');tools.className='studio-file-tools';tools.hidden=true;var size=document.createElement('span'),clear=document.createElement('button');clear.type='button';clear.textContent=ar?'إزالة الملف':'Remove file';tools.append(size,clear);file.closest('[data-field]').append(tools);
  function fileState(){var chosen=file.files&&file.files[0];tools.hidden=!chosen;if(chosen)size.textContent=chosen.size>=1024*1024?(chosen.size/(1024*1024)).toFixed(2)+' MB':Math.max(1,Math.round(chosen.size/1024))+' KB'}
  clear.addEventListener('click',function(){file.value='';file.dispatchEvent(new Event('change',{bubbles:true}));file.focus()});file.addEventListener('change',fileState);fileState();
 });
})();
