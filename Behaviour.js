/* Behaviour.js */

/* ─────────────────────────────────────────────────────────
   UTILITY — Toast pill
───────────────────────────────────────────────────────── */
function showToast(msg, icon = '✦') {
  const prev = document.querySelector('.frida-toast');
  if (prev) { prev.classList.remove('toast-in'); prev.addEventListener('transitionend', () => prev.remove(), { once: true }); }
  const t = document.createElement('div');
  t.className = 'frida-toast';
  t.innerHTML = `<span class="toast-icon">${icon}</span>${msg}`;
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('toast-in')));
  setTimeout(() => { t.classList.remove('toast-in'); t.addEventListener('transitionend', () => t.remove(), { once: true }); }, 2600);
}

/* ─────────────────────────────────────────────────────────
   1. SCROLL PROGRESS BAR
───────────────────────────────────────────────────────── */
const progressBar = document.getElementById('scroll-progress');
function updateProgress() {
  const max = document.body.scrollHeight - window.innerHeight;
  progressBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

/* ─────────────────────────────────────────────────────────
   2. CUSTOM CURSOR  (velocity squish + idle)
───────────────────────────────────────────────────────── */
const dot  = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0, pmx = 0, pmy = 0;
let idleTimer = null;
dot._hovering = false;

document.addEventListener('mousemove', e => {
  pmx = mx; pmy = my;
  mx = e.clientX; my = e.clientY;
  dot.style.left = mx + 'px'; dot.style.top = my + 'px';

  const vx = mx - pmx, vy = my - pmy;
  const speed = Math.sqrt(vx * vx + vy * vy);
  if (speed > 2 && !dot._hovering) {
    const angle  = Math.atan2(vy, vx) * 180 / Math.PI;
    const squish = Math.min(1 + speed * 0.045, 1.9);
    const squeeze = Math.max(1 - speed * 0.022, 0.55);
    dot.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scaleX(${squish}) scaleY(${squeeze})`;
    clearTimeout(dot._squishTimer);
    dot._squishTimer = setTimeout(() => { if (!dot._hovering) dot.style.transform = 'translate(-50%,-50%) scale(1)'; }, 90);
  }

  dot.classList.remove('idle');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => dot.classList.add('idle'), 4500);
  spawnSparkle(mx, my);
});

(function tick() {
  rx += (mx - rx) * .13; ry += (my - ry) * .13;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(tick);
})();

function cursorEnter() {
  dot._hovering = true;
  dot.style.transform = 'translate(-50%,-50%) scale(2.2)';
  dot.style.background = 'var(--purple)';
  ring.style.width = ring.style.height = '54px';
  ring.style.borderColor = 'rgba(192,132,252,.4)';
}
function cursorLeave() {
  dot._hovering = false;
  dot.style.transform = 'translate(-50%,-50%) scale(1)';
  dot.style.background = 'var(--lime)';
  ring.style.width = ring.style.height = '34px';
  ring.style.borderColor = 'rgba(184,240,74,.45)';
}
function refreshCursorTargets() {
  document.querySelectorAll('a, button, .btn, .ach-row, .proj-card, .carousel-viewport, .carousel-dot, .circle-star, .nav-logo, .marquee-band, .snav-dot, #back-to-top')
    .forEach(el => {
      el.removeEventListener('mouseenter', cursorEnter);
      el.removeEventListener('mouseleave', cursorLeave);
      el.addEventListener('mouseenter', cursorEnter);
      el.addEventListener('mouseleave', cursorLeave);
    });
}
refreshCursorTargets();

/* ─────────────────────────────────────────────────────────
   SPARKLE TRAIL
───────────────────────────────────────────────────────── */
let lastSparkX = 0, lastSparkY = 0, lastSparkTime = 0;
function spawnSparkle(x, y) {
  const now = Date.now();
  if (now - lastSparkTime < 55) return;
  const dx = x - lastSparkX, dy = y - lastSparkY;
  if (dx * dx + dy * dy < 360) return;
  lastSparkTime = now; lastSparkX = x; lastSparkY = y;
  const s = document.createElement('div');
  s.className = 'sparkle-dot';
  s.textContent = Math.random() > .5 ? '✦' : '·';
  s.style.left = (x + (Math.random() - .5) * 10) + 'px';
  s.style.top  = (y + (Math.random() - .5) * 10) + 'px';
  s.style.setProperty('--tx', (Math.random() - .5) * 22 + 'px');
  s.style.setProperty('--ty', -(8 + Math.random() * 18) + 'px');
  document.body.appendChild(s);
  s.addEventListener('animationend', () => s.remove());
}

/* ─────────────────────────────────────────────────────────
   3. SCROLL REVEAL
───────────────────────────────────────────────────────── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ─────────────────────────────────────────────────────────
   4. PARALLAX
───────────────────────────────────────────────────────── */
const parallaxLayers  = [...document.querySelectorAll('.parallax-layer[data-speed]')];
const marqueeParallax = [...document.querySelectorAll('[data-parallax-x]')];
let scrollY = 0, rafPending = false;

function applyParallax() {
  rafPending = false;
  parallaxLayers.forEach(el => {
    el.style.transform = `translateY(${-scrollY * (parseFloat(el.dataset.speed) || 0)}px)`;
  });
  marqueeParallax.forEach(el => {
    const dist = (el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2) - window.innerHeight / 2;
    el.style.transform = `translateX(${dist * (parseFloat(el.dataset.parallaxX) || 0)}px)`;
  });
}
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  if (!rafPending) { rafPending = true; requestAnimationFrame(applyParallax); }
}, { passive: true });
applyParallax();

/* ─────────────────────────────────────────────────────────
   5. HERO AMBIENT ORBS
───────────────────────────────────────────────────────── */
const orbs = [document.getElementById('orb1'), document.getElementById('orb2'), document.getElementById('orb3')];
const orbFactors = [22, 14, 9];
let orbRaf = false, orbX = 0, orbY = 0;

document.addEventListener('mousemove', e => {
  orbX = e.clientX / window.innerWidth  - 0.5;
  orbY = e.clientY / window.innerHeight - 0.5;
  if (!orbRaf) {
    orbRaf = true;
    requestAnimationFrame(() => {
      orbs.forEach((orb, i) => orb.style.transform = `translate(${orbX * orbFactors[i]}px, ${orbY * orbFactors[i]}px)`);
      orbRaf = false;
    });
  }
});

/* ─────────────────────────────────────────────────────────
   6. HERO CAROUSEL
───────────────────────────────────────────────────────── */
const DURATION = 10000;
document.documentElement.style.setProperty('--carousel-duration', `${DURATION / 1000}s`);

const slides = [...document.querySelectorAll('.carousel-slide')];
const dotEls = [...document.querySelectorAll('.carousel-dot')];
let current = 0, carouselTimer = null;

function goToSlide(next) {
  if (next === current) return;
  const prev = current;
  slides[prev].classList.remove('active'); slides[prev].classList.add('exit');
  slides[prev].addEventListener('transitionend', function h() {
    slides[prev].classList.remove('exit'); slides[prev].removeEventListener('transitionend', h);
  });
  slides[next].classList.add('active'); current = next;
  dotEls.forEach((d, i) => {
    d.classList.toggle('done',   i < next);
    d.classList.toggle('active', i === next);
    if (i > next) d.classList.remove('active', 'done');
    if (i === next) { void d.offsetWidth; d.classList.add('active'); }
  });
}

function startTimer() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(() => goToSlide((current + 1) % slides.length), DURATION);
}

dotEls.forEach((d, i) => d.addEventListener('click', () => { goToSlide(i); startTimer(); }));

const cViewport = document.querySelector('.carousel-viewport');
cViewport.addEventListener('mouseenter', () => clearInterval(carouselTimer));
cViewport.addEventListener('mouseleave', () => startTimer());

let touchStartX = 0;
cViewport.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
cViewport.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) { goToSlide((current + (dx < 0 ? 1 : -1) + slides.length) % slides.length); startTimer(); }
});

setTimeout(() => { goToSlide(1); startTimer(); }, 3000);

/* ─────────────────────────────────────────────────────────
   7. 3D TILT — PROJECT CARDS
───────────────────────────────────────────────────────── */
document.querySelectorAll('.proj-card').forEach(card => {
  const maxTilt = card.classList.contains('circle') ? 6 : 10;
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'box-shadow .32s ease, border-color .3s ease';
  });
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x * maxTilt * 2}deg) rotateX(${-y * maxTilt * 2}deg) scale(1.04)`;
    card.querySelector('.proj-card-inner').style.transform =
      `rotateY(${x * maxTilt * 2}deg) rotateX(${-y * maxTilt * 2}deg) scale(1.04) translateZ(0)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform .55s cubic-bezier(.34,1.2,.64,1), box-shadow .32s ease, border-color .3s ease';
    card.style.transform = 'perspective(700px) rotateY(0) rotateX(0) scale(1)';
  });
});

/* ─────────────────────────────────────────────────────────
   8. MAGNETIC BUTTONS
───────────────────────────────────────────────────────── */
document.querySelectorAll('.btn-lime, .btn-purple').forEach(btn => {
  btn.addEventListener('mouseenter', () => { btn.style.transition = 'transform .1s ease, box-shadow .28s ease'; });
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    btn.style.transform = `translate(${(e.clientX - r.left - r.width/2) * 0.3}px, ${(e.clientY - r.top - r.height/2) * 0.3}px) scale(1.07)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transition = 'transform .45s cubic-bezier(.34,1.56,.64,1), box-shadow .28s ease';
    btn.style.transform = '';
  });
});

/* ─────────────────────────────────────────────────────────
   9. PROJECT MODAL
───────────────────────────────────────────────────────── */
const projectData = {
  'art-for-all':     { title: 'Art For All',      tag: 'Erasmus+',        desc: 'An inclusive approach to art, bridging accessibility and creativity through an Erasmus+ partnership. The project explores how design can lower barriers to cultural participation for people of all abilities. Made in collaboration with "Associazione cechi italia"',                img: 'Images/artforall.png',      index: '01 / 06' },
  'design-tales':    { title: 'Design Tales',      tag: 'Gamification',    desc: 'A card game that makes learning design history engaging and tactile. Players explore movements, icons, and pivotal moments through storytelling mechanics that blend trivia with narrative.',                                                                                         img: 'Images/designtales.png',    index: '02 / 06' },
  'useless-box':     { title: 'Useless Box',       tag: 'Arduino / Play',  desc: 'An Arduino-based machine whose only purpose is to turn itself off — a gentle provocation on the nature of usefulness. Part product, part performance art.',                                                                                                                           img: 'Images/uselessbox.png',     index: '03 / 06' },
  'uomo-in-blue':    { title: "L'Uomo in Blue",    tag: 'Portrait',        desc: 'A painted portrait exploring identity, colour, and the emotional weight of blue. A personal artistic statement that lives outside the boundaries of digital design.',                                                                                                                 img: "Images/l'uomoinblue.jpeg",  index: '04 / 06' },
  'interactive-vr':  { title: 'Interactive VR',    tag: 'VR / Accessibility', desc: 'An immersive VR environment built in collaboration with ASPOC, designed to improve cognitive skills in students through spatial interaction, visual stimuli, and play-based learning.',                                                                                            img: 'Images/VVr.png',            index: '05 / 06' },
  'micro-instrument':{ title: 'Micro-instrument',  tag: 'Microbit',        desc: 'A Microbit-based project that focuses on physical interaction — turning the user into a living instrument. Explores the intersection of physical computing, education, and musical expression.',                                                                                      img: 'Images/micro c.jpeg',       index: '06 / 06' },
};

const modal = document.getElementById('project-modal');
function openModal(key) {
  const d = projectData[key]; if (!d) return;
  document.getElementById('modal-title').textContent = d.title;
  document.getElementById('modal-tag').textContent   = d.tag;
  document.getElementById('modal-desc').textContent  = d.desc;
  document.getElementById('modal-index').textContent = d.index;
  const img = document.getElementById('modal-img');
  img.src = d.img || ''; img.style.display = d.img ? 'block' : 'none';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
window.closeModal = function() { modal.classList.remove('open'); document.body.style.overflow = ''; };

document.querySelectorAll('.proj-card[data-project]').forEach(c => c.addEventListener('click', () => openModal(c.dataset.project)));
document.getElementById('modal-close-btn').addEventListener('click', closeModal);
document.getElementById('modal-backdrop').addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ─────────────────────────────────────────────────────────
   10. HERO TITLE SCRAMBLE
───────────────────────────────────────────────────────── */
function scrambleTitle() {
  const el = document.querySelector('.hero-title');
  const lines = ["Hi, I'm Frida", "A IXD Design", "Student"];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789✦@#%';
  let frame = 0; const TOTAL = 70;
  const id = setInterval(() => {
    const p = ++frame / TOTAL;
    el.innerHTML = lines.map((line, li) => {
      const lineP = Math.max(0, (p * 1.6) - li * 0.28);
      return line.split('').map((ch, ci) => {
        if (ch === ' ' || ch === "'" || ch === ',') return ch;
        return ci / line.length < lineP ? ch : chars[Math.floor(Math.random() * chars.length)];
      }).join('');
    }).join('<br>');
    if (frame >= TOTAL) { clearInterval(id); el.innerHTML = lines.join('<br>'); }
  }, 16);
}
window.addEventListener('load', () => setTimeout(scrambleTitle, 350));

/* ─────────────────────────────────────────────────────────
   11. CLICK RIPPLE
───────────────────────────────────────────────────────── */
document.addEventListener('click', e => {
  if (e.target.closest('#project-modal')) return;
  const r = document.createElement('div');
  r.className = 'click-ripple';
  r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
  document.body.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
});

/* ─────────────────────────────────────────────────────────
   12. NAV — scroll glass + active section highlight
───────────────────────────────────────────────────────── */
const navEl    = document.querySelector('nav');
const navLinks = [...document.querySelectorAll('.nav-links a')];

window.addEventListener('scroll', () => {
  navEl.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ─────────────────────────────────────────────────────────
   13. SECTION TRACKER
       IntersectionObserver drives both:
       – top nav link active state
       – right-edge section dots
───────────────────────────────────────────────────────── */
const sectionIds   = ['hero', 'about', 'projects', 'contact'];
const snavDots     = [...document.querySelectorAll('.snav-dot')];
const snavLabels   = { hero: 'Top', about: 'About', projects: 'Work', contact: 'Contact' };
let activeSectionId = 'hero';

const sectionEls = sectionIds.map(id => document.getElementById(id) || document.querySelector(`[id="${id}"]`)).filter(Boolean);

function setActiveSection(id) {
  if (id === activeSectionId) return;
  activeSectionId = id;

  // nav links
  navLinks.forEach(a => {
    const href = a.getAttribute('href').replace('#', '');
    a.classList.toggle('nav-active', href === id);
  });

  // section dots
  snavDots.forEach(d => {
    const active = d.dataset.section === id;
    d.classList.toggle('active', active);
    // show label briefly
    if (active) {
      d.setAttribute('data-label', snavLabels[id] || id);
      d.classList.add('label-peek');
      clearTimeout(d._labelTimer);
      d._labelTimer = setTimeout(() => d.classList.remove('label-peek'), 1400);
    }
  });
}

// Use one observer per section — whichever crosses 30% of viewport wins
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
}, { threshold: 0.3 });
sectionEls.forEach(el => secObs.observe(el));

// Footer / contact has low height so also watch at threshold 0
const footerEl = document.getElementById('contact');
if (footerEl) {
  new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) setActiveSection('contact'); });
  }, { threshold: 0.08 }).observe(footerEl);
}

/* ─────────────────────────────────────────────────────────
   14. BACK TO TOP
───────────────────────────────────────────────────────── */
const btt = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  btt.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });
btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ─────────────────────────────────────────────────────────
   15. MARQUEE — hover slows it down, click reverses
───────────────────────────────────────────────────────── */
document.querySelectorAll('.marquee-band').forEach(band => {
  const track = band.querySelector('.marquee-track');
  band.addEventListener('mouseenter', () => track.style.animationDuration = '38s');
  band.addEventListener('mouseleave', () => track.style.animationDuration = '20s');
  band.addEventListener('click', () => {
    const wasRev = track.classList.contains('rev');
    track.classList.toggle('fwd',  wasRev);
    track.classList.toggle('rev', !wasRev);
    showToast(wasRev ? 'back to the future ↗' : 'rewind ↙');
  });
});

/* ─────────────────────────────────────────────────────────
   16. EASTER EGG — logo click counter
───────────────────────────────────────────────────────── */
const navLogo = document.querySelector('.nav-logo');
let logoClicks = 0, logoReset = null;
const logoLines = ["still here? 👀", "ok now you're curious", "keep going...", "one more...", "🎉 you found it!"];

navLogo.addEventListener('click', () => {
  logoClicks = Math.min(logoClicks + 1, logoLines.length);
  clearTimeout(logoReset);
  logoReset = setTimeout(() => { logoClicks = 0; }, 2800);
  showToast(logoLines[logoClicks - 1]);
  navLogo.classList.remove('jiggle'); void navLogo.offsetWidth; navLogo.classList.add('jiggle');
  if (logoClicks >= logoLines.length) { logoClicks = 0; triggerPartyMode(); }
});

/* ─────────────────────────────────────────────────────────
   PARTY MODE
───────────────────────────────────────────────────────── */
function triggerPartyMode() {
  document.body.classList.add('party-mode');
  for (let i = 0; i < 24; i++) setTimeout(spawnConfettiStar, i * 75);
  setTimeout(() => document.body.classList.remove('party-mode'), 2600);
}
function spawnConfettiStar() {
  const glyphs = ['✦','✧','★','✺','◆','●'];
  const s = document.createElement('div');
  s.className = 'confetti-star';
  s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
  s.style.left = (8 + Math.random() * 84) + 'vw'; s.style.top = '-20px';
  s.style.setProperty('--fall',  (50 + Math.random() * 38) + 'vh');
  s.style.setProperty('--drift', (Math.random() - .5) * 90 + 'px');
  s.style.setProperty('--hue',   Math.floor(Math.random() * 360) + 'deg');
  s.style.animationDuration = (1.1 + Math.random() * .9) + 's';
  document.body.appendChild(s);
  s.addEventListener('animationend', () => s.remove());
}

/* ─────────────────────────────────────────────────────────
   17. EASTER EGG — circle ✦ star burst
───────────────────────────────────────────────────────── */
const circleStar = document.querySelector('.circle-star');
if (circleStar) {
  circleStar.addEventListener('click', e => {
    e.stopPropagation();
    circleStar.classList.remove('star-burst'); void circleStar.offsetWidth; circleStar.classList.add('star-burst');
    circleStar.addEventListener('animationend', () => circleStar.classList.remove('star-burst'), { once: true });
    const rect = circleStar.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist  = 55 + Math.random() * 45;
      const sp = document.createElement('div');
      sp.className = 'star-particle';
      sp.textContent = Math.random() > .4 ? '✦' : '✧';
      sp.style.left = cx + 'px'; sp.style.top = cy + 'px';
      sp.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
      sp.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
      document.body.appendChild(sp);
      sp.addEventListener('animationend', () => sp.remove());
    }
    showToast('good design is as little design as possible', '✦');
  });
}

/* ─────────────────────────────────────────────────────────
   18. EASTER EGG — Konami code
───────────────────────────────────────────────────────── */
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIdx = 0;
document.addEventListener('keydown', e => {
  konamiIdx = e.key === KONAMI[konamiIdx] ? konamiIdx + 1 : (e.key === KONAMI[0] ? 1 : 0);
  if (konamiIdx === KONAMI.length) { konamiIdx = 0; triggerPartyMode(); showToast('↑↑↓↓←→←→BA — you know the code 🕹️'); }
});

/* ─────────────────────────────────────────────────────────
   19. EASTER EGG — achievement row flash
───────────────────────────────────────────────────────── */
const achToasts = ['🎓 scholar spotted!', '🃏 design tales masterclass', '🏆 tef ignition — let\'s go!'];
document.querySelectorAll('.ach-row').forEach((row, i) => {
  row.addEventListener('click', () => {
    row.classList.remove('ach-flash'); void row.offsetWidth; row.classList.add('ach-flash');
    row.addEventListener('animationend', () => row.classList.remove('ach-flash'), { once: true });
    showToast(achToasts[i] ?? '✦ achievement scouted!');
  });
});

/* ─────────────────────────────────────────────────────────
   PROJECTS PAGE LOGIC
───────────────────────────────────────────────────────── */
const colorKeys = ['card-p1','card-p2','card-p3','card-p4','card-p5','card-p6'];
const colorMap  = { 'card-p1':['#2a4a1e','#1a2e12'],'card-p2':['#1e2a4a','#12172e'],'card-p3':['#4a1e2a','#2e1218'],'card-p4':['#2a1e4a','#1a1230'],'card-p5':['#4a3a1e','#2e251a'],'card-p6':['#1e4a3a','#122e26'] };

function showProjects(e) {
  if (e) e.preventDefault();
  document.getElementById('page-projects')?.classList.add('active');
  document.getElementById('page-single')?.classList.remove('active');
  window.scrollTo(0,0);
}
function showProject(e, num) {
  if (e) e.preventDefault();
  const c = colorKeys[num-1], [c1,c2] = colorMap[c], grad = `linear-gradient(135deg,${c1},${c2})`;
  const ids = ['single-title','hero-ph','grid-ph-1','grid-ph-2','full-ph'];
  ids.forEach(id => { const el = document.getElementById(id); if (el) { if (id==='single-title') el.textContent='PROJECT '+num; else el.style.background = id==='grid-ph-2' ? colorMap[colorKeys[(num)%6]][0] : grad; } });
  for (let i=1;i<=6;i++) document.getElementById('sl-'+i)?.classList.toggle('active',i===num);
  document.getElementById('page-projects')?.classList.remove('active');
  document.getElementById('page-single')?.classList.add('active');
  window.scrollTo(0,0);
}

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.project-card[data-proj]').forEach(card => {
    card.addEventListener('click', e => { const n = parseInt(card.dataset.proj,10); if(!isNaN(n)) showProject(e,n); });
  });
  document.querySelectorAll('.sidebar-links a[data-proj]').forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); const n = parseInt(link.dataset.proj,10); if(!isNaN(n)) showProject(e,n); });
  });
  document.querySelectorAll('a.link-show-projects').forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); showProjects(e); });
  });
});