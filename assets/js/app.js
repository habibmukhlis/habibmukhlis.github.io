// Small utilities and interactions
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Theme persistence
const themeKey = 'theme-preference';
const reduceKey = 'reduce-motion';
const langKey = 'lang-preference';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(theme) {
  const html = document.documentElement;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark.matches);
  html.classList.toggle('dark', isDark);
  const brand = getComputedStyle(html).getPropertyValue('--brand');
  const [h, s, l] = brand.split(/\s+/);
  $('#theme-color-meta')?.setAttribute('content', `hsl(${h} ${s} ${l})`);
}

function getTheme() {
  return localStorage.getItem(themeKey) || 'system';
}

function setTheme(theme) {
  localStorage.setItem(themeKey, theme);
  applyTheme(theme);
}

// Initial theme
applyTheme(getTheme());
prefersDark.addEventListener('change', () => applyTheme(getTheme()));

// Theme toggle
$('#themeToggle')?.addEventListener('click', () => {
  const isDark = document.documentElement.classList.contains('dark');
  setTheme(isDark ? 'light' : 'dark');
});

// Reduce motion toggle
const reduceMotionToggle = $('#reduceMotionToggle');
if (reduceMotionToggle) {
  const saved = localStorage.getItem(reduceKey) === 'true';
  reduceMotionToggle.checked = saved;
  document.documentElement.classList.toggle('reduce-motion', saved);
  reduceMotionToggle.addEventListener('change', (e) => {
    const checked = e.currentTarget.checked;
    localStorage.setItem(reduceKey, String(checked));
    document.documentElement.classList.toggle('reduce-motion', checked);
  });
}

// Mobile nav
function closeMobileNav() {
  const menu = $('#nav-menu');
  const toggle = $('#navToggle');
  menu?.classList.remove('is-open');
  toggle?.setAttribute('aria-expanded', 'false');
}

$('#navToggle')?.addEventListener('click', () => {
  const menu = $('#nav-menu');
  const open = menu.classList.toggle('is-open');
  $('#navToggle').setAttribute('aria-expanded', String(open));
});
$$('#nav-menu a').forEach((a) => a.addEventListener('click', closeMobileNav));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileNav();
});
document.addEventListener('click', (e) => {
  const nav = $('.nav');
  if (nav && !nav.contains(e.target)) closeMobileNav();
});

// Scroll reveal
const revealEls = $$('[data-reveal]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  }, { threshold: 0.15 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// Project category filtering
$$('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.filter-btn').forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    const filter = btn.getAttribute('data-filter');
    $$('.project').forEach((card) => {
      const cat = card.getAttribute('data-category');
      const matches = (filter === 'all' || cat === filter);
      card.style.display = matches ? '' : 'none';
    });
  });
});

// Year
$('#year').textContent = String(new Date().getFullYear());

// ---- Floating AI Assistant Widget ----
function initChatbotWidget() {
  if (document.getElementById('alhaq-chatbot-launcher')) return;

  const btn = document.createElement('button');
  btn.id = 'alhaq-chatbot-launcher';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Open Al-Haq Assistant');
  btn.setAttribute('aria-expanded', 'false');
  const ICON_CHAT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  const ICON_CLOSE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  btn.innerHTML = ICON_CHAT;

  const tip = document.createElement('div');
  tip.id = 'alhaq-chatbot-tip';
  tip.textContent = 'Ask the Al-Haq Assistant';

  const panel = document.createElement('div');
  panel.id = 'alhaq-chatbot-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Al-Haq AI Assistant');
  panel.innerHTML = `
    <div id="alhaq-chatbot-header">
      <div class="alhaq-avatar" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
      <div class="alhaq-meta">
        <span class="alhaq-title">Al-Haq Assistant</span>
        <span class="alhaq-sub">Online &middot; AI Assistant</span>
      </div>
      <div class="alhaq-actions">
        <button type="button" id="alhaq-chatbot-expand" aria-label="Expand or shrink chatbot" title="Expand">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
        </button>
        <button type="button" id="alhaq-chatbot-close" aria-label="Close chatbot" title="Close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div id="alhaq-chatbot-body">
      <iframe
        id="alhaq-chat-iframe"
        data-src="https://alhaq-hf-alhaq-website-chatbot.hf.space/?context=portfolio"
        src="about:blank"
        title="Al-Haq AI Assistant"
        loading="lazy"
        referrerpolicy="no-referrer"
        allow="clipboard-write"></iframe>
    </div>
    <div id="alhaq-chatbot-footer">
      <span>Developed by Al-Haq Studio</span>
      <a href="#contact">Need direct contact?</a>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(tip);
  document.body.appendChild(panel);

  const expandBtn = panel.querySelector('#alhaq-chatbot-expand');
  const closeBtn = panel.querySelector('#alhaq-chatbot-close');
  const iframe = panel.querySelector('#alhaq-chat-iframe');

  function openAssistant() {
    panel.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close Al-Haq Assistant');
    btn.innerHTML = ICON_CLOSE;
    if (iframe.getAttribute('src') === 'about:blank') {
      iframe.setAttribute('src', iframe.getAttribute('data-src'));
    }
  }

  function closeAssistant() {
    panel.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open Al-Haq Assistant');
    btn.innerHTML = ICON_CHAT;
  }

  btn.addEventListener('click', () => {
    if (panel.classList.contains('open')) closeAssistant();
    else openAssistant();
  });

  closeBtn?.addEventListener('click', closeAssistant);

  expandBtn?.addEventListener('click', () => {
    panel.classList.toggle('expanded');
    expandBtn.setAttribute('title', panel.classList.contains('expanded') ? 'Shrink' : 'Expand');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closeAssistant();
  });

  // Wire up nav links and in-page buttons
  $$('a[href="#assistant"]').forEach((a) => {
    a.addEventListener('click', () => {
      openAssistant();
    });
  });

  const promptBtn = document.getElementById('openAssistantPromptBtn');
  promptBtn?.addEventListener('click', openAssistant);

  window.openAlhaqAssistant = openAssistant;
  window.closeAlhaqAssistant = closeAssistant;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatbotWidget);
} else {
  initChatbotWidget();
}

// ---- i18n ----
const dict = {
  en: {
    skip: 'Skip to content',
    nav: {
      about: 'About',
      ventures: 'Ventures',
      projects: 'Products',
      services: 'Services',
      architecture: 'Architecture',
      experience: 'Experience',
      assistant: 'Assistant',
      sponsor: 'Sponsor',
      contact: 'Contact'
    },
    hero: {
      hello: 'Founder & Principal Systems Architect',
      lead: 'Lead Architect behind <strong>Al-Haq Studio</strong> and the <strong>Al-Haq Initiative</strong>. Engineering sovereign on-device privacy guardians, photorealistic 3D spatial simulations, compiler toolchains, and community Islamic digital welfare tools.',
      ctaProjects: 'Explore Products',
      ctaServices: 'Client Solutions',
      ctaContact: 'Contact Me',
      ctaEmail: 'Direct Email',
      ctaFiverr: 'Hire me on Fiverr',
      meta1: 'Android · Web · Desktop · Extensions',
      meta2: 'Local-first'
    },
    kpi: {
      projects: 'Projects & Tools',
      privacy: 'On-Device Privacy',
      platforms: 'Primary OS Targets',
      crypto: 'NIST Cryptography'
    },
    section: {
      about: { title: 'About & Core Philosophy' },
      experience: { title: 'Engineering Experience & Releases' },
      projects: { title: 'Featured Products & Future Ventures' },
      contact: { title: 'Contact & Inquiries' }
    },
    about: {
      intro: 'I am an independent systems engineer, software architect, and historical researcher. I operate two complementary initiatives designed to advance digital sovereignty, ethical wellness, and open community tools:',
      li1: '<strong>Local-First Systems:</strong> On-device network packet inspection, local vision AI, and Zero-Telemetry enforcement across Android, WebExtensions, and Desktop.',
      li2: '<strong>Photorealistic Simulation:</strong> Three.js r185 3D WebGL experiences with spatial procedural Web Audio and zero-width steganographic authorship provenance.',
      li3: '<strong>Language & Compiler Design:</strong> Custom bytecode compilers, lexical analyzers, and Rust runtimes designed for expressive natural syntax.',
      li4: '<strong>Community Digital Welfare:</strong> Uncompromisingly free Islamic productivity companions, speech feedback engines, and verified primary-source historical treatises.',
      outro: 'All codebases balance rigorous mathematical architecture (NIST P-256 ECDSA offline verification, PostgreSQL RLS security) with warm, distraction-free user experiences.'
    },
    ventures: {
      eyebrow: 'Two Core Pillars',
      title: 'Commercial Studio & Community Mission',
      lead: 'Bridging professional software engineering with independent community-focused digital welfare.',
      studioSubtitle: 'Commercial Software Engineering • UK Sole Trader',
      studioDesc: 'The commercial engineering and development studio. Engineers production Android applications, no-root local firewalls, 3D spatial simulations, and zero-knowledge cryptographic systems. Authors, maintains, and licenses sovereign software.',
      initiativeSubtitle: 'Community Digital Welfare • Personal Mission',
      initiativeDesc: 'A personal digital mission providing 100% free spiritual productivity tools, primary-source archival research, and Islamic educational platforms. Supported voluntarily and operated under the founder\'s sole proprietorship.'
    },
    projects: {
      eyebrow: 'Comprehensive Portfolio',
      lead: 'Production releases, open-source community utilities, compiler architectures, and next-generation R&D pipelines.'
    },
    services: {
      eyebrow: 'Professional Engagements',
      title: 'Commercial Services & Client Solutions',
      lead: 'High-integrity engineering services delivered under <strong>Al-Haq Studio</strong> (UK sole trader). Custom architecture, security audits, and production software.',
      ctaConsult: 'Inquire About An Engagement'
    },
    arch: {
      eyebrow: 'Technical Mastery',
      title: 'Systems Architecture & Engineering Stack',
      lead: 'A comprehensive overview of programming languages, system runtimes, graphics frameworks, and security layers employed across production software.'
    },
    exp: {
      eyebrow: 'Engineering Milestones',
      lead: 'Key product releases, open-source milestones, and architecture deployments.'
    },
    exp6: {
      title: 'AmniGuard Firewall & NetBlock • Al-Haq Studio',
      date: '2026',
      b1: 'Engineered high-performance Android VpnService firewall processing 100% of network packets on-device with zero cloud telemetry.',
      b2: 'Built an 80,000+ domain adult content sinkhole with Port 853 DoT enforcement and live PCAP Wireshark packet capture.',
      b3: 'Published open-source release under GNU GPLv3 with offline NIST P-256 ECDSA cryptographic verification.'
    },
    exp7: {
      title: 'Platen: 3D Typewriter • Al-Haq Studio',
      date: '2026',
      b1: 'Developed photorealistic 3D mechanical typewriter simulator in Three.js r185 with procedural spatial Web Audio sound synthesis.',
      b2: 'Implemented 60 FPS millisecond keystroke cadence telemetry for proof-of-human-authorship provenance.',
      b3: 'Integrated invisible zero-width steganographic cryptographic watermarks across PDF, Word, HTML, and Markdown exports.'
    },
    exp4: {
      title: 'Quran Reels Generator • Open Source',
      date: '2025 – 2026',
      b1: 'Built automated Quranic video generator with Flask backend, MoviePy rendering pipeline, and multi-reciter synchronization.',
      b2: 'Shipped lightweight Windows desktop application with PyInstaller, NSIS installer, and automated GitHub Actions CI/CD releases.',
      b3: 'Deployed containerized live web application on Hugging Face Spaces with Docker and YouTube OAuth upload capabilities.'
    },
    exp5: {
      title: 'Al-Haq Initiative Web Platform • Community',
      date: '2025 – 2026',
      b1: 'Designed and developed multi-page web platform with Firebase multi-site hosting, PWA offline caching, and clean URL routing.',
      b2: 'Built Quran reader, research library, and donation processing with automated testing and i18n support for EN, AR, PS, FA, UR.',
      b3: 'Implemented automated test suite with link integrity verification and end-to-end smoke testing.'
    },
    exp1: {
      title: 'PohLang & PLHub • Programming Language Engineering',
      date: '2024 – 2025',
      b1: 'Designed and implemented PohLang, an expressive natural phrasal programming language with standalone Rust runtime.',
      b2: 'Built complete compiler toolchain from scratch: lexer, recursive-descent parser, bytecode compiler, and virtual machine.',
      b3: 'Authored PLHub CLI development environment with cross-platform targets and published official VS Code extension to Marketplace.'
    },
    sponsor: {
      title: 'Support Independent Engineering & Research',
      copy: 'As an independent software engineer and author, I build open-source tools, sovereign privacy utilities, and educational platforms through <strong>Al-Haq Studio</strong> and <strong>Al-Haq Initiative</strong>. Your sponsorship fuels server infrastructure, open research, and ad-free community software.',
      note: 'Personal community initiative by Habib Mukhlis (Habibur Rahman) (UK sole trader). Not a registered charity or corporate trust.'
    },
    assistant: {
      title: 'Ask the Al-Haq Assistant',
      desc: 'The conversational assistant is indexed over this portfolio and products to answer questions regarding architecture, features, and research. Available anytime via the floating button.'
    },
    btn: {
      demo: 'Demo',
      docs: 'Docs',
      code: 'Code',
      install: 'Install',
      repo: 'Repo',
      readme: 'README',
      download: 'Download',
      visit: 'Visit',
      play: 'Google Play'
    },
    contact: {
      p1: 'Have a project, security audit, architecture question, or freelance opportunity? Send a message and I will respond promptly.',
      labelName: 'Name',
      phName: 'Your name',
      labelEmail: 'Email',
      phEmail: 'you@example.com',
      labelMessage: 'Message',
      phMessage: 'How can I help?',
      btnSend: 'Send Message',
      btnEmail: 'Direct Email',
      btnFiverr: 'Hire on Fiverr',
      success: 'Thanks! Your message was sent.',
      error: 'Sorry, something went wrong. Please try again or email me directly.',
      availability: 'Availability',
      availabilityText: 'Open to full-time architecture roles, contract engineering, and bespoke freelance builds.',
      location: 'Location',
      locationText: 'United Kingdom (Remote Worldwide)',
      elsewhere: 'Key Websites & Profiles'
    },
    footer: {
      rights: 'All rights reserved.',
      reduceMotion: 'Reduce motion'
    }
  },
  ps: {
    skip: 'مينځپانګې ته ولاړ شئ',
    nav: {
      about: 'زما په اړه',
      ventures: 'فعالیتونه',
      projects: 'محصولات',
      services: 'خدمات',
      architecture: 'معماري',
      experience: 'تجربه',
      assistant: 'مرستیال',
      sponsor: 'ملاتړ',
      contact: 'اړيکه'
    },
    hero: {
      hello: 'بنسټ اېښودونکی او د سیسټمونو مشر معمار',
      lead: 'د <strong>الحق سټوډیو</strong> او <strong>الحق نوښت</strong> مخکښ معمار. د محلي محرمیت ساتونکو، ۳D واقعي سمولیشنونو، کمپایلر تولچینونو او اسلامي ډیجیټل هوساینې وسیلو انجنیر.',
      ctaProjects: 'محصولات وپلټئ',
      ctaServices: 'د پیرودونکو حل لارې',
      ctaContact: 'اړیکه راسره ونیسئ',
      ctaEmail: 'مستقیم بریښنالیک',
      ctaFiverr: 'پر فایور استخدام مې کړئ',
      meta1: 'انډرایډ، وېب، ډيسکټاپ، توسيعات',
      meta2: 'محلي لومړی'
    },
    kpi: {
      projects: 'پروژې او اوزارونه',
      privacy: 'پر دستګاه محرمیت',
      platforms: 'اصلي عملیاتي سیسټمونه',
      crypto: 'NIST کریپټوګرافي'
    },
    section: {
      about: { title: 'زما په اړه او فلسفه' },
      experience: { title: 'انجنیري تجربه او خپرونې' },
      projects: { title: 'ځانګړي محصولات او راتلونکي پروژې' },
      contact: { title: 'اړيکه او پوښتنې' }
    },
    about: {
      intro: 'زه یو خپلواک د سیسټمونو انجنیر، سافټویر معمار، او تاریخي څیړونکی یم. زه دوه بشپړونکي نوښتونه پرمخ وړم چې د ډیجیټل حاکمیت، اخلاقي هوساینې، او خلاصو ټولنیزو وسیلو د ودې لپاره ډیزاین شوي:',
      li1: '<strong>محلي سیسټمونه:</strong> د شبکې پاکټونو محلي پلټنه، محلي بصري AI، او صفر-ټیلیمټري په انډرایډ، وېب توسيعاتو او ډېسکټاپ کې.',
      li2: '<strong>واقعي سمولیشن:</strong> Three.js r185 ۳D تجربه د فضايي پروسیجرل وېب غږونو او پټو سټیګانوګرافیک مهرونو سره.',
      li3: '<strong>د ژبې او کمپایلر ډیزاین:</strong> د بایټ‌کوډ کمپایلرونه، لغوي تحلیل کوونکي، او Rust رن‌ټایم د طبیعي عبارتي ژبې لپاره.',
      li4: '<strong>ټولنیزه ډیجیټل هوساینه:</strong> په بشپړه توګه وړیا اسلامي اوزارونه، د تلاوت غږیز AI فیډبیک، او کره تاریخي څېړنې.',
      outro: 'ټول کوډبیسونه د پرمختللي ریاضیاتي جوړښت (NIST P-256 ECDSA آفلاین تصدیق، د PostgreSQL RLS امنیت) سره یوځای اسانه او له ګډوډۍ پرته کاروونکي تجربه برابروي.'
    },
    ventures: {
      eyebrow: 'دوه اصلي ستنې',
      title: 'سوداګریز سټوډیو او ټولنیز ماموریت',
      lead: 'د مسلکي سافټویر جوړونې او خپلواکې ټولنیزې ډیجیټل هوساینې ترمنځ پله جوړول.',
      studioSubtitle: 'سوداګریز سافټویر انجنیري • UK Sole Trader',
      studioDesc: 'سوداګریز انجنیري او پرمختیایي سټوډیو. د لوړ کیفیت انډرایډ غوښتنلیکونه، بې روټه محلي فایروالونه، ۳D فضايي سمولیشنونه او د صفر پوهې کریپټوګرافیک سیسټمونه جوړوي.',
      initiativeSubtitle: 'ټولنیزه ډیجیټل هوساینه • شخصي ماموریت',
      initiativeDesc: 'یو شخصي ډیجیټل نوښت چې ۱۰۰٪ وړیا معنوي اوزارونه، د اصلي سرچینو څېړنې او اسلامي ښوونیز پلیټفارمونه وړاندې کوي.'
    },
    projects: {
      eyebrow: 'بشپړ پورټفولیو',
      lead: 'تولیدي خپرونې، د خلاصې سرچینې ټولنیز اوزارونه، د کمپایلر معمارۍ، او راتلونکي R&D پایپلاینونه.'
    },
    services: {
      eyebrow: 'مسلکي خدمتونه',
      title: 'سوداګریز خدمتونه او د پیرودونکو حل لارې',
      lead: 'د <strong>الحق سټوډیو</strong> تر چتر لاندې د لوړ کیفیت انجنیري خدمتونه. دودیزه معماري، امنیتي پلټنې، او تولیدي سافټویر.',
      ctaConsult: 'د همکارۍ په اړه پوښتنه وکړئ'
    },
    arch: {
      eyebrow: 'تخنیکي مهارت',
      title: 'د سیسټمونو معماري او ټکنالوژي',
      lead: 'د پروګرامینګ ژبو، سیسټم رن‌ټایمونو، ګرافیک چوکاټونو او امنیتي طبقو یوه هراړخیزه عمومي کتنه.'
    },
    exp: {
      eyebrow: 'انجنیري پړاوونه',
      lead: 'مهم تولیدي خپرونې، د خلاصې سرچینې پړاوونه او معماري استقرارونه.'
    },
    exp6: {
      title: 'AmniGuard فایروال او NetBlock • الحق سټوډیو',
      date: '۲۰۲۶',
      b1: 'د لوړ سرعت Android VpnService فایروال ډیزاین کړ چې ۱۰۰٪ ترافیک په محلي ډول پر دستګاه پروسس کوي بې له کلاوډ ټیلیمټري.',
      b2: 'د ۸۰،۰۰۰+ غیر اخلاقي ډومینونو سنک هول، د پورټ ۸۵۳ DoT پلي کول او د ژوندي PCAP کڅوړو ثبتول جوړ کړل.',
      b3: 'د GNU GPLv3 لاندې د NIST P-256 ECDSA آفلاین تصدیق سره خپور شو.'
    },
    exp7: {
      title: 'Platen: ۳D ټایپ رایټر • الحق سټوډیو',
      date: '۲۰۲۶',
      b1: 'په Three.js r185 کې د ۳D میخانیکي ټایپ رایټر سمولیشن د پروسیجرل فضايي وېب غږونو سره جوړ کړ.',
      b2: 'د بشري لیکنې تصدیق لپاره په ۶۰ FPS کې د تڼیو کېکاږلو چټکتیا ټیلیمټري پلي کړه.',
      b3: 'په PDF، Word، HTML او Markdown کې نه لیدل کېدونکي کریپټوګرافیک واټر مارکونه یکجا کړل.'
    },
    exp4: {
      title: 'د قرآن ریلز جنریتر • خلاص سرچینه',
      date: '۲۰۲۵ – ۲۰۲۶',
      b1: 'د Flask بېکنډ، MoviePy پایپلاین او ډېرو قاریانو ملاتړ سره د اتومات قرآني ویډیو جنریتر جوړ کړ.',
      b2: 'د PyInstaller، NSIS انسټالر او اتومات GitHub Actions CI/CD خپرونو سره د وینډوز ډیسکټاپ اپ خپور کړ.',
      b3: 'د Docker او YouTube OAuth وړتیاوو سره په Hugging Face Spaces کې ژوندی ویب اپ ځای پر ځای کړ.'
    },
    exp5: {
      title: 'الحق نوښت • ویب پلیټفارم',
      date: '۲۰۲۵ – ۲۰۲۶',
      b1: 'د Firebase کوربه توب او PWA وړتیاوو سره ډیر مخیز سازماني ویبسایټ ډیزاین او جوړ کړ.',
      b2: 'د قرآن لوستونکی، اسلامي کتابتون او د عطیې سیسټم د اتومات ازموینې سره جوړ کړ.',
      b3: 'د لینکونو بشپړتیا او د پای څخه تر پایه سموک ازموینو سره اتومات ټیسټ سوټ پلي کړ.'
    },
    exp1: {
      title: 'PohLang او PLHub • د ژبې انجنیري',
      date: '۲۰۲۴ – ۲۰۲۵',
      b1: 'د پیلامرو لپاره د Rust رن‌ټایم سره یوه بشپړه جملوی برنامه لیکنې ژبه ډیزاین او پلي کړه.',
      b2: 'بشپړ کمپایلر تولچین جوړ کړ: لیکسر، پارسر، بایت‌کوډ کمپایلر او VM د ۵۰+ بریالیو ازموینو سره.',
      b3: 'د PLHub چاپیریال او د VS Code مارکیټ لپاره رسمي توسيعه خپره کړه.'
    },
    sponsor: {
      title: 'د خپلواکې انجنیرۍ او څېړنو ملاتړ',
      copy: 'د یوه خپلواک انجنیر او لیکوال په توګه، زه د <strong>الحق سټوډیو</strong> او <strong>الحق نوښت</strong> له لارې د خلاصې سرچینې او محرمیت اوزارونه جوړوم. ستاسو ملاتړ سرورونه او بې اعلانه ټولنیز اوزارونه تمویلوي.',
      note: 'د حبیب مخلص (حبیب الرحمن) شخصي ټولنیز نوښت (UK sole trader). خیریه یا ثبت شوی خیریه بنسټ نه دی.'
    },
    assistant: {
      title: 'د الحق AI مرستیال څخه وپوښتئ',
      desc: 'دا هوښیار مرستیال د دې پورټفولیو، محصولاتو (AmniGuard, AmniShield, Platen, AmniSpace)، خدماتو او د الحق نوښت د کتابتون په اړه پوښتنو ته ځواب وايي.'
    },
    btn: {
      demo: 'ډيمو',
      docs: 'لاسوندونه',
      code: 'کوډ',
      install: 'نصبول',
      repo: 'ذخیره',
      readme: 'README',
      download: 'ډاونلوډ',
      visit: 'وګورئ',
      play: 'ګوګل پلی'
    },
    contact: {
      p1: 'پوښتنه یا پروژه لرئ؟ پیغام پرېږدئ، ژر ځواب درکوم.',
      labelName: 'نوم',
      phName: 'ستاسو نوم',
      labelEmail: 'برېښنالیک',
      phEmail: 'you@example.com',
      labelMessage: 'پيغام',
      phMessage: 'څنګه مرسته وکړم؟',
      btnSend: 'پیغام واستوئ',
      btnEmail: 'مستقیم بریښنالیک',
      btnFiverr: 'په فایور وګومارئ',
      success: 'مننه! ستاسو پیغام واستول شو.',
      error: 'بخښنه، ستونزه رامنځته شوه. مهرباني وکړئ بیا هڅه وکړئ یا مستقیم بریښنالیک واستوئ.',
      availability: 'شتون',
      availabilityText: 'د تمام وخت معماري رولونو، قراردادونو او ځانګړو پروژو لپاره چمتو.',
      location: 'ځای',
      locationText: 'برتانیه (لرې، نړيوال)',
      elsewhere: 'مهم وېبپاڼې او پروفایلونه'
    },
    footer: {
      rights: 'ټولې حقوق خوندي دي.',
      reduceMotion: 'خوځښت کم کړئ'
    }
  },
  fa: {
    skip: 'پرش به محتوا',
    nav: {
      about: 'درباره من',
      ventures: 'پروژه‌ها و سازمان‌ها',
      projects: 'محصولات',
      services: 'خدمات',
      architecture: 'معماری',
      experience: 'تجربه',
      assistant: 'دستیار',
      sponsor: 'حمایت',
      contact: 'ارتباط'
    },
    hero: {
      hello: 'بنیان‌گذار و معمار ارشد سیستم‌ها',
      lead: 'معمار ارشد <strong>استودیو الحق</strong> و <strong>ابتکار الحق</strong>. مهندسی محافظان محلی حریم خصوصی، شبیه‌سازی‌های سه‌بعدی تعاملی، زنجیره ابزار کامپایلر و ابزارهای رفاه دیجیتال اسلامی.',
      ctaProjects: 'کاوش محصولات',
      ctaServices: 'راهکارهای تجاری',
      ctaContact: 'تماس با من',
      ctaEmail: 'ایمیل مستقیم',
      ctaFiverr: 'در Fiverr من را استخدام کنید',
      meta1: 'اندروید، وب، دسکتاپ، افزونه‌ها',
      meta2: 'محلی‌محور'
    },
    kpi: {
      projects: 'پروژه‌ها و ابزارها',
      privacy: 'حریم خصوصی درون‌دستگاهی',
      platforms: 'سیستم‌عامل‌های اصلی',
      crypto: 'رمزنگاری NIST'
    },
    section: {
      about: { title: 'درباره من و فلسفه' },
      experience: { title: 'تجربه مهندسی و انتشارات' },
      projects: { title: 'محصولات برجسته و پروژه‌های آتی' },
      contact: { title: 'ارتباط و پرسش‌ها' }
    },
    about: {
      intro: 'من یک مهندس سیستم مستقل، معمار نرم‌افزار و پژوهشگر تاریخی هستم. من دو بخش مکمل را برای پیشبرد حاکمیت دیجیتال، سلامت اخلاقی و ابزارهای متن‌باز جامعه هدایت می‌کنم:',
      li1: '<strong>سیستم‌های محلی‌محور:</strong> بازرسی بسته‌های شبکه درون‌دستگاهی، هوش مصنوعی بصری محلی، و عدم ردیابی کامل در اندروید، افزونه‌ها و دسکتاپ.',
      li2: '<strong>شبیه‌سازی واقعی:</strong> تجارب سه‌بعدی WebGL با Three.js r185، صوت فضایی رویه‌ای و اصالت‌سنجی پنهان‌نگاری.',
      li3: '<strong>طراحی زبان و کامپایلر:</strong> کامپایلرهای بایت‌کد اختصاصی، تحلیل‌گرهای لغوی، و رانتایم Rust برای سینتکس بیانی روان.',
      li4: '<strong>رفاه دیجیتال جامعه:</strong> ابزارهای کاملاً رایگان بهره‌وری اسلامی، تحلیل صوتی هوشمند قرائت و رساله‌های پژوهشی مستند.',
      outro: 'تمام کدبیس‌ها توازن دقیقی میان معماری ریاضیاتی (تأیید آفلاین NIST P-256 ECDSA و امنیت PostgreSQL RLS) و تجربه کاربری آرام برقرار می‌کنند.'
    },
    ventures: {
      eyebrow: 'دو رکن بنیادین',
      title: 'استودیوی تجاری و ماموریت جامعه',
      lead: 'پیوند مهندسی نرم‌افزار حرفه‌ای با خدمات رفاه دیجیتال مستقل برای جامعه.',
      studioSubtitle: 'مهندسی نرم‌افزار تجاری • UK Sole Trader',
      studioDesc: 'استودیوی مهندسی و توسعه تجاری. توسعه اپلیکیشن‌های اندروید، فایروال‌های محلی بدون روت، شبیه‌سازی‌های سه‌بعدی و سیستم‌های رمزنگاری با دانش صفر.',
      initiativeSubtitle: 'رفاه دیجیتال جامعه • ماموریت فردی',
      initiativeDesc: 'یک ماموریت دیجیتال مستقل که ابزارهای معنوی ۱۰۰٪ رایگان، پژوهش‌های مستند تاریخی و بسترهای آموزشی اسلامی را ارائه می‌دهد.'
    },
    projects: {
      eyebrow: 'پورتفولیوی جامع',
      lead: 'محصولات تجاری، ابزارهای متن‌باز جامعه، معماری‌های کامپایلر و برنامه‌های تحقیق و توسعه نسل بعد.'
    },
    services: {
      eyebrow: 'همکاری‌های حرفه‌ای',
      title: 'خدمات تجاری و راهکارهای مشتریان',
      lead: 'خدمات مهندسی دقیق تحت <strong>استودیو الحق</strong> (UK sole trader). معماری سفارشی، ممیزی امنیتی و نرم‌افزارهای تجاری.',
      ctaConsult: 'درخواست مشاوره و همکاری'
    },
    arch: {
      eyebrow: 'تسلط فنی',
      title: 'معماری سیستم‌ها و پشته فناوری',
      lead: 'بررسی جامع زبان‌های برنامه‌نویسی، رانتایم‌های سیستمی، فریم‌ورک‌های گرافیکی و لایه‌های امنیتی.'
    },
    exp: {
      eyebrow: 'نقاط عطف مهندسی',
      lead: 'عرضه محصولات کلیدی، نقاط عطف متن‌باز و استقرارهای معماری.'
    },
    exp6: {
      title: 'فایروال و نت‌بلاک AmniGuard • استودیو الحق',
      date: '۲۰۲۶',
      b1: 'توسعه فایروال Android VpnService با پردازش ۱۰۰٪ بسته‌ها روی دستگاه بدون ارسال اطلاعات به کلود.',
      b2: 'ایجاد مسدودکننده ۸۰،۰۰۰+ دامنه غیراخلاقی، پورت ۸۵۳ DoT و ضبط زنده بسته‌های PCAP وایرشارک.',
      b3: 'انتشار متن‌باز تحت GNU GPLv3 با اعتبارسنجی رمزنگاری آفلاین NIST P-256 ECDSA.'
    },
    exp7: {
      title: 'Platen: ماشین تحریر سه‌بعدی • استودیو الحق',
      date: '۲۰۲۶',
      b1: 'شبیه‌ساز ماشین تحریر مکانیکی سه‌بعدی با Three.js r185 و سنتز صدای فضایی تحت وب.',
      b2: 'ثبت توالی تایپ کلیدها در ۶۰ فریم بر ثانیه برای اثبات نگارش توسط انسان.',
      b3: 'تعبیه واترمارک‌های نامرئی رمزنگاری در خروجی‌های PDF، Word، HTML و Markdown.'
    },
    exp4: {
      title: 'ژنراتور ریلز قرآن • متن‌باز',
      date: '۲۰۲۵ – ۲۰۲۶',
      b1: 'ساخت ژنراتور ویدیوی قرآنی با هوش مصنوعی با بکند Flask، پایپلاین MoviePy و پشتیبانی چند قاری.',
      b2: 'انتشار اپ دسکتاپ ویندوز با PyInstaller، نصب‌کننده NSIS و انتشارات خودکار CI/CD GitHub Actions.',
      b3: 'استقرار اپ وب زنده در Hugging Face Spaces با Docker و قابلیت‌های آپلود YouTube OAuth.'
    },
    exp5: {
      title: 'ابتکار الحق • پلتفرم وب',
      date: '۲۰۲۵ – ۲۰۲۶',
      b1: 'طراحی و توسعه وبسایت سازمانی چند صفحه‌ای با میزبانی Firebase و قابلیت‌های PWA.',
      b2: 'ساخت قاری قرآن، کتابخانه اسلامی و سیستم اهدا با تست خودکار.',
      b3: 'پیاده‌سازی مجموعه تست خودکار با بررسی یکپارچگی لینک‌ها و تست‌های دود.'
    },
    exp1: {
      title: 'PohLang و PLHub • مهندسی زبان‌های برنامه‌نویسی',
      date: '۲۰۲۴ – ۲۰۲۵',
      b1: 'طراحی و پیاده‌سازی PohLang، یک زبان برنامه‌نویسی عبارتی با رانتایم مستقل Rust.',
      b2: 'ساخت زنجیره ابزار کامل کامپایلر: تحلیل‌گر واژگانی، تحلیل‌گر نحوی، کامپایلر بایت‌کد و ماشین مجازی.',
      b3: 'ساخت محیط توسعه PLHub و انتشار افزونه رسمی در فروشگاه VS Code.'
    },
    sponsor: {
      title: 'حمایت از مهندسی و پژوهش‌های مستقل',
      copy: 'به عنوان یک مهندس نرم‌افزار و پژوهشگر مستقل، ابزارهای متن‌باز و حریم خصوصی را از طریق <strong>استودیو الحق</strong> و <strong>ابتکار الحق</strong> می‌سازم. حمایت شما زیرساخت‌های سرور و ابزارهای بدون تبلیغات را تقویت می‌کند.',
      note: 'ابتکار فردی توسط حبیب مخلص (حبیب الرحمن) (UK sole trader). خیریه یا تراست ثبت‌شده نیست.'
    },
    assistant: {
      title: 'پرسش از دستیار هوشمند الحق',
      desc: 'دستیار هوش مصنوعی به سوالات مربوط به این پورتفولیو، محصولات (AmniGuard, AmniShield, Platen, AmniSpace)، خدمات و کتابخانه پاسخ می‌دهد.'
    },
    btn: {
      demo: 'دمو',
      docs: 'مستندات',
      code: 'کد',
      install: 'نصب',
      repo: 'مخزن',
      readme: 'README',
      download: 'دانلود',
      visit: 'بازدید',
      play: 'گوگل پلی'
    },
    contact: {
      p1: 'پروژه، ممیزی امنیتی یا سوالی دارید؟ پیام بگذارید تا سریعاً پاسخ دهم.',
      labelName: 'نام',
      phName: 'نام شما',
      labelEmail: 'ایمیل',
      phEmail: 'you@example.com',
      labelMessage: 'پیام',
      phMessage: 'چطور کمک کنم؟',
      btnSend: 'ارسال پیام',
      btnEmail: 'ایمیل مستقیم',
      btnFiverr: 'استخدام از فایور',
      success: 'ممنون! پیام شما ارسال شد.',
      error: 'متاسفیم، مشکلی پیش آمد. لطفا دوباره تلاش کنید یا مستقیم ایمیل بدهید.',
      availability: 'دسترس‌پذیری',
      availabilityText: 'آماده برای نقش‌های معماری تمام‌وقت، قراردادهای مهندسی و پروژه‌های اختصاصی.',
      location: 'موقعیت',
      locationText: 'بریتانیا (دورکاری، جهانی)',
      elsewhere: 'وب‌سایت‌ها و نمایه‌ها'
    },
    footer: {
      rights: 'کلیه حقوق محفوظ است.',
      reduceMotion: 'کاهش پویانمایی'
    }
  }
};

function applyLang(lang) {
  const html = document.documentElement;
  html.setAttribute('lang', lang);
  const rtl = (lang === 'ps' || lang === 'fa');
  html.setAttribute('dir', rtl ? 'rtl' : 'ltr');
  document.body.classList.toggle('rtl', rtl);
  // Text nodes
  $$('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = key.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), dict[lang]);
    if (typeof value === 'string') {
      if (value.includes('<') || value.includes('&')) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    }
  });
  // Placeholders
  $$('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    const value = key.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), dict[lang]);
    if (typeof value === 'string') el.setAttribute('placeholder', value);
  });
  localStorage.setItem(langKey, lang);
}

function getLang() {
  return localStorage.getItem(langKey) || (navigator.language || 'en').slice(0, 2);
}

// tiny translator helper
function t(key, lang = getLang()) {
  try {
    return key.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), dict[lang]);
  } catch(_) { return undefined; }
}

// Initialize language
let detected = getLang();
if (!['en', 'ps', 'fa'].includes(detected)) {
  if (detected.startsWith('fa')) detected = 'fa';
  else if (detected.startsWith('ps')) detected = 'ps';
  else detected = 'en';
}
const initialLang = detected;
applyLang(initialLang);
const langSelect = document.getElementById('langSelect');
if (langSelect) {
  langSelect.value = initialLang;
  langSelect.addEventListener('change', (e) => {
    const value = e.target.value;
    applyLang(value);
    langSelect.value = value;
  });
}

// Contact form (Formspree)
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const status = document.getElementById('formStatus');
  const endpoint = form.getAttribute('action');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (status) { status.textContent = ''; status.className = 'form__status'; }
    const btn = form.querySelector('button[type="submit"]');
    const prev = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = (t('contact.btnSend') || 'Send') + '…'; }
    try {
      const data = new FormData(form);
      const res = await fetch(endpoint, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        form.reset();
        if (status) { status.className = 'form__status form__status--success'; status.textContent = t('contact.success') || 'Thanks! Your message was sent.'; }
      } else {
        if (status) { status.className = 'form__status form__status--error'; status.textContent = t('contact.error') || 'Sorry, something went wrong. Please try again or email me directly.'; }
      }
    } catch (err) {
      if (status) { status.className = 'form__status form__status--error'; status.textContent = t('contact.error') || 'Sorry, something went wrong. Please try again or email me directly.'; }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = prev; }
    }
  });
}

// init
initContactForm();

// Email obfuscation: bind click to elements with .email-link and construct mailto at runtime
(function initEmailLinks() {
  const user = 'habibmukhlis2006';
  const domain = 'gmail.com';
  const subject = encodeURIComponent('Portfolio inquiry');
  const body = encodeURIComponent("Hi Habib,\n\nI'd like to connect about...");
  const href = `mailto:${user}@${domain}?subject=${subject}&body=${body}`;
  $$('.email-link').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = href;
    });
  });
})();

// Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('service-worker.js').catch(() => {}));
}
