// Assembles the static pages: src/pages/*.html bodies + shared head/header/footer -> /*.html
// Run from the repo root:  node src/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://keenanfrench.github.io/maplewood-renovations-site/';
const PHONE = '03 9000 0000';
const PHONE_HREF = '+61390000000';
const EMAIL = 'hello@maplewoodrenovations.com.au';

const pages = [
  { file: 'index.html', nav: 'home', title: 'Kitchen & Bathroom Renovations Melbourne | Maplewood Renovations',
    desc: 'Kitchen and bathroom renovations across Melbourne’s inner east, from Hawthorn to Doncaster. Fixed-price quotes, one project manager, 10-year workmanship warranty.' },
  { file: 'kitchens.html', nav: 'kitchens', title: 'Kitchen Renovations Melbourne | Maplewood Renovations',
    desc: 'Custom kitchen renovations in Melbourne’s inner east: design, joinery, stone, plumbing and electrical under one fixed-price contract. Kitchens from $32k.' },
  { file: 'bathrooms.html', nav: 'bathrooms', title: 'Bathroom Renovations Melbourne | Maplewood Renovations',
    desc: 'Full bathroom and ensuite renovations in Melbourne’s inner east. Waterproofing to AS 3740, licensed trades, typical 3–4 week build. Bathrooms from $26k.' },
  { file: 'projects.html', nav: 'projects', title: 'Our Projects | Maplewood Renovations',
    desc: 'Recent kitchen and bathroom renovations by Maplewood Renovations across Hawthorn, Kew, Balwyn, Doncaster and Melbourne’s inner east.' },
  { file: 'about.html', nav: 'about', title: 'About Us | Maplewood Renovations',
    desc: 'A small, owner-led renovation team in Melbourne’s inner east. Registered builders, in-house carpenters and one project manager from first visit to handover.' },
  { file: 'contact.html', nav: 'contact', title: 'Book a Free Design Consult | Maplewood Renovations',
    desc: 'Book a free in-home design consultation for your kitchen or bathroom renovation in Melbourne’s inner east. We reply within one business day.' },
];

const navItems = [
  ['home', 'index.html', 'Home'],
  ['kitchens', 'kitchens.html', 'Kitchens'],
  ['bathrooms', 'bathrooms.html', 'Bathrooms'],
  ['projects', 'projects.html', 'Projects'],
  ['about', 'about.html', 'About'],
];

const logo = `<svg class="logo-mark" viewBox="0 0 40 40" aria-hidden="true">
  <rect x="1" y="1" width="38" height="38" rx="3" fill="#4B5E45"/>
  <path d="M20 8c-5 6-8 10-8 15a8 8 0 0 0 16 0c0-5-3-9-8-15z" fill="none" stroke="#EDE7DD" stroke-width="1.6"/>
  <path d="M20 14v19M20 21l-4-3M20 25l4-3" stroke="#EDE7DD" stroke-width="1.6" fill="none" stroke-linecap="round"/>
</svg>`;

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  name: 'Maplewood Renovations',
  url: SITE,
  telephone: PHONE,
  email: EMAIL,
  priceRange: '$$$',
  areaServed: ['Hawthorn', 'Kew', 'Camberwell', 'Balwyn', 'Balwyn North', 'Box Hill', 'Doncaster', 'Templestowe', 'Surrey Hills', 'Canterbury', 'Mont Albert'],
  address: { '@type': 'PostalAddress', addressLocality: 'Kew', addressRegion: 'VIC', addressCountry: 'AU' },
  openingHours: 'Mo-Fr 07:30-17:00',
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '186' },
};

function head(p, extraHead) {
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.title}</title>
<meta name="description" content="${p.desc}">
<link rel="canonical" href="${SITE}${p.file === 'index.html' ? '' : p.file}">
<meta property="og:type" content="website">
<meta property="og:title" content="${p.title}">
<meta property="og:description" content="${p.desc}">
<meta property="og:image" content="https://images.unsplash.com/photo-1682888818696-906287d759f5?auto=format&fit=crop&w=1200&h=630&q=75">
<meta name="theme-color" content="#4B5E45">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(logo.replace('class="logo-mark" ', 'xmlns="http://www.w3.org/2000/svg" '))}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link href="https://fonts.googleapis.com/css2?family=Karla:wght@400;500;700&family=Libre+Baskerville:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/styles.css">
<script type="application/ld+json">${JSON.stringify(orgSchema)}</script>
${extraHead}</head>
<body>`;
}

function header(active) {
  const links = navItems.map(([key, href, label]) =>
    `<a href="${href}"${key === active ? ' aria-current="page"' : ''}>${label}</a>`).join('\n      ');
  return `
<div class="topbar">
  <div class="wrap">
    <span class="hide-xs">Kitchen &amp; bathroom renovations · Hawthorn to Doncaster</span>
    <span><span class="hide-sm">Mon–Fri 7:30am–5pm · </span><a href="tel:${PHONE_HREF}">${PHONE}</a></span>
  </div>
</div>
<header class="site-header">
  <div class="wrap">
    <a class="logo" href="index.html" aria-label="Maplewood Renovations home">
      ${logo}
      <span class="logo-text">Maplewood<small>Renovations</small></span>
    </a>
    <button class="menu-toggle" aria-label="Menu" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span></button>
    <nav class="nav" id="site-nav" aria-label="Main">
      ${links}
      <a class="btn btn-primary" href="contact.html"${active === 'contact' ? ' aria-current="page"' : ''}>Book a consult</a>
    </nav>
  </div>
</header>
<main>`;
}

const footer = `
</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="logo" href="index.html">${logo}<span class="logo-text">Maplewood<small>Renovations</small></span></a>
        <p class="footer-blurb">Kitchens and bathrooms, designed and built by one small team across Melbourne’s inner east since 2009.</p>
      </div>
      <div>
        <h4>Renovations</h4>
        <ul>
          <li><a href="kitchens.html">Kitchens</a></li>
          <li><a href="bathrooms.html">Bathrooms &amp; ensuites</a></li>
          <li><a href="projects.html">Recent projects</a></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="about.html">About us</a></li>
          <li><a href="about.html#process">Our process</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4>Get in touch</h4>
        <ul>
          <li><a href="tel:${PHONE_HREF}">${PHONE}</a></li>
          <li><a href="mailto:${EMAIL}">${EMAIL.replace('@', '@<wbr>')}</a></li>
          <li>Showroom by appointment, Kew VIC</li>
        </ul>
      </div>
    </div>
    <div class="footer-base">
      <span>© <span data-year>2026</span> Maplewood Renovations · Registered Building Practitioner DB-U 00000</span>
      <span class="concept-note">Portfolio concept: a fictional business. Website design &amp; build by <a href="https://onyxstudios.com.au/">Onyx Studios</a>.</span>
    </div>
  </div>
</footer>
<script src="assets/main.js" defer></script>
`;

for (const p of pages) {
  let body = readFileSync(new URL(`./pages/${p.file}`, import.meta.url), 'utf8');
  // Optional <!--HEAD ... HEAD--> block in a page body is lifted into <head>
  let extraHead = '';
  body = body.replace(/<!--HEAD([\s\S]*?)HEAD-->\s*/, (_, h) => { extraHead = h.trim() + '\n'; return ''; });
  // Optional <!--SCRIPTS ... SCRIPTS--> block goes before </body>
  let scripts = '';
  body = body.replace(/<!--SCRIPTS([\s\S]*?)SCRIPTS-->\s*/, (_, s) => { scripts = s.trim() + '\n'; return ''; });
  body = body.replaceAll('{{PHONE}}', PHONE).replaceAll('{{PHONE_HREF}}', PHONE_HREF).replaceAll('{{EMAIL}}', EMAIL);
  const html = head(p, extraHead) + header(p.nav) + '\n' + body.trim() + '\n' + footer + scripts + '</body>\n</html>\n';
  writeFileSync(new URL(`../${p.file}`, import.meta.url), html);
  console.log('built', p.file);
}
