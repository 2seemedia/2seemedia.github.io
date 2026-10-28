## V12 — Actual collaboration logos (preview only)
- Added 14 supplied transparent brand logos after cropping whitespace, retaining original designs.
- Enabled marquee on index and work by populating real logo data.
- Silver gradient section, balanced light/dark uniform cards, shadow and continuous animation.
- Maintains local dashboard controls. Not deployed to GitHub Pages.

# V11 — شريط التعاون

- استبدال شريط الخدمات الأسود في الصفحة الرئيسية بشريط شعارات الجهات والأشخاص الذين تعاونّا معهم، أسفل قسم الأعمال.
- عرض الشريط كذلك أسفل معرض الأعمال في صفحة «أعمالنا».
- عنوان محايد «من تعاونّا معهم» لا يفترض استمرار العلاقة أو وجود عقد.
- شعارات متساوية المساحة، محافظة على النسب الأصلية، مع ظل خفيف وحركة أفقية مستمرة.
- إضافة إدارة الشعارات إلى لوحة التحكم: رفع PNG/JPG/WebP، إضافة/حذف/ترتيب، الاسم والرابط، سرعة الحركة، عنوان عربي/إنجليزي.
- لا تظهر أي شعارات افتراضية على الموقع العام: المعاينة وحدها تعرض خانات توضيحية مرقمة حتى تضاف الشعارات الحقيقية.
- لم تُنشر النسخة V11 على الموقع الرسمي.

## V9 — مراجعة لغوية وتنسيق العناوين

- عنوان أعمالنا «شغلنا بيحكي عنّا» بسطر واحد
- عنوان خدماتنا «تصوير، مونتاج ومحتوى» بسطر واحد
- تصحيح «إي، منشتغل» ومراجعة النصوص العربية في جميع الصفحات
- توحيد العناوين القصيرة وإزالة النقاط الزائدة منها
- تصحيح إرشادات النشر في لوحة التحكم
- نسخة معاينة فقط، من دون نشر على الموقع الرسمي

# Changelog

All notable changes to the Agency template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.6] - 2026-10-26

### Fixed

- Placeholder email addresses in forms now use the reserved `.example` domain instead of a real-looking `.com` one.

## [1.1.5] - 2026-10-23

### Fixed

- The project brief and job application confirmations no longer say "(demo)" or that nothing was sent. They
  now confirm the enquiry or application, show a reference (like NS-7K2Q) and say what happens next, using the
  reply times the pages already promise (two working days for enquiries, ten for applications). `DOCS.md`
  describes the reference.

## [1.1.4] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.1.3] - 2026-10-08

### Fixed

- Mobile menu: the link numbers (01, 02...) are decorative (`aria-hidden`), so the links are named
  "Work", "Services"... instead of "Work01", "Services02"...

## [1.1.2] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

## [1.1.1] - 2026-10-06

### Fixed

- Raised low-contrast text to meet WCAG AA (axe colour-contrast checks now pass in light and dark).

## [1.1.0] - 2026-10-05

### Added

- "Back to top" button on every page. It fades in after you scroll about one screen,
  returns to the top (instantly for visitors who prefer reduced motion), moves keyboard
  focus to the main content, lifts itself above toast messages, steps aside while an in-page
  "Back to top" link is on screen and is hidden when printing.
  It is styled to match the template.
- `data-back-to-top-avoid` (lift the button above an element) and `data-back-to-top-hide`
  (hide the button while it would cover a sticky or fixed element) to keep it clear of your own UI.
- This changelog and a `version` field in `template.json`.

### Fixed

- Social sharing image is now a 1200×630 PNG (`assets/img/og-image.png`); most social sites don't display SVG. The SVG stays as the editable source.

## [1.0.0] - 2026-10-04

### Added

- Initial release with 8 pages: Home, Services, Work, Case study, About, Careers, Contact, 404.
- Line-by-line headline reveal, rotating word and an infinite services marquee
- Accessible testimonial carousel with pause, arrow keys and screen-reader announcements
- Work page filter by industry with live counts and shareable links (work.html#fintech)
- Case study with a keyboard-accessible before/after comparison slider
- Careers page with team filter, expandable role details and an application form
- Project-brief form with service tiles, budget slider and inline validation
- Count-up statistics and live local times for each studio
- Full-screen accessible mobile menu, skip link and scroll-reveal animations
- Original SVG case-study artwork and illustrated team portraits
- SEO and Open Graph tags, SVG favicon and social image on every page

## V10 — Arabic copy review
- Standard written Arabic throughout all public pages and editable CMS entries.
- Founder section uses «المؤسسون», studio label uses «استيديو», and the about title uses «نحن».
- All application, CV, FAQ and form handoff messages revised; approved brand slogan retained.
- New draft key prevents older V9 copy from replacing corrected text.
- No live deployment.

## V13 — Clear PNG logo ticker
- Removed all cards, frames, tile borders and tile shadows from collaboration logos.
- Preserved PNG transparency, applied silhouette-only drop-shadow, equal logo slots, silver backdrop, continuous animation and dashboard.
- Preview only; do not deploy to the live website before approval.

## V14 — Transparent partner PNGs and founder heading
- Replaced graphic background spans with actual PNG image elements for silhouette-only shadow; no logo borders, cards or panels.
- Changed founder section headings on Home and About in both Arabic and English to clearly identify 2See Media founders.
- Preserved silver animated logo strip, original site and dashboard. Preview only, not deployed.
