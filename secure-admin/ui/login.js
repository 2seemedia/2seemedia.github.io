'use strict';
document.querySelector('#login-form').addEventListener('submit',async event=>{
 event.preventDefault();const button=document.querySelector('#submit'),status=document.querySelector('#status');button.disabled=true;status.textContent='جارٍ تسجيل الدخول…';
 try{
  const response=await fetch('/api/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-2SEE-Admin':'1'},body:JSON.stringify({username:document.querySelector('#username').value,password:document.querySelector('#password').value})});
  const result=await response.json();document.querySelector('#password').value='';
  if(!response.ok)throw Error(result.error||'تعذّر تسجيل الدخول');location.replace('/');
 }catch(error){status.textContent=error.message;}finally{button.disabled=false;}
});
