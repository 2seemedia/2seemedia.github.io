(async function(){'use strict';
const KEY='2see-agency-draft-v12';
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const clone=o=>JSON.parse(JSON.stringify(o));
let loaded,session;
try{
 const responses=await Promise.all([fetch('/api/content',{cache:'no-store'}),fetch('/api/session',{cache:'no-store'})]);
 const values=await Promise.all(responses.map(r=>r.json()));
 if(responses.some(r=>!r.ok))throw Error(values.find(v=>v.error)?.error||'تعذّر الاتصال');
 [loaded,session]=values;
}catch(error){document.body.textContent='تعذّر فتح لوحة الإدارة: '+error.message;return;}
const original=loaded.content;
let baseRevision=loaded.revision;
$('#session-status').textContent='الحساب: '+session.email+' · الفرع: '+session.branch;
$('#publish-github').disabled=!session.publishEnabled;
$('#publish-github').textContent=session.publishEnabled?(session.production?'نشر على الموقع الرسمي':'نشر تجريبي على فرع الاختبار'):'النشر مقفل';
if(!original){alert('تعذر قراءة بيانات الموقع');return}
let data=clone(original);try{
 const saved=JSON.parse(localStorage.getItem(KEY)||'null');
 if(saved&&saved.version===original.version&&saved.pages){data=saved;baseRevision=saved.__adminRevision||'stale';}

}catch(e){}
let tab='content',page='index.html',section='all',kind='all',search='',limit=35,editWork=-1;
let selectedCmsKey='';
const labels={'index.html':'الرئيسية','services.html':'الخدمات','work.html':'الأعمال','about.html':'من نحن','careers.html':'التعاون','contact.html':'التواصل','case-study.html':'تفاصيل مشروع','404.html':'صفحة غير موجودة'};
const tabTitles={visual:['المحرر المرئي','انقري على النص داخل المعاينة لتعديل حجمه ولونه أو إخفائه.'],content:['النصوص والتصميم','تعديل العبارات وأحجام الخطوط والألوان وظهور كل عنصر.'],sections:['الأقسام والظهور','التحكم في الأقسام الظاهرة بكل صفحة.'],works:['الأعمال ومقاطع الفيديو','إدارة جميع الأعمال من واجهة واحدة.'],collaborations:['الشعارات المتحركة','إضافة شعارات التعاون وتعديل حركتها.'],brand:['الهوية والروابط','الشعار والألوان ومعلومات التواصل واللغة.'],preview:['معاينة الموقع','معاينة التعديلات على تصميم Agency الأصلي.'],publish:['النشر والنسخ الاحتياطي','تصدير نسخة احتياطية أو نشر التعديلات بعد اعتمادها.']};
function save(){try{localStorage.setItem(KEY,JSON.stringify({...data,__adminRevision:baseRevision}));$('#save-status').textContent='تم حفظ المسودة على هذا الجهاز ✓';$('#draft-badge').textContent='مسودة محفوظة';return true}catch(e){$('#save-status').textContent='فشل الحفظ: حجم الصور كبير، استخدمي رابط صورة أو صورة أصغر.';return false}}
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
function updateShared(entry,fieldName,newValue){const old=entry[fieldName];entry[fieldName]=newValue;if(['header','footer'].includes(entry.section)&&old!==newValue){Object.values(data.pages).flat().forEach(e=>{if(e!==entry&&e.section===entry.section&&e.kind===entry.kind&&e[fieldName]===old)e[fieldName]=newValue})}}
function field(label,value,onChange,multiline=false){const box=el('div','field');const l=el('label','',label);const inp=el(multiline?'textarea':'input',multiline?'textarea':'input');if(multiline)inp.rows=3;inp.value=value||'';inp.addEventListener('input',()=>{onChange(inp.value);save()});box.append(l,inp);return box}
function button(text,click,cls='btn'){const b=el('button',cls,text);b.type='button';b.addEventListener('click',click);return b}
function selectPages(selector){const e=$(selector);e.replaceChildren();Object.keys(data.pages).forEach(p=>{const o=el('option','',labels[p]||p);o.value=p;e.append(o)});e.value=page;e.addEventListener('change',()=>{page=e.value;section='all';limit=35;render()})}
function setTab(t){tab=t;$$('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));$$('[id^="tab-"]').forEach(x=>x.classList.add('hidden'));$('#tab-'+t).classList.remove('hidden');$('#page-title').textContent=tabTitles[t][0];$('#page-description').textContent=tabTitles[t][1];render()}
$$('[data-tab]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
function styleControls(entry){
 const details=el('details','style-editor');details.append(el('summary','','تصميم النص · الحجم واللون والإظهار'));
 const st=entry.style||(entry.style={});const grid=el('div','style-controls');
 const sizeBox=el('div','field');sizeBox.append(el('label','','حجم الخط بالبكسل (اتركيه فارغاً للحجم الأصلي)'));
 const size=el('input','input');size.type='number';size.min=9;size.max=150;size.step=1;size.placeholder='تلقائي';size.value=st.fontSize??'';
 size.addEventListener('change',()=>{st.fontSize=size.value===''?null:Math.min(150,Math.max(9,Number(size.value)||16));save()});sizeBox.append(size);grid.append(sizeBox);
 const colorBox=el('div','field');colorBox.append(el('label','','لون الخط'));
 const color=el('input','input');color.type='color';color.value=/^#[0-9a-f]{6}$/i.test(st.color||'')?st.color:'#101010';color.addEventListener('input',()=>{st.color=color.value;save()});colorBox.append(color);grid.append(colorBox);
 const weightBox=el('div','field');weightBox.append(el('label','','سماكة الخط'));
 const weight=el('select','select');[['','حسب التصميم الأصلي'],['normal','عادي'],['500','متوسط'],['600','شبه عريض'],['700','عريض'],['800','عريض جداً'],['900','ثقيل']].forEach(([v,t])=>{let o=el('option','',t);o.value=v;weight.append(o)});weight.value=String(st.fontWeight||'');weight.addEventListener('change',()=>{st.fontWeight=weight.value;save()});weightBox.append(weight);grid.append(weightBox);
 const toggleOption=(key,label)=>{let hold=el('label','toggle');let cb=el('input');cb.type='checkbox';cb.checked=st[key]===true;cb.addEventListener('change',()=>{st[key]=cb.checked;save()});hold.append(cb,el('strong','',label));return hold};
 grid.append(toggleOption('italic','خط مائل'),toggleOption('underline','خط تحته خط'),toggleOption('hidden','إخفاء العنصر من الموقع'));
 details.append(grid);
 const actions=el('div','style-actions');actions.append(button('استعادة التنسيق الأصلي',()=>{delete entry.style;save();const parent=details.parentNode;const newEditor=styleControls(entry);parent.replaceChild(newEditor,details)}));
 if(entry.kind==='text')actions.append(button('حذف نص هذه العبارة',()=>{if(!confirm('هل تريدين حذف نص العبارة في اللغتين؟ يمكن إعادته لاحقاً.'))return;updateShared(entry,'en','');updateShared(entry,'ar','');save();render()},'btn danger'));
 details.append(actions);return details;
}
function renderEntryEditor(e){
 const wrap=el('div','entry');wrap.dataset.entryKey=e.key;if(selectedCmsKey===e.key)wrap.classList.add('is-selected');
 const head=el('div','entry-header');head.append(el('strong','',e.label||e.key),el('span','tag',e.kind));wrap.append(head);
 const grid=el('div','grid2');const isText=e.kind==='text';
 grid.append(field(isText?'English':'القيمة / الرابط',e.en,v=>{updateShared(e,'en',v);if(!isText)updateShared(e,'ar',v)},isText&&String(e.en||'').length>65));
 if(isText)grid.append(field('العربية',e.ar,v=>updateShared(e,'ar',v),true));
 else if(e.kind==='image'){
  const extra=el('div','field');const lbl=el('label','','رفع صورة من جهازك (PNG / JPG / WebP — أقل من 1.2MB)');const upload=el('input','fileinput');upload.type='file';upload.accept='image/png,image/jpeg,image/webp';upload.addEventListener('change',async()=>{
   const file=upload.files?.[0];if(!file)return;if(file.size>1.2*1024*1024){alert('يُرجى اختيار صورة أصغر من 1.2MB');return}
   const reader=new FileReader();reader.onload=()=>{e.en=reader.result;e.ar=reader.result;if(save())render()};reader.readAsDataURL(file)
  });extra.append(lbl,upload);grid.append(extra);
 }
 wrap.append(grid);
 if(['text','label','option','image'].includes(e.kind))wrap.append(styleControls(e));
 return wrap;
}
function renderContent(){
 const sections=$('#section-select');sections.replaceChildren();let o=el('option','','كل الأقسام');o.value='all';sections.append(o);
 const all=Object.entries(data.sections).filter(([k,v])=>v.page===page);
 all.forEach(([k,v])=>{const opt=el('option','',v.label||k);opt.value=k;sections.append(opt)});
 ['header','footer','general'].forEach(k=>{const opt=el('option','',{'header':'الهيدر','footer':'الفوتر','general':'إعدادات عامة'}[k]);opt.value=k;sections.append(opt)});
 sections.value=section;
 const q=search.trim().toLowerCase();const entries=data.pages[page].filter(e=>(section==='all'||e.section===section)&&(kind==='all'||(kind==='other'?!['text','image','link','meta'].includes(e.kind):e.kind===kind))&&(!q||(e.label+' '+e.en+' '+e.ar).toLowerCase().includes(q)));
 $('#entry-count').textContent=entries.length+' عنصر قابل للتعديل — المعروض '+Math.min(limit,entries.length);
 const list=$('#entries');list.replaceChildren();
 entries.slice(0,limit).forEach(e=>{
  list.append(renderEntryEditor(e));
 });
 $('#load-more-wrap').classList.toggle('hidden',limit>=entries.length)
}
$('#page-select').addEventListener('change',e=>{page=e.target.value;section='all';limit=35;renderContent()});
$('#section-select').addEventListener('change',e=>{section=e.target.value;limit=35;renderContent()});
$('#kind-select').addEventListener('change',e=>{kind=e.target.value;limit=35;renderContent()});
$('#search').addEventListener('input',e=>{search=e.target.value;limit=35;renderContent()});
$('#load-more').addEventListener('click',()=>{limit+=35;renderContent()});
function renderSections(){const select=$('#section-page');select.value=page;const list=$('#section-list');list.replaceChildren();Object.entries(data.sections).filter(([k,v])=>v.page===page).forEach(([k,v])=>{const label=el('label','toggle');const cb=el('input');cb.type='checkbox';cb.checked=v.visible!==false;cb.addEventListener('change',()=>{v.visible=cb.checked;save()});const box=el('span');box.append(el('strong','',v.label||k),el('small','',k));label.append(cb,box);list.append(label)})}
$('#section-page').addEventListener('change',e=>{page=e.target.value;renderSections()});
function renderWorks(){const list=$('#works-list');list.replaceChildren();data.works.forEach((w,i)=>{const row=el('div','workrow');const img=el('img');img.src=w.image||'assets/img/2see-placeholder.svg';img.onerror=()=>{img.onerror=null;img.src='assets/img/2see-placeholder.svg'};const info=el('div');info.append(el('strong','',w.title||'بدون عنوان'),el('small','',(w.type==='reel'?'ريل':'تصميم')+' · '+(w.visible?'ظاهر':'مخفي')+' · '+(w.featured?'مميز':'عادي')));const buttons=el('div','buttons');buttons.append(button('تعديل',()=>{editWork=i;renderWorkEditor()}),button('↑',()=>{if(i>0){[data.works[i-1],data.works[i]]=[data.works[i],data.works[i-1]];save();renderWorks()}}),button('↓',()=>{if(i<data.works.length-1){[data.works[i+1],data.works[i]]=[data.works[i],data.works[i+1]];save();renderWorks()}}),button('حذف',()=>{if(confirm('متأكدة من حذف العمل؟')){data.works.splice(i,1);editWork=-1;save();renderWorks();$('#work-editor').classList.add('hidden')}}));row.append(img,info,buttons);list.append(row)})}
function renderWorkEditor(){const p=$('#work-editor');p.classList.remove('hidden');p.replaceChildren();const w=data.works[editWork];if(!w){p.classList.add('hidden');return}p.append(el('h2','','تعديل العمل'));const grid=el('div','grid2');
 [['عنوان العمل EN','title'],['عنوان العمل AR','titleAr'],['اسم العميل','client'],['السنة','year'],['وصف مختصر','description'],['رابط العمل الأصلي','url'],['رابط الغلاف','image']].forEach(([label,key])=>grid.append(field(label,w[key],v=>{w[key]=v;save();if(key==='title'||key==='image')renderWorks()},key==='description')));
 const typ=el('div','field');typ.append(el('label','','نوع العمل'));const sel=el('select','select');[['reel','ريل'],['design','تصميم']].forEach(([v,l])=>{const op=el('option','',l);op.value=v;sel.append(op)});sel.value=w.type;sel.addEventListener('change',()=>{w.type=sel.value;save();renderWorks()});typ.append(sel);grid.append(typ);
 const file=el('div','field');file.append(el('label','','رفع غلاف من جهازك (أقل من 1.2MB)'));const inp=el('input','fileinput');inp.type='file';inp.accept='image/png,image/jpeg,image/webp';inp.addEventListener('change',()=>{const f=inp.files?.[0];if(!f)return;if(f.size>1.2*1024*1024){alert('يُرجى اختيار صورة أصغر');return}const r=new FileReader();r.onload=()=>{w.image=r.result;save();renderWorks()};r.readAsDataURL(f)});file.append(inp);grid.append(file);
 [['visible','إظهار العمل على الموقع'],['featured','إظهار بالصفحة الرئيسية']].forEach(([key,label])=>{const box=el('label','toggle');const cb=el('input');cb.type='checkbox';cb.checked=w[key];cb.addEventListener('change',()=>{w[key]=cb.checked;save();renderWorks()});box.append(cb,el('strong','',label));grid.append(box)});
 p.append(grid,button('إغلاق المحرر',()=>{p.classList.add('hidden');editWork=-1}));p.scrollIntoView({behavior:'smooth',block:'start'})}
$('#add-work').addEventListener('click',()=>{data.works.unshift({id:'new-'+Date.now(),type:'reel',title:'',titleAr:'',client:'',year:String(new Date().getFullYear()),description:'',url:'',image:'',featured:false,visible:false});editWork=0;save();renderWorks();renderWorkEditor()});

function renderCollaborations(){
 const c=data.collaborations||(data.collaborations={headingAr:'من تعاونّا معهم',headingEn:'Who we have worked with',speedSeconds:34,logos:[]});
 const settings=$('#collabs-settings');settings.replaceChildren();const fields=el('div','grid2');
 fields.append(field('العنوان بالعربية',c.headingAr,v=>{c.headingAr=v;save()}),field('العنوان بالإنجليزية',c.headingEn,v=>{c.headingEn=v;save()}));
 const speed=el('div','field');speed.append(el('label','','مدة دورة الحركة (بالثواني، 15–100)'));const inp=el('input','input');inp.type='number';inp.min=15;inp.max=100;inp.value=c.speedSeconds||34;inp.addEventListener('change',()=>{c.speedSeconds=Math.max(15,Math.min(100,Number(inp.value)||34));inp.value=c.speedSeconds;save()});speed.append(inp);fields.append(speed);settings.append(fields);
 const list=$('#collabs-list');list.replaceChildren();
 if(!c.logos.length)list.append(el('div','panel','لم تُضف أي شعارات حقيقية بعد. ستظهر في المعاينة شعارات توضيحية مرقّمة فقط.'));
 c.logos.forEach((logo,i)=>{
  const panel=el('div','panel');panel.append(el('h2','','الشعار '+(i+1)));
  const preview=el('img');preview.src=logo.image||'assets/img/2see-placeholder.svg';preview.alt=logo.name||'معاينة الشعار';preview.style.cssText='display:block;max-width:170px;width:170px;height:96px;object-fit:contain;padding:10px;border-radius:12px;background:linear-gradient(145deg,#b4b9c0,#d9dce1);border:1px solid #9298a0;box-shadow:0 5px 18px #0002;margin-bottom:14px';panel.append(preview);
  const grid=el('div','grid2');grid.append(field('اسم الجهة أو الشخص',logo.name||'',v=>{logo.name=v;save()}),field('رابط الشعار (PNG / JPG / WebP)',logo.image||'',v=>{logo.image=v;preview.src=v||'assets/img/2see-placeholder.svg';save()}),field('رابط الجهة (اختياري)',logo.url||'',v=>{logo.url=v;save()}));
  const appearance=el('div','field');appearance.append(el('label','','خلفية مناسبة لألوان الشعار'));const tone=el('select','select');[['light','فضي فاتح للشعارات الداكنة'],['dark','فحمي داكن للشعارات الفاتحة']].forEach(([v,caption])=>{const opt=el('option','',caption);opt.value=v;tone.append(opt)});tone.value=logo.tone||'light';tone.addEventListener('change',()=>{logo.tone=tone.value;preview.style.background=tone.value==='dark'?'#30353e':'#eceef2';save()});appearance.append(tone);grid.append(appearance);preview.style.background=(logo.tone==='dark'?'#30353e':'#eceef2');
  const visibility=el('label','toggle');const checkbox=el('input');checkbox.type='checkbox';checkbox.checked=logo.visible!==false;checkbox.addEventListener('change',()=>{logo.visible=checkbox.checked;save()});visibility.append(checkbox,el('strong','','إظهار هذا الشعار'));grid.append(visibility);
  const upload=el('div','field');upload.append(el('label','','رفع الشعار من الجهاز (حتى 1.2MB)'));const file=el('input','fileinput');file.type='file';file.accept='image/png,image/jpeg,image/webp';file.addEventListener('change',()=>{const f=file.files?.[0];if(!f)return;if(f.size>1.2*1024*1024){alert('يُرجى اختيار ملف أصغر من 1.2MB');return}const reader=new FileReader();reader.onload=()=>{logo.image=reader.result;if(save())renderCollaborations()};reader.readAsDataURL(f)});upload.append(file);grid.append(upload);panel.append(grid);
  const actions=el('div','actions');actions.append(button('↑',()=>{if(i>0){[c.logos[i-1],c.logos[i]]=[c.logos[i],c.logos[i-1]];save();renderCollaborations()}}),button('↓',()=>{if(i<c.logos.length-1){[c.logos[i+1],c.logos[i]]=[c.logos[i],c.logos[i+1]];save();renderCollaborations()}}),button('حذف الشعار',()=>{if(confirm('حذف هذا الشعار؟')){c.logos.splice(i,1);save();renderCollaborations()}}));panel.append(actions);list.append(panel);
 });
}
$('#add-collab').addEventListener('click',()=>{data.collaborations||(data.collaborations={headingAr:'من تعاونّا معهم',headingEn:'Who we have worked with',speedSeconds:34,logos:[]});data.collaborations.logos.push({name:'',image:'',url:'',visible:true});save();renderCollaborations()});
function renderBrand(){const root=$('#brand-fields');root.replaceChildren();const grid=el('div','grid2');
 [['اسم الشركة','name'],['لون التمييز الرئيسي','accent'],['لون التمييز عند المرور','accentHover'],['لون التمييز الثاني','highlight'],['مسار أو رابط اللوغو','logo'],['البريد الإلكتروني','email'],['رقم واتساب','whatsapp'],['رابط إنستغرام 2SEE','instagram'],['إنستغرام محمد الشافي','mohamadInstagram'],['إنستغرام إسراء منصور','esraaInstagram'],['خط العناوين الإنجليزية','headingFont'],['خط النصوص الإنجليزية','bodyFont'],['الخط العربي','arabicFont'],['رابط يوتيوب','youtube'],['رابط فيسبوك','facebook']].forEach(([label,key])=>grid.append(field(label,data.brand[key],v=>data.brand[key]=v)));
 root.append(grid);
 const density=el('div','grid2');
 [['عدد أعمدة الأعمال على الكمبيوتر','galleryColumns',2,5],['عدد الأعمال في كل دفعة','workPageSize',4,40],['حجم العناوين (0.8–1.2)','headlineScale',0.8,1.2],['حجم شريط الخدمات (0.8–1.2)','marqueeScale',0.8,1.2]].forEach(([label,key,min,max])=>{
  const holder=el('div','field');holder.append(el('label','',label));const input=el('input','input');input.type='number';input.min=min;input.max=max;input.step=(max===1.2?0.05:1);input.value=data.settings[key]??(key==='galleryColumns'?4:key==='workPageSize'?12:1);input.addEventListener('change',()=>{let v=Number(input.value);if(!Number.isFinite(v))return;v=Math.max(min,Math.min(max,v));data.settings[key]=v;input.value=v;save()});holder.append(input);density.append(holder);
 });
 root.append(el('h3','','حجم الخطوط ومعرض الأعمال'),density);
 const more=el('div','grid2');const lang=el('div','field');lang.append(el('label','','اللغة الافتراضية'));const select=el('select','select');[['en','English'],['ar','العربية']].forEach(([v,l])=>{const o=el('option','',l);o.value=v;select.append(o)});select.value=data.settings.defaultLanguage;select.addEventListener('change',()=>{data.settings.defaultLanguage=select.value;save()});lang.append(select);more.append(lang);
 const toggle=el('label','toggle');const cb=el('input');cb.type='checkbox';cb.checked=data.settings.arabicEnabled;cb.addEventListener('change',()=>{data.settings.arabicEnabled=cb.checked;save()});toggle.append(cb,el('strong','','إظهار زر اللغة العربية'));more.append(toggle);
 const introToggle=el('label','toggle');const introBox=el('input');introBox.type='checkbox';introBox.checked=data.settings.introEnabled!==false;introBox.addEventListener('change',()=>{data.settings.introEnabled=introBox.checked;save()});introToggle.append(introBox,el('strong','','إظهار اللوغو عند أول فتح للموقع'));more.append(introToggle);
 const duration=el('div','field');duration.append(el('label','','مدة شاشة الافتتاح (بالميلي ثانية — 1000 إلى 2500)'));const durInput=el('input','input');durInput.type='number';durInput.min=1000;durInput.max=2500;durInput.step=100;durInput.value=data.settings.introDurationMs??1600;durInput.addEventListener('change',()=>{data.settings.introDurationMs=Math.max(1000,Math.min(2500,Number(durInput.value)||1600));durInput.value=data.settings.introDurationMs;save()});duration.append(durInput);more.append(duration);
 root.append(more)
}
function previewUrl(){return page+'?cms-preview=1&lang='+$('#preview-lang').value}
function renderPreview(){const frame=$('#preview-frame');$('#preview-page').value=page;frame.src=previewUrl();$('#open-preview').href=previewUrl()}
$('#preview-page').addEventListener('change',e=>{page=e.target.value;renderPreview()});$('#preview-lang').addEventListener('change',renderPreview);$('#reload-preview').addEventListener('click',renderPreview);
function render(){if(tab==='content')renderContent();if(tab==='sections')renderSections();if(tab==='works')renderWorks();if(tab==='collaborations')renderCollaborations();if(tab==='brand')renderBrand();if(tab==='preview')renderPreview();if(tab==='visual')renderVisual();}
function download(name,content,type){const blob=new Blob([content],{type:type||'application/octet-stream'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}
function renderVisual(){
 $('#visual-page').value=page;$('#visual-frame').src=page+'?cms-preview=1&cms-edit=1&lang='+$('#visual-lang').value;
}
$('#visual-page').addEventListener('change',e=>{page=e.target.value;selectedCmsKey='';$('#visual-selected').textContent='انقري على أي نص في المعاينة لاختياره';renderVisual()});
$('#visual-lang').addEventListener('change',renderVisual);
$('#visual-reload').addEventListener('click',renderVisual);
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.source!==$('#visual-frame').contentWindow||e.data?.type!=='2see:edit-element')return;
 const key=String(e.data.key||'');const found=(data.pages[e.data.page]||[]).find(x=>x.key===key);if(!found)return;
 selectedCmsKey=key;page=e.data.page;const slot=$('#visual-selected');slot.replaceChildren();slot.append(renderEntryEditor(found));
 slot.scrollIntoView({behavior:'smooth',block:'nearest'});
});
$('#quick-publish').addEventListener('click',()=>{save();setTab('publish');});
$('#go-publish').addEventListener('click',()=>setTab('publish'));
$('#refresh-live-content').addEventListener('click',async()=>{
 const status=$('#live-content-status'),btn=$('#refresh-live-content');
 if(!confirm('سيؤدي تحميل المحتوى المنشور إلى استبدال المسودة الحالية على هذا الجهاز. هل تريدين المتابعة؟'))return;
 btn.disabled=true;status.textContent='جارٍ تحميل النسخة المنشورة...';
 try{
  const response=await fetch('/api/content',{cache:'no-store'});
  const latest=await response.json();if(!response.ok)throw Error(latest.error||'تعذّر التحميل');
  const updated=latest.content;baseRevision=latest.revision;
  data=updated;page='index.html';section='all';editWork=-1;$('#page-select').value=page;$('#section-page').value=page;$('#preview-page').value=page;
  if(!save())throw Error('تعذّر تخزين المسودة');
  render();status.textContent='تم تحميل أحدث نسخة منشورة ✓ يمكنك الآن تعديلها';
 }catch(error){status.textContent='تعذّر التحميل: '+error.message}finally{btn.disabled=false}
});
$('#save-draft').addEventListener('click',save);$('#quick-preview').addEventListener('click',()=>setTab('preview'));
$('#reset-draft').addEventListener('click',()=>{if(!confirm('هل تريد حذف جميع التعديلات المحلية؟'))return;localStorage.removeItem(KEY);data=clone(original);baseRevision=loaded.revision;render();$('#save-status').textContent='تمت استعادة النسخة الأصلية'});
$('#export-json').addEventListener('click',()=>download('2see-site-content.json',JSON.stringify(data,null,2),'application/json'));
$('#export-js').addEventListener('click',()=>download('site-data.js','window.SEE_CMS_DATA = '+JSON.stringify(data)+';\n','text/javascript'));
$('#import-json').addEventListener('click',()=>$('#import-file').click());
$('#import-file').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const parsed=JSON.parse(await f.text());if(!parsed.pages||!parsed.brand||!Array.isArray(parsed.works))throw Error('ملف غير صالح');if(!confirm('استبدال المسودة الحالية بالمحتوى المستورد؟'))return;data=parsed;baseRevision=parsed.__adminRevision||'stale';save();render()}catch(err){alert('تعذّر استيراد الملف: '+err.message)}});
$('#publish-github').addEventListener('click',async()=>{
 const status=$('#publish-status'),btn=$('#publish-github');
 if(!session.publishEnabled){status.textContent='النشر مقفل حتى اكتمال الاختبار والموافقة';return;}
 if(!confirm(session.production?'نشر المسودة على الموقع الرسمي؟':'حفظ النسخة على فرع الاختبار؟ الموقع الرسمي لن يتغيّر.'))return;
 btn.disabled=true;status.textContent='جارٍ التحقق وحفظ نسخة موحّدة…';
 try{
  const r=await fetch('/api/publish',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-2SEE-Admin':'1'},body:JSON.stringify({content:data,baseRevision})});
  const out=await r.json();if(!r.ok)throw Error(out.error||'تعذّر النشر');
  data=out.content;baseRevision=out.revision;save();
  status.textContent=(out.production?'تم حفظ التعديلات في GitHub؛ ظهورها على الموقع ينتظر نجاح GitHub Pages.':'تم النشر على فرع الاختبار فقط؛ الموقع الرسمي لم يتغيّر.')+' · '+out.commit.slice(0,8);
 }catch(error){status.textContent='لم يتم تأكيد النشر: '+error.message;}
 finally{btn.disabled=!session.publishEnabled;}
});
selectPages('#page-select');selectPages('#section-page');selectPages('#preview-page');selectPages('#visual-page');$('#page-select').value=page;$('#section-page').value=page;$('#preview-page').value=page;$('#visual-page').value=page;render();
})();
