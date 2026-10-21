export type FieldStates = Record<string, 'hidden' | 'deleted'>;
export const homeFieldTargets: Record<string, string> = {
  aboutNav: '.navlinks a[data-nav-link="about"]', servicesNav: '.navlinks a[data-nav-link="services"]',
  workNav: '.navlinks a[href="/work"]', processNav: '.navlinks a[data-nav-link="process"]',
  whyNav: '.navlinks a[data-nav-link="why"]', contactNav: '.navlinks a[data-nav-link="contact"]', startNav: '.nav-cta',
  heroEyebrow: '.hero .eyebrow', heroTitle: '.hero h1', heroText: '.hero > div:first-child > p',
  heroWhatsapp: '.hero-actions a:nth-of-type(1)', heroServices: '.hero-actions .legacy-services-button', heroWork: '.hero-actions a:nth-of-type(2)',
  topWorkTitle: '#topWorkSpotlight h2', homeWorkKicker: '#topWorkSpotlight .home-work-kicker', homeWorkText: '#topWorkSpotlight .home-work-intro', homeWorkButton: '#topWorkSpotlight .home-work-all', bottomWorkTitle: '#bottomWorkSpotlight',
  aboutKicker: '#about .kicker', aboutTitle: '#about .section-head h2', aboutLead: '#about .section-head > p',
  aboutMainTitle: '#about .about-main h3', aboutMainText: '#about .about-main p',
  servicesKicker: '#services .kicker', servicesTitle: '#services .section-head h2', servicesLead: '#services .section-head > p',
  processKicker: '#process .kicker', processTitle: '#process .section-head h2', processLead: '#process .section-head > p',
  whyKicker: '#why .kicker', whyGiant: '#why .giant', whyLead: '#why .why-visual > p',
  ctaKicker: '.cta-box .kicker', ctaTitle: '.cta-box h2', ctaText: '.cta-box p', ctaButton: '.cta-box .btn',
  contactKicker: '#contact .kicker', contactTitle: '#contact .section-head h2', contactLead: '#contact .section-head > p',
  contactInfo: '#contact .contact-main h3', contactInfoText: '#contact .contact-main > p',
  whatsappStrong: '#contact .contact-link[href*="wa.me"] strong', followTitle: '#contact .social-panel h3', followText: '#contact .social-panel p',
  phoneLabel: '#contact .contact-link[href^="tel:"] small', emailLabel: '#contact .contact-link[href^="mailto:"] small',
  whatsappLabel: '#contact .contact-link[href*="wa.me"] small', footer: '.footer span:first-child',
};
for(const key of ['foundersKicker','foundersTitle','foundersLead'])homeFieldTargets[key]='[data-text-id="translations:'+key+'"]';
homeFieldTargets['quoteOpen']='[data-text-id="translations:quoteOpen"]';
homeFieldTargets['quoteTitle']='[data-text-id="translations:quoteTitle"]';
homeFieldTargets['quoteLead']='[data-text-id="translations:quoteLead"]';
homeFieldTargets['quoteNameLabel']='[data-text-id="translations:quoteNameLabel"]';
homeFieldTargets['quoteProjectLabel']='[data-text-id="translations:quoteProjectLabel"]';
homeFieldTargets['quoteServiceLabel']='[data-text-id="translations:quoteServiceLabel"]';
homeFieldTargets['quoteBudgetLabel']='[data-text-id="translations:quoteBudgetLabel"]';
homeFieldTargets['quoteDescriptionLabel']='[data-text-id="translations:quoteDescriptionLabel"]';
homeFieldTargets['quoteSend']='[data-text-id="translations:quoteSend"]';
homeFieldTargets['quoteNotice']='[data-text-id="translations:quoteNotice"]';
homeFieldTargets['quoteDirect']='[data-text-id="translations:quoteDirect"]';
export const settingFieldTargets: Record<string, string> = {
  brandName: '.brand-copy strong,.hero h1 small', slogan: '.signature,.brand-copy span,.footer span:last-child',
  phone: 'a[href^="tel:"]', phoneDisplay: 'a[href^="tel:"]', email: 'a[href^="mailto:"]',
  whatsapp: 'a[href*="wa.me/"]', instagram: 'a[href*="instagram.com/"]', facebook: 'a[href*="facebook.com/"]', youtube: 'a[href*="youtube.com/"]',
};
export const repeatTargets: Record<string, string> = {
  about: '#about .about-chip', services: '#services .service', process: '#process .step', why: '#why .why-item',
};
export const portfolioBlockFields:Record<string,string[]>={header:['homeNav','servicesNav','workNav','contactNav'],intro:['introEyebrow','titleFirst','titleAccent','introText','explore'],collection:['collection','reel','design','project','all','search','showMore'],contact:['ctaKicker','ctaTitle','ctaText','ctaButton'],footer:[]};
export const portfolioBlockNames:Record<string,[string,string]>={header:['أعلى الصفحة','Page header'],intro:['عنوان ومقدمة الأعمال','Portfolio intro'],collection:['معرض الأعمال','Work gallery'],contact:['دعوة التواصل','Contact invitation'],footer:['تذييل الصفحة','Page footer']};
