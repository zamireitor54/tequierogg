/**
 * enhance.js
 * Capa de mejoras visuales: scroll progress, partículas, scroll reveals,
 * spotlight + tilt 3D en cards, back-to-top, divisores ornamentados,
 * intro cinematográfica, esquinas decorativas en la foto, indicador de
 * scroll-down, confetti al elegir un día, parallax sutil en el hero y
 * cursor trail con corazoncitos (desktop).
 *
 * No toca la lógica existente. Solo añade adornos visuales.
 */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function init() {
    runCinematicIntro();
    setupScrollProgress();
    if (!prefersReducedMotion) setupFloatingHearts();
    setupScrollReveals();
    setupCards();
    setupBackToTop();
    insertSectionDividers();
    decorateHeroPhoto();
    setupScrollDown();
    setupCalendarConfetti();
    if (!prefersReducedMotion) setupHeroParallax();
    if (!prefersReducedMotion && isFinePointer) setupCursorTrail();
    // === V3 additions ===
    setupTimeGreeting();
    setupTitleUnderline();
    setupHeartCounter();
    setupRotatingQuote();
    setupTabTitleAway();
    setupKonamiEasterEgg();
    setupHeroWave();
    setupSurpriseButton();
  }

  /* ====================================================
     Intro cinematográfica (una vez por sesión)
     ==================================================== */
  function runCinematicIntro() {
    try {
      if (sessionStorage.getItem('zamge-intro-seen') === '1') return;
    } catch (_e) { /* sessionStorage no disponible */ }

    const intro = document.createElement('div');
    intro.className = 'page-intro';
    intro.setAttribute('aria-hidden', 'true');
    intro.innerHTML = `
      <div class="page-intro-glow"></div>
      <div class="page-intro-card">
        <div class="page-intro-heart">💗</div>
        <div class="page-intro-text">Para ti</div>
      </div>
    `;
    document.body.appendChild(intro);
    document.body.style.overflow = 'hidden';

    // Permitir saltar con click/touch
    const skip = () => {
      intro.classList.add('is-done');
      document.body.style.overflow = '';
    };
    intro.addEventListener('click', skip);
    intro.addEventListener('touchstart', skip, { passive: true });

    window.setTimeout(() => {
      intro.classList.add('is-done');
      document.body.style.overflow = '';
    }, prefersReducedMotion ? 400 : 2200);

    window.setTimeout(() => {
      intro.remove();
      try { sessionStorage.setItem('zamge-intro-seen', '1'); } catch (_e) {}
    }, prefersReducedMotion ? 900 : 3000);
  }

  /* ====================================================
     Barra de progreso del scroll
     ==================================================== */
  function setupScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    let ticking = false;
    function update() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const ratio = total > 0 ? scrollTop / total : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* ====================================================
     Corazoncitos y sparkles flotantes (fondo)
     ==================================================== */
  function setupFloatingHearts() {
    // PERF: 16→6 en desktop, 10→3 en móvil. Duración más larga para menos
    // frames por segundo por corazón.
    const container = document.createElement('div');
    container.className = 'floating-hearts';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);

    const symbols = ['💗', '💖', '✨', '🌸', '💫', '🤍'];
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    const count = isMobile ? 3 : 6;

    for (let i = 0; i < count; i++) {
      const heart = document.createElement('span');
      heart.className = 'heart';
      heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      heart.style.setProperty('--size', `${0.7 + Math.random() * 1.1}rem`);
      heart.style.setProperty('--duration', `${28 + Math.random() * 20}s`);
      heart.style.setProperty('--delay', `${Math.random() * 30}s`);
      heart.style.setProperty('--max-opacity', `${0.12 + Math.random() * 0.12}`);
      heart.style.left = `${Math.random() * 100}%`;
      container.appendChild(heart);
    }
  }

  /* ====================================================
     Scroll reveals con IntersectionObserver
     ==================================================== */
  function setupScrollReveals() {
    if (prefersReducedMotion) return;
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    const targets = [
      ...document.querySelectorAll('.cards-section .card'),
      ...document.querySelectorAll('.extras-layout > .extra-card'),
      ...document.querySelectorAll('.extras-bottom > .extra-card'),
      ...document.querySelectorAll('.super-gallery-head'),
      ...document.querySelectorAll('.super-gallery-actions'),
      ...document.querySelectorAll('.footer'),
    ];

    targets.forEach((el, i) => {
      el.classList.add('reveal-on-scroll');
      const stagger = i % 3;
      if (stagger === 1) el.classList.add('reveal-stagger-1');
      else if (stagger === 2) el.classList.add('reveal-stagger-2');
      observer.observe(el);
    });
  }

  /* ====================================================
     Cards: spotlight + tilt 3D combinados
     ==================================================== */
  function setupCards() {
    const cards = document.querySelectorAll('.cards-section .card');
    cards.forEach((card) => {
      let raf;

      const onMove = (e) => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const cx = rect.width / 2;
          const cy = rect.height / 2;

          // Spotlight (siempre)
          card.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
          card.style.setProperty('--my', `${(y / rect.height) * 100}%`);

          // Tilt 3D solo en desktop sin reduced motion
          if (isFinePointer && !prefersReducedMotion) {
            const dx = (x - cx) / cx;
            const dy = (y - cy) / cy;
            const tiltMax = 4.5;
            const ry = dx * tiltMax;
            const rx = -dy * tiltMax;
            card.style.transform =
              `perspective(1100px) translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg)`;
          }
        });
      };

      const onLeave = () => {
        if (raf) cancelAnimationFrame(raf);
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
        card.style.transform = '';
      };

      card.addEventListener('mousemove', onMove, { passive: true });
      card.addEventListener('mouseleave', onLeave);
    });
  }

  /* ====================================================
     Botón "Volver arriba"
     ==================================================== */
  function setupBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.type = 'button';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Volver arriba');
    btn.setAttribute('title', 'Volver arriba');
    document.body.appendChild(btn);

    let ticking = false;
    function toggle() {
      btn.classList.toggle('is-visible', window.scrollY > 420);
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(toggle);
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
    toggle();
  }

  /* ====================================================
     Divisores ornamentados con SVG entre secciones
     ==================================================== */
  function insertSectionDividers() {
    function makeDivider(icon) {
      const wrap = document.createElement('div');
      wrap.className = 'section-divider ornate-divider';
      wrap.setAttribute('aria-hidden', 'true');
      wrap.innerHTML = `
        <svg class="ornate-divider-line ornate-divider-line--left" viewBox="0 0 100 14" preserveAspectRatio="none">
          <path d="M0,7 Q15,2 30,7 T60,7 T100,7" />
        </svg>
        <span class="section-divider-icon">${icon}</span>
        <svg class="ornate-divider-line ornate-divider-line--right" viewBox="0 0 100 14" preserveAspectRatio="none">
          <path d="M0,7 Q15,12 30,7 T60,7 T100,7" />
        </svg>
      `;
      return wrap;
    }

    const cardsSection = document.querySelector('.cards-section');
    const extras = document.querySelector('.extras-layout');
    const superGallery = document.querySelector('.super-gallery');

    if (cardsSection?.parentNode) {
      cardsSection.parentNode.insertBefore(makeDivider('💌'), cardsSection);
    }
    if (extras?.parentNode) {
      extras.parentNode.insertBefore(makeDivider('🗓️'), extras);
    }
    if (superGallery?.parentNode) {
      superGallery.parentNode.insertBefore(makeDivider('📸'), superGallery);
    }
  }

  /* ====================================================
     Esquinas decorativas en la foto del hero
     ==================================================== */
  function decorateHeroPhoto() {
    const photo = document.querySelector('.hero-photo');
    if (!photo) return;

    ['tl', 'tr', 'bl', 'br'].forEach((pos, i) => {
      const corner = document.createElement('span');
      corner.className = `photo-corner photo-corner-${pos}`;
      corner.style.animationDelay = `${1.4 + i * 0.12}s`;
      corner.setAttribute('aria-hidden', 'true');
      photo.appendChild(corner);
    });
  }

  /* ====================================================
     Indicador de "bajar para ver más" debajo del hero
     ==================================================== */
  function setupScrollDown() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const btn = document.createElement('button');
    btn.className = 'scroll-down';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Bajar para ver más');
    btn.setAttribute('title', 'Bajar');
    btn.innerHTML = '<span class="scroll-down-icon">↓</span>';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      const next = hero.nextElementSibling
        || document.querySelector('.cards-section')
        || document.querySelector('main');
      if (next?.scrollIntoView) {
        next.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    });

    let ticking = false;
    function toggle() {
      btn.classList.toggle('is-hidden', window.scrollY > 220);
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(toggle);
        ticking = true;
      }
    }, { passive: true });
    toggle();
  }

  /* ====================================================
     Confetti al hacer click en un día del calendario
     ==================================================== */
  function setupCalendarConfetti() {
    function spawnConfetti(x, y) {
      const colors = ['#ff6fbf', '#7c49ff', '#ff9eca', '#c46cff', '#ffd6ec', '#ffffff'];
      const count = 16;
      for (let i = 0; i < count; i++) {
        const p = document.createElement('span');
        p.className = 'confetti-particle';
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
        const dist = 50 + Math.random() * 70;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist - 24;
        p.style.setProperty('--tx', `${tx}px`);
        p.style.setProperty('--ty', `${ty}px`);
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        p.style.background = colors[i % colors.length];
        p.style.animationDelay = `${Math.random() * 0.08}s`;
        document.body.appendChild(p);
        window.setTimeout(() => p.remove(), 1200);
      }
    }

    // Delegación en el grid: dispara al hacer click en cualquier día disponible
    document.addEventListener('click', (e) => {
      const day = e.target.closest && e.target.closest('.calendar-day.available');
      if (!day) return;
      if (day.classList.contains('locked')) return;
      const rect = day.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      spawnConfetti(x, y);
    }, { passive: true });
  }

  /* ====================================================
     Parallax sutil en la foto del hero al hacer scroll
     ==================================================== */
  function setupHeroParallax() {
    const figure = document.querySelector('.hero-photo');
    if (!figure) return;

    let ticking = false;
    function update() {
      const rect = figure.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        ticking = false;
        return;
      }
      const scrollY = window.scrollY;
      const offset = Math.min(40, scrollY * 0.06);
      figure.style.transform = `translateY(${offset}px)`;
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ====================================================
     Cursor trail (corazoncitos siguiendo el mouse)
     ==================================================== */
  function setupCursorTrail() {
    // PERF: throttle mucho más agresivo (250ms + 30% probabilidad).
    // Antes: 110ms + 45% = ~4 corazones/segundo si mueves el mouse rápido.
    // Ahora: 250ms + 30% = ~1.2 corazones/segundo máximo.
    const symbols = ['💗', '✨', '💖'];
    let lastTime = 0;
    const minDelay = 250;

    document.addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const now = performance.now();
      if (now - lastTime < minDelay) return;
      lastTime = now;
      if (Math.random() > 0.30) return;

      const heart = document.createElement('span');
      heart.className = 'cursor-heart';
      heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      heart.style.left = `${e.clientX}px`;
      heart.style.top = `${e.clientY}px`;
      heart.style.fontSize = `${0.65 + Math.random() * 0.45}rem`;
      document.body.appendChild(heart);
      window.setTimeout(() => heart.remove(), 1000);
    }, { passive: true });
  }

  /* ====================================================
     V3.1 · Saludo según la hora (encima del subtítulo)
     ==================================================== */
  function setupTimeGreeting() {
    const heroContent = document.querySelector('.hero-content');
    const subtitle = heroContent?.querySelector('.subtitle');
    if (!heroContent || !subtitle) return;

    const h = new Date().getHours();
    let text, emoji;
    if (h < 6)       { text = 'Buenas madrugadas';  emoji = '🌙'; }
    else if (h < 12) { text = 'Buenos días';        emoji = '☀️'; }
    else if (h < 19) { text = 'Buenas tardes';      emoji = '🌸'; }
    else             { text = 'Buenas noches';      emoji = '✨'; }

    const greet = document.createElement('div');
    greet.className = 'time-greeting';
    greet.innerHTML = `<span class="time-greeting-emoji" aria-hidden="true">${emoji}</span><span>${text}, mi niña</span>`;
    // Insertar antes del título (h1.title) si existe, sino antes del subtitle
    const title = heroContent.querySelector('.title');
    if (title?.parentNode) {
      title.parentNode.insertBefore(greet, title);
    } else {
      subtitle.parentNode.insertBefore(greet, subtitle);
    }
  }

  /* ====================================================
     V3.2 · Subrayado decorativo bajo el título del hero
     ==================================================== */
  function setupTitleUnderline() {
    const title = document.querySelector('.hero-content .title');
    if (!title) return;
    if (title.nextElementSibling?.classList?.contains('title-underline')) return;
    const u = document.createElement('span');
    u.className = 'title-underline';
    u.setAttribute('aria-hidden', 'true');
    title.insertAdjacentElement('afterend', u);
  }

  /* ====================================================
     V3.3 · Contador persistente de "toques" en la foto
     ==================================================== */
  function setupHeartCounter() {
    const photo = document.querySelector('.hero-photo');
    const img = photo?.querySelector('#main-photo');
    if (!photo || !img) return;

    const KEY = 'zamge-heart-touches';
    let count = 0;
    try { count = Number(localStorage.getItem(KEY) || '0') || 0; } catch (_e) {}

    const badge = document.createElement('div');
    badge.className = 'heart-counter';
    badge.setAttribute('aria-hidden', 'true');
    badge.innerHTML = `
      <span class="heart-counter-icon">💗</span>
      <span class="heart-counter-num">${count}</span>
    `;
    photo.appendChild(badge);

    const numEl = badge.querySelector('.heart-counter-num');

    img.addEventListener('click', () => {
      count++;
      try { localStorage.setItem(KEY, String(count)); } catch (_e) {}
      numEl.textContent = String(count);
      badge.classList.remove('is-bumping');
      void badge.offsetWidth;
      badge.classList.add('is-bumping');
    });
  }

  /* ====================================================
     V3.4 · Cita romántica rotante en el footer
     ==================================================== */
  function setupRotatingQuote() {
    const footer = document.querySelector('.footer');
    if (!footer) return;
    const paragraphs = footer.querySelectorAll('p');
    if (!paragraphs.length) return;

    const quotes = [
      'Eres mi parte favorita de cada día.',
      'Contigo, hasta lo simple se siente bonito.',
      'Mi lugar favorito es a tu lado.',
      'Te quiero hoy, mañana y siempre.',
      'Cada momento contigo es un regalo.',
      'Tú haces que todo brille más.',
      'En tus ojos encontré mi hogar.',
      'Eres mi razón favorita de sonreír.',
      'Hasta el silencio contigo suena bonito.',
      'Mi corazón te eligió sin pensarlo dos veces.',
      'Eres ese pensamiento que siempre vuelve.',
      'Contigo, el tiempo no se mide igual.',
    ];

    const quoteEl = document.createElement('p');
    quoteEl.className = 'rotating-quote';
    quoteEl.setAttribute('aria-live', 'polite');
    paragraphs[0].insertAdjacentElement('afterend', quoteEl);

    let idx = Math.floor(Math.random() * quotes.length);
    function show() {
      quoteEl.classList.remove('is-visible');
      window.setTimeout(() => {
        quoteEl.textContent = quotes[idx % quotes.length];
        quoteEl.classList.add('is-visible');
        idx++;
      }, 420);
    }

    show();
    window.setInterval(show, 8000);
  }

  /* ====================================================
     V3.5 · Pulso del título de pestaña cuando no está activa
     ==================================================== */
  function setupTabTitleAway() {
    const original = document.title;
    const awayTitles = [
      '💗 Vuelve, mi niña 💗',
      '✨ Te extraño ✨',
      '🌸 Mírame cuando puedas',
      '💖 No me olvides',
    ];
    let interval = null;
    let i = 0;

    function stop() {
      if (interval) clearInterval(interval);
      interval = null;
      document.title = original;
    }

    function start() {
      stop();
      i = 0;
      document.title = awayTitles[i % awayTitles.length];
      i++;
      interval = window.setInterval(() => {
        document.title = awayTitles[i % awayTitles.length];
        i++;
      }, 2200);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) start();
      else stop();
    });
  }

  /* ====================================================
     V3.6 · Easter egg Konami: ↑↑↓↓←→←→ b a → lluvia de corazones
     ==================================================== */
  function setupKonamiEasterEgg() {
    const seq = [
      'ArrowUp', 'ArrowUp',
      'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight',
      'ArrowLeft', 'ArrowRight',
      'b', 'a',
    ];
    let pos = 0;
    let lastTime = 0;

    document.addEventListener('keydown', (e) => {
      if (typeof e.key !== 'string' || e.key.length === 0) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const now = performance.now();
      // Si pasaron más de 3s desde la última tecla, reinicia
      if (now - lastTime > 3000) pos = 0;
      lastTime = now;

      if (key === seq[pos]) {
        pos++;
        if (pos === seq.length) {
          pos = 0;
          triggerHeartRain();
        }
      } else if (key === seq[0]) {
        pos = 1;
      } else {
        pos = 0;
      }
    });
  }

  function triggerHeartRain() {
    const symbols = ['💗', '💖', '💕', '✨', '🌸', '💫', '🤍'];
    const total = 70;
    for (let i = 0; i < total; i++) {
      window.setTimeout(() => {
        const heart = document.createElement('span');
        heart.className = 'rain-heart';
        heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.fontSize = `${0.85 + Math.random() * 1.4}rem`;
        heart.style.setProperty('--duration', `${2.4 + Math.random() * 3}s`);
        document.body.appendChild(heart);
        window.setTimeout(() => heart.remove(), 5500);
      }, i * 55);
    }

    // Toast central "¡Te amo!"
    const toast = document.createElement('div');
    toast.className = 'easter-toast';
    toast.textContent = '¡Te amo! 💗';
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 3800);
  }

  /* ====================================================
     V3.7 · Onda SVG decorativa al pie del hero
     ==================================================== */
  function setupHeroWave() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    if (hero.querySelector('.hero-wave')) return;

    const wave = document.createElement('div');
    wave.className = 'hero-wave';
    wave.setAttribute('aria-hidden', 'true');
    wave.innerHTML = `
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
        <defs>
          <linearGradient id="zamge-hero-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stop-color="#ff6fbf" stop-opacity="0.22"/>
            <stop offset="50%" stop-color="#c46cff" stop-opacity="0.26"/>
            <stop offset="100%" stop-color="#7c49ff" stop-opacity="0.22"/>
          </linearGradient>
        </defs>
        <path class="hero-wave-path"
          d="M0,40 Q180,80 360,40 T720,40 T1080,40 T1440,40 L1440,80 L0,80 Z"
          fill="url(#zamge-hero-wave)"/>
      </svg>
    `;
    hero.appendChild(wave);
  }

  /* ====================================================
     V3.8 · Botón "Sorpresa" en el hero (mensaje aleatorio)
     ==================================================== */
  function setupSurpriseButton() {
    const actions = document.querySelector('.hero-actions');
    if (!actions) return;
    if (actions.querySelector('.surprise-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'surprise-btn';
    btn.type = 'button';
    btn.innerHTML = `<span class="surprise-btn-emoji" aria-hidden="true">✨</span><span>Sorpréndeme</span>`;
    actions.appendChild(btn);

    btn.addEventListener('click', () => showSurprise());
  }

  function showSurprise() {
    // Mezcla de los arrays de mensajes ya existentes
    let pool = [];
    try {
      const m = window.messagesModule;
      if (m) {
        if (Array.isArray(m.loveNotes))        pool = pool.concat(m.loveNotes);
        if (Array.isArray(m.birthdayMessages)) pool = pool.concat(m.birthdayMessages);
        if (Array.isArray(m.hundredReasons))   pool = pool.concat(m.hundredReasons);
      }
    } catch (_e) { /* noop */ }

    const fallback = [
      'Eres lo mejor que me ha pasado.',
      'Te elijo, hoy y siempre.',
      'Contigo cualquier día se vuelve especial.',
      'Eres mi favorita, en serio.',
    ];
    const list = pool.length ? pool : fallback;
    const text = list[Math.floor(Math.random() * list.length)];

    const overlay = document.createElement('div');
    overlay.className = 'surprise-popup';
    overlay.innerHTML = `
      <div class="surprise-card" role="dialog" aria-modal="true" aria-label="Sorpresa">
        <button class="surprise-card-x" type="button" aria-label="Cerrar">✕</button>
        <div class="surprise-card-eyebrow">Sorpresa para ti</div>
        <div class="surprise-card-heart" aria-hidden="true">💗</div>
        <p class="surprise-card-text">${escapeHtml(text)}</p>
        <button class="surprise-card-close" type="button">Gracias 💗</button>
      </div>
    `;
    document.body.appendChild(overlay);

    function close() {
      overlay.classList.add('is-closing');
      window.setTimeout(() => overlay.remove(), 300);
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    overlay.querySelector('.surprise-card-x')?.addEventListener('click', close);
    overlay.querySelector('.surprise-card-close')?.addEventListener('click', close);

    function onKey(ev) {
      if (ev.key === 'Escape') {
        close();
        document.removeEventListener('keydown', onKey);
      }
    }
    document.addEventListener('keydown', onKey);
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[m]));
  }

  /* ====================================================
     Init
     ==================================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
