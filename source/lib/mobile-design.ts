import {logoIsVisible,type SiteDesign} from './design';
const margin=(position:string)=>position==='left'?'margin-left:0!important;margin-right:auto!important':position==='right'?'margin-left:auto!important;margin-right:0!important':'margin-left:auto!important;margin-right:auto!important';
export function mobileDesignCss(d:SiteDesign,scope=''){
 const m=d.mobile,p=(s:string)=>(scope?scope+' ':'')+s,h=m.logo.header;
 let css=`@media(max-width:760px){
 ${p('.topbar')},${p('.site-header')}{position:${m.headerSticky?'sticky':'relative'}!important;top:0!important;z-index:1000;background:var(--bg,#f7f5f1)!important}
 ${p('.brand-logo-wrap:not([hidden])')}{display:${h.visible?'grid':'none'}!important;width:${h.width}px!important;height:${h.width}px!important;flex-shrink:0}
 ${p('.brand-logo-wrap img')},${p('.site-header .brand>img:not([hidden])')},${p('.intro-aside>img:not([hidden])')}{display:${h.visible?'block':'none'}!important;width:${h.width}px!important;height:${h.width}px!important;object-fit:contain!important}
 ${p('.nav')},${p('.header-inner')}{height:82px;min-height:82px;flex-wrap:nowrap;justify-content:space-between!important;gap:12px;padding-block:0;direction:${h.position==='auto'?'inherit':'ltr'}!important;flex-direction:${h.position==='right'?'row-reverse':'row'}!important}
 ${p('.topbar .brand')},${p('.site-header .brand')}{flex-basis:auto;justify-content:flex-start;padding-inline:0}
 ${p('.menu-btn')}{position:static}
 ${h.position==='center'?`${p('.nav')},${p('.header-inner')}{position:relative}${p('.topbar .brand')},${p('.site-header .brand')}{position:absolute;left:50%;transform:translateX(-50%);max-width:calc(100% - 110px);justify-content:center}`:''}
 }`;
 if(scope)return css;
 const showHero=logoIsVisible(d,'hero','mobile'),contactShown=logoIsVisible(d,'contact','mobile');
 css+=`@media(max-width:760px){
 html[dir] .hero>.hero-visual:not([hidden]){display:${showHero?'flex':'none'}!important}
 html[dir] .hero{grid-template-columns:${showHero?'minmax(0,.8fr) minmax(0,1.2fr)':'minmax(0,1fr)'}!important;grid-template-areas:${showHero?'"visual copy"':'"copy"'};gap:${showHero?'14px':'0'};padding-top:32px!important;padding-bottom:44px!important}
 html[dir] .hero>div:first-child{width:100%;min-width:0}
 html[dir] .hero h1{font-size:var(--hero-mobile-title-size,${showHero?'clamp(22px,6.2vw,30px)':'clamp(36px,10vw,46px)'})!important;line-height:1.4!important}
 html[dir] .hero>div:first-child>p{font-size:var(--hero-mobile-copy-size,${showHero?'14px':'16px'})!important;line-height:1.95!important;margin-block:20px 24px}
 .hero .logo-stage{width:min(${m.logo.hero.width}px,100%)!important;${margin(m.logo.hero.position)}}
 .hero .eyebrow{font-size:10px;padding:8px 10px}
 .hero-actions{gap:10px!important}
 .hero-actions .btn{min-height:48px;font-size:14px;padding:12px 16px!important}
 ${m.contactLayout==='stacked'?`  #contact .contact-grid{display:grid;direction:ltr;grid-template-columns:minmax(0,1fr)!important;grid-template-areas:${contactShown?'"logo" "info" "social"':'"info" "social"'};gap:22px;padding:24px 18px;border:1px solid #dedad6;border-radius:24px;background:var(--panel,#fff);box-shadow:none;align-items:start}
  #contact .contact-main:not([hidden]){grid-area:info;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;min-width:0;border-radius:0!important}
  #contact .contact-main h3{font-size:19px;line-height:1.6;text-align:center;margin:0 0 16px}
  #contact .contact-links{display:grid;grid-template-columns:minmax(0,1fr);gap:10px}
  #contact .contact-link{padding:13px 12px;min-height:68px;gap:12px;border-radius:14px!important;box-shadow:none!important;background:var(--bg,#f7f5f1)!important}
  #contact .contact-main-info{gap:12px;min-width:0}
  #contact .contact-icon{flex:0 0 36px;width:36px;height:36px;border-radius:11px}
  #contact .contact-icon svg{width:19px;height:19px}
  #contact .contact-link small{font-size:10px;line-height:1.5;letter-spacing:1px}
  #contact .contact-link strong{font-size:14px;line-height:1.7;overflow-wrap:anywhere}
  #contact .contact-link .arrow{display:block;font-size:19px;flex-shrink:0;color:var(--gold,#801c2b)}
  #contact .social-panel:not([hidden]){display:contents!important;opacity:1!important;transform:none!important;filter:none!important}
  #contact .social-panel-logo{grid-area:logo;justify-self:${m.logo.contact.position==='left'?'start':m.logo.contact.position==='right'?'end':'center'};align-self:center;width:${m.logo.contact.width}px!important;max-width:100%;height:auto!important;object-fit:contain;${margin(m.logo.contact.position)}animation:none!important}
  #contact .social-panel>div{grid-area:social;min-width:0;width:100%;text-align:center!important;direction:ltr}
  #contact .social-panel h3{font-size:15px;line-height:1.7;text-align:center;margin:0 0 12px}
  #contact .social-buttons{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:0}
  #contact .social-buttons a{display:flex;align-items:center;justify-content:center;font-size:11px;font-family:Arial,sans-serif;min-height:44px;padding:10px 5px;border-radius:12px!important;letter-spacing:0;min-width:0}
  #contact .contact-grid:has(>.social-panel[hidden]){grid-template-areas:"info"}
  #contact .contact-grid:has(>.contact-main[hidden]){grid-template-areas:"logo" "social"}`:''}
 #contact .social-panel-logo:not([hidden]){display:${contactShown?'block':'none'}!important;width:min(${m.logo.contact.width}px,100%)!important;height:auto!important;${margin(m.logo.contact.position)}}
 }`;
 return css;
}
