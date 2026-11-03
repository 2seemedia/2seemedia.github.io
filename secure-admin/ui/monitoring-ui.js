(()=>{'use strict';
const $=id=>document.getElementById(id);
const msg=$('monitoring-message'),rows=$('monitoring-rows'),form=$('monitoring-form');
const setMessage=t=>{msg.textContent=t;};
const request=async(path,method='GET',body)=>{
 const response=await fetch(path,{method,credentials:'same-origin',headers:method==='POST'?{'Content-Type':'application/json','X-2SEE-Admin':'1'}:{},body:body?JSON.stringify(body):undefined});
 const data=await response.json().catch(()=>({error:'تعذر قراءة استجابة الخادم'}));
 if(!response.ok)throw Error(data.error||'تعذر الاتصال');
 return data;
};
const cell=(tr,text)=>{const td=document.createElement('td');td.textContent=text;tr.append(td);return td;};
async function load(){
 try{
  const data=await request('/api/operations/publications');
  rows.replaceChildren();
  for(const item of data.items){
   const tr=document.createElement('tr');
   cell(tr,item.client_name);cell(tr,item.content_title);
   cell(tr,new Date(item.scheduled_at).toLocaleString('ar-SY'));
   cell(tr,item.status==='published'?'تم النشر (تسجيل يدوي)':item.status==='cancelled'?'ملغى':item.verification_status==='confirmed'?'مؤكد عبر المنصة':'مجدول / غير مؤكد');
   const td=cell(tr,'');
   if(item.status==='scheduled'){
    for(const [status,label] of [['published','تسجيل النشر'],['cancelled','إلغاء']]){
     const button=document.createElement('button');button.type='button';button.textContent=label;
     button.addEventListener('click',async()=>{button.disabled=true;try{await request('/api/operations/publication-status','POST',{id:item.id,status});await load();}catch(e){setMessage(e.message);button.disabled=false;}});
     td.append(button,' ');
    }
   }
   rows.append(tr);
  }
  setMessage('متصل بقاعدة البيانات · '+data.items.length+' منشور مسجل. تحقق إنستغرام المباشر غير مفعّل بعد.');
  form.querySelector('button').disabled=false;
 }catch(e){
  setMessage('ميزة الجدولة المركزية غير مفعلة بعد: '+e.message);
  form.querySelector('button').disabled=true;
 }
}
form.addEventListener('submit',async e=>{
 e.preventDefault();const f=new FormData(form);
 const local=String(f.get('scheduled_local')||'');
 const date=new Date(local);
 if(!local||!Number.isFinite(date.getTime()))return setMessage('حددي تاريخاً ووقتاً صحيحين');
 const button=form.querySelector('button');button.disabled=true;
 try{
  await request('/api/operations/publications','POST',{client_name:String(f.get('client_name')),content_title:String(f.get('content_title')),platform:String(f.get('platform')),scheduled_at:date.toISOString()});
  form.reset();await load();
 }catch(err){setMessage(err.message);}finally{button.disabled=false;}
});
$('monitoring-refresh').addEventListener('click',load);
load();
})();
