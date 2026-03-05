/* Behaviour.js - moved from inline <script> in index.html */

// Scroll progress bar, custom cursor, and other page behaviors

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
     2. CUSTOM CURSOR
  ───────────────────────────────────────────────────────── */
  const dot  = document.getElementById('cur-dot');
  const ring = document.getElementById('cur-ring');
  let mx=0, my=0, rx=0, ry=0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });
  (function tick() {
    rx += (mx - rx) * .11;
    ry += (my - ry) * .11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(tick);
  })();

  function cursorEnter() {
    dot.style.transform    = 'translate(-50%,-50%) scale(2.2)';
    dot.style.background   = 'var(--purple)';
    ring.style.width       = '54px';
    ring.style.height      = '54px';
    ring.style.borderColor = 'rgba(192,132,252,.4)';
  }
  function cursorLeave() {
    dot.style.transform    = 'translate(-50%,-50%) scale(1)';
    dot.style.background   = 'var(--lime)';
    ring.style.width       = '34px';
    ring.style.height      = '34px';
    ring.style.borderColor = 'rgba(184,240,74,.45)';
  }
  document.querySelectorAll('a, button, .btn, .ach-row, .proj-card, .carousel-viewport, .carousel-dot')
    .forEach(el => {
      el.addEventListener('mouseenter', cursorEnter);
      el.addEventListener('mouseleave', cursorLeave);
    });

  /* ─────────────────────────────────────────────────────────
     3. SCROLL REVEAL
  ───────────────────────────────────────────────────────── */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ─────────────────────────────────────────────────────────
     4. PARALLAX  (vertical + marquee horizontal)
  ───────────────────────────────────────────────────────── */
  const parallaxLayers  = [...document.querySelectorAll('.parallax-layer[data-speed]')];
  const marqueeParallax = [...document.querySelectorAll('[data-parallax-x]')];
  let scrollY = 0;
  let rafPending = false;

  function applyParallax() {
    rafPending = false;
    parallaxLayers.forEach(el => {
      const speed  = parseFloat(el.dataset.speed) || 0;
      el.style.transform = `translateY(${-scrollY * speed}px)`;
    });
    marqueeParallax.forEach(el => {
      const rect     = el.getBoundingClientRect();
      const dist     = (rect.top + rect.height / 2) - window.innerHeight / 2;
      const speed    = parseFloat(el.dataset.parallaxX) || 0;
      el.style.transform = `translateX(${dist * speed}px)`;
    });
  }

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    if (!rafPending) { rafPending = true; requestAnimationFrame(applyParallax); }
  }, { passive: true });
  applyParallax();

  /* ─────────────────────────────────────────────────────────
     5. HERO AMBIENT ORBS  (mouse-reactive)
  ───────────────────────────────────────────────────────── */
  const orbs = [
    document.getElementById('orb1'),
    document.getElementById('orb2'),
    document.getElementById('orb3'),
  ];
  // Each orb drifts at a different speed factor
  const orbFactors = [22, 14, 9];
  let orbRaf = false;
  let orbX = 0, orbY = 0;

  document.addEventListener('mousemove', e => {
    orbX = e.clientX / window.innerWidth  - 0.5;
    orbY = e.clientY / window.innerHeight - 0.5;
    if (!orbRaf) {
      orbRaf = true;
      requestAnimationFrame(() => {
        orbs.forEach((orb, i) => {
          orb.style.transform =
            `translate(${orbX * orbFactors[i]}px, ${orbY * orbFactors[i]}px)`;
        });
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
  const dots   = [...document.querySelectorAll('.carousel-dot')];
  let current  = 0;
  let carouselTimer = null;

  function goToSlide(next) {
    const prev = current;
    if (next === prev) return;

    slides[prev].classList.remove('active');
    slides[prev].classList.add('exit');
    slides[prev].addEventListener('transitionend', function h() {
      slides[prev].classList.remove('exit');
      slides[prev].removeEventListener('transitionend', h);
    });

    slides[next].classList.add('active');
    current = next;

    dots.forEach((d, i) => {
      if (i < next) {
        d.classList.remove('active'); d.classList.add('done');
      } else if (i === next) {
        d.classList.remove('done', 'active');
        void d.offsetWidth; // force reflow
        d.classList.add('active');
      } else {
        d.classList.remove('active', 'done');
      }
    });
  }

  function startTimer() {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => goToSlide((current + 1) % slides.length), DURATION);
  }

  dots.forEach((d, i) => d.addEventListener('click', () => { goToSlide(i); startTimer(); }));

  const cViewport = document.querySelector('.carousel-viewport');
  cViewport.addEventListener('mouseenter', () => clearInterval(carouselTimer));
  cViewport.addEventListener('mouseleave', () => startTimer());

  setTimeout(() => { goToSlide(1); startTimer(); }, 3000);

  /* ─────────────────────────────────────────────────────────
     7. 3D TILT ON PROJECT CARDS
  ───────────────────────────────────────────────────────── */
  document.querySelectorAll('.proj-card').forEach(card => {
    const isCircle = card.classList.contains('circle');
    const maxTilt  = isCircle ? 6 : 10;

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'box-shadow .32s ease, border-color .3s ease';
    });
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left)  / r.width  - 0.5; // -0.5 → 0.5
      const y  = (e.clientY - r.top)   / r.height - 0.5;
      card.style.transform =
        `perspective(700px) rotateY(${x * maxTilt * 2}deg) rotateX(${-y * maxTilt * 2}deg) scale(1.04)`;
     
      const inner = card.querySelector('.proj-card-inner');
        inner.style.transform =
          `rotateY(${x * maxTilt * 2}deg)
          rotateX(${-y * maxTilt * 2}deg)
          scale(1.04)
          translateZ(0)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition =
        'transform .55s cubic-bezier(.34,1.2,.64,1), box-shadow .32s ease, border-color .3s ease';
      card.style.transform = 'perspective(700px) rotateY(0) rotateX(0) scale(1)';
    });
  });

  /* ─────────────────────────────────────────────────────────
     8. MAGNETIC BUTTONS
  ───────────────────────────────────────────────────────── */
  document.querySelectorAll('.btn-lime, .btn-purple').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform .1s ease, box-shadow .28s ease';
    });
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dx = (e.clientX - cx) * 0.3;
      const dy = (e.clientY - cy) * 0.3;
      btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.07)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform .45s cubic-bezier(.34,1.56,.64,1), box-shadow .28s ease';
      btn.style.transform  = '';
    });
  });

  /* ─────────────────────────────────────────────────────────
     9. PROJECT MODAL
  ───────────────────────────────────────────────────────── */
  const projectData = {
    'art-for-all': {
      title: 'Art For All',
      tag:   'Erasmus+',
      desc:  'An inclusive approach to art, bridging accessibility and creativity through an Erasmus+ partnership. The project explores how design can lower barriers to cultural participation for people of all abilities.',
      img:   'images/artforall.png',
      index: '01 / 06',
    },
    'design-tales': {
      title: 'Design Tales',
      tag:   'Gamification',
      desc:  'A card game that makes learning design history engaging and tactile. Players explore movements, icons, and pivotal moments through storytelling mechanics that blend trivia with narrative.',
      img:   'images/designtales.png',
      index: '02 / 06',
    },
    'useless-box': {
      title: 'Useless Box',
      tag:   'Arduino / Play',
      desc:  'An Arduino-based machine whose only purpose is to turn itself off — a gentle provocation on the nature of usefulness. Part product, part performance art.',
      img:   'images/uselessbox.png',
      index: '03 / 06',
    },
    'uomo-in-blue': {
      title: "L'Uomo in Blue",
      tag:   'Portrait',
      desc:  'A painted portrait exploring identity, colour, and the emotional weight of blue. A personal artistic statement that lives outside the boundaries of digital design.',
      img:   "images/l'uomoinblue.jpeg",
      index: '04 / 06',
    },
    'interactive-vr': {
      title: 'Interactive VR',
      tag:   'VR / Accessibility',
      desc:  'An immersive VR environment built in collaboration with ASPOC, designed to improve cognitive skills in students through spatial interaction, visual stimuli, and play-based learning.',
      img:   'images/VVr.png',
      index: '05 / 06',
    },
    'micro-instrument': {
      title: 'Micro-instrument',
      tag:   'Microbit',
      desc:  'A Microbit-based project that translates body movement into sound — turning the user into a living instrument. Explores the intersection of physical computing, education, and musical expression.',
      img:   'images/micro c.jpeg',
      index: '06 / 06',
    },
  };

  const modal       = document.getElementById('project-modal');
  const modalTitle  = document.getElementById('modal-title');
  const modalTag    = document.getElementById('modal-tag');
  const modalDesc   = document.getElementById('modal-desc');
  const modalImg    = document.getElementById('modal-img');
  const modalIndex  = document.getElementById('modal-index');

  function openModal(key) {
    const data = projectData[key];
    if (!data) return;
    modalTitle.textContent = data.title;
    modalTag.textContent   = data.tag;
    modalDesc.textContent  = data.desc;
    modalIndex.textContent = data.index;
    modalImg.src           = data.img || '';
    modalImg.style.display = data.img ? 'block' : 'none';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  window.closeModal = function() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.proj-card[data-project]').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.project));
  });
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ─────────────────────────────────────────────────────────
     10. LETTER SCRAMBLE  (hero title on page load)
  ───────────────────────────────────────────────────────── */
  function scrambleTitle() {
    const el    = document.querySelector('.hero-title');
    const lines = ["Hi, I'm Frida", "A IXD Design", "Student"];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789✦@#%';
    let   frame = 0;
    const TOTAL = 70; // ~1.5 s at 60 fps

    const id = setInterval(() => {
      frame++;
      const p = frame / TOTAL;

      const html = lines.map((line, li) => {
        // Each line starts revealing at staggered progress
        const lineP = Math.max(0, (p * 1.6) - li * 0.28);
        return line.split('').map((ch, ci) => {
          if (ch === ' ' || ch === "'" || ch === ',') return ch;
          // Reveal left → right
          return ci / line.length < lineP
            ? ch
            : chars[Math.floor(Math.random() * chars.length)];
        }).join('');
      }).join('<br>');

      el.innerHTML = html;

      if (frame >= TOTAL) {
        clearInterval(id);
        el.innerHTML = lines.join('<br>');
      }
    }, 16);
  }

  window.addEventListener('load', () => setTimeout(scrambleTitle, 350));

  /* ─────────────────────────────────────────────────────────
     11. CLICK RIPPLE  (every click anywhere)
  ───────────────────────────────────────────────────────── */
  document.addEventListener('click', e => {
    // Don't ripple inside the modal
    if (e.target.closest('#project-modal')) return;
    const r = document.createElement('div');
    r.className       = 'click-ripple';
    r.style.left      = e.clientX + 'px';
    r.style.top       = e.clientY + 'px';
    document.body.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  });

/* ─────────────────────────────────────────────────────────
   12. PROJECTS PAGE LOGIC (moved from projects.html)
──────────────────────────────────────────────────────── */
const colors = ['card-p1','card-p2','card-p3','card-p4','card-p5','card-p6'];
const colorMap = {
  'card-p1': ['#2a4a1e','#1a2e12'],
  'card-p2': ['#1e2a4a','#12172e'],
  'card-p3': ['#4a1e2a','#2e1218'],
  'card-p4': ['#2a1e4a','#1a1230'],
  'card-p5': ['#4a3a1e','#2e251a'],
  'card-p6': ['#1e4a3a','#122e26'],
};

function showProjects(e) {
  if(e) e.preventDefault();
  document.getElementById('page-projects').classList.add('active');
  document.getElementById('page-single').classList.remove('active');
  window.scrollTo(0,0);
}

function showProject(e, num) {
  if(e) e.preventDefault();
  const c = colors[num-1];
  const [c1, c2] = colorMap[c];
  const grad = `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;

  const singleTitle = document.getElementById('single-title');
  if (singleTitle) singleTitle.textContent = 'PROJECT ' + num;
  const heroPh = document.getElementById('hero-ph');
  if (heroPh) heroPh.style.background = grad;
  const gridPh1 = document.getElementById('grid-ph-1');
  if (gridPh1) gridPh1.style.background = grad;
  const gridPh2 = document.getElementById('grid-ph-2');
  if (gridPh2) gridPh2.style.background = colorMap[colors[(num)%6]][0];
  const fullPh = document.getElementById('full-ph');
  if (fullPh) fullPh.style.background = grad;

  // update sidebar active
  for(let i=1;i<=6;i++){
    const el = document.getElementById('sl-'+i);
    if (el) el.classList.toggle('active', i===num);
  }

  document.getElementById('page-projects')?.classList.remove('active');
  document.getElementById('page-single')?.classList.add('active');
  window.scrollTo(0,0);
}

// wire up page-specific controls after DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.project-card[data-proj]').forEach(card => {
    card.addEventListener('click', e => {
      const n = parseInt(card.dataset.proj, 10);
      if (!isNaN(n)) showProject(e, n);
    });
  });

  document.querySelectorAll('.sidebar-links a[data-proj]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const n = parseInt(link.dataset.proj, 10);
      if (!isNaN(n)) showProject(e, n);
    });
  });

  document.querySelectorAll('a.link-show-projects').forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); showProjects(e); });
  });
});

