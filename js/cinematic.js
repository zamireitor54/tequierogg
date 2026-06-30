/**
 * cinematic.js
 * Capa premium de interactividad. Se carga después de enhance.js.
 * Añade:
 *  - Cursor custom (desktop, puntero fino)
 *  - Botones magnéticos + ripple
 *  - Reveal del título por letras
 *  - Capa de shine en las cards
 *  - Lazy/blur-up en imágenes de la galería
 *  - Easter egg: escribir "teamo" dispara fireworks
 *
 * Nada de aquí cambia la lógica existente. Si algo falla,
 * los bloques son independientes (try/catch en init).
 */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  function safe(fn, label) {
    try { fn(); } catch (err) { console.warn('[cinematic] fallo en', label, err); }
  }

  function init() {
    safe(splitTitleIntoLetters, 'title-split');
    safe(injectCardShine, 'card-shine');
    safe(setupMagneticButtons, 'magnetic-buttons');
    safe(setupButtonRipple, 'button-ripple');
    safe(setupLazyGalleryImages, 'lazy-images');
    safe(setupEasterEgg, 'easter-egg');
    if (isFinePointer && !prefersReducedMotion) {
      safe(setupCustomCursor, 'custom-cursor');
    }
  }

  /* ====================================================
     1. Título por letras (con stagger)
     ==================================================== */
  function splitTitleIntoLetters() {
    const title = document.querySelector('.hero .title');
    if (!title || title.dataset.cinSplit === '1') return;

    const text = title.textContent.trim();
    if (!text) return;

    const fragment = document.createDocumentFragment();
    let visibleIndex = 0;

    for (const char of text) {
      const span = document.createElement('span');
      span.className = 'cin-letter';
      if (char === ' ') {
        span.classList.add('cin-space');
        span.innerHTML = '&nbsp;';
        span.style.animationDelay = `${0.45 + visibleIndex * 0.035}s`;
      } else {
        span.textContent = char;
        span.style.animationDelay = `${0.45 + visibleIndex * 0.035}s`;
        visibleIndex += 1;
      }
      fragment.appendChild(span);
    }

    title.textContent = '';
    title.appendChild(fragment);
    title.dataset.cinSplit = '1';
  }

  /* ====================================================
     2. Capa de "shine" dentro de cada card
     ==================================================== */
  function injectCardShine() {
    const cards = document.querySelectorAll('.cards-section .card');
    cards.forEach((card) => {
      if (card.querySelector('.card-shine')) return;
      const shine = document.createElement('span');
      shine.className = 'card-shine';
      shine.setAttribute('aria-hidden', 'true');
      card.appendChild(shine);
    });
  }

  /* ====================================================
     3. Botones magnéticos (solo desktop)
     ==================================================== */
  function setupMagneticButtons() {
    if (!isFinePointer || prefersReducedMotion) return;

    const selector = [
      '.hero-actions .btn',
      '#btn-open-upload',
      '.back-to-top'
    ].join(',');

    const buttons = document.querySelectorAll(selector);
    const STRENGTH = 12; // px

    buttons.forEach((btn) => {
      let raf;
      const handleMove = (event) => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rect = btn.getBoundingClientRect();
          const x = event.clientX - (rect.left + rect.width / 2);
          const y = event.clientY - (rect.top + rect.height / 2);
          const distX = Math.max(-1, Math.min(1, x / rect.width));
          const distY = Math.max(-1, Math.min(1, y / rect.height));
          btn.style.setProperty('--cin-mx', `${distX * STRENGTH}px`);
          btn.style.setProperty('--cin-my', `${distY * STRENGTH}px`);
        });
      };

      const reset = () => {
        if (raf) cancelAnimationFrame(raf);
        btn.style.removeProperty('--cin-mx');
        btn.style.removeProperty('--cin-my');
      };

      btn.addEventListener('mousemove', handleMove);
      btn.addEventListener('mouseleave', reset);
    });
  }

  /* ====================================================
     4. Ripple al hacer click en cualquier .btn
     ==================================================== */
  function setupButtonRipple() {
    document.addEventListener('click', (event) => {
      const btn = event.target.closest && event.target.closest('.btn');
      if (!btn) return;
      if (btn.disabled) return;

      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'cin-ripple';
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      btn.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 720);
    }, { passive: true });
  }

  /* ====================================================
     5. Lazy / blur-up en imágenes de la galería
     ==================================================== */
  function setupLazyGalleryImages() {
    if (!('IntersectionObserver' in window)) return;

    const markImage = (img) => {
      if (!img || img.dataset.cinLazy === '1') return;
      img.dataset.cinLazy = '1';
      img.classList.add('cin-lazy');
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('cin-loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('cin-loaded'), { once: true });
        img.addEventListener('error', () => img.classList.add('cin-loaded'), { once: true });
      }
    };

    // Marcar las que ya existen
    document.querySelectorAll('.sg-item img').forEach(markImage);

    // Observar nuevas (la galería renderiza async)
    const grid = document.getElementById('super-gallery-grid');
    if (!grid) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mut) => {
        mut.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches?.('.sg-item img')) markImage(node);
          node.querySelectorAll?.('.sg-item img').forEach(markImage);
        });
      });
    });

    observer.observe(grid, { childList: true, subtree: true });
  }

  /* ====================================================
     6. Cursor custom (blob + dot) en desktop
     ==================================================== */
  function setupCustomCursor() {
    if (isCoarsePointer) return;

    const cursor = document.createElement('div');
    cursor.className = 'cin-cursor';
    cursor.setAttribute('aria-hidden', 'true');

    const dot = document.createElement('div');
    dot.className = 'cin-cursor-dot';
    dot.setAttribute('aria-hidden', 'true');

    document.body.appendChild(cursor);
    document.body.appendChild(dot);
    document.body.classList.add('cin-cursor-on');

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let blobX = targetX;
    let blobY = targetY;
    let dotX = targetX;
    let dotY = targetY;
    let activated = false;

    const HOVERABLE = 'a, button, .btn, .notes-fab, .calendar-day.available, .sg-item, .notes-tab, [role="button"], input, textarea, select, label';

    document.addEventListener('mousemove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!activated) {
        activated = true;
        cursor.classList.add('is-active');
        dot.classList.add('is-active');
      }
    });

    document.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-active');
      dot.classList.remove('is-active');
      activated = false;
    });

    document.addEventListener('mousedown', () => cursor.classList.add('is-pressed'));
    document.addEventListener('mouseup', () => cursor.classList.remove('is-pressed'));

    document.addEventListener('mouseover', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(HOVERABLE)) {
        cursor.classList.add('is-hover');
      } else {
        cursor.classList.remove('is-hover');
      }
    });

    function loop() {
      // Blob: easing más lento
      blobX += (targetX - blobX) * 0.18;
      blobY += (targetY - blobY) * 0.18;
      // Dot: easing más rápido
      dotX += (targetX - dotX) * 0.55;
      dotY += (targetY - dotY) * 0.55;

      cursor.style.transform = `translate3d(${blobX}px, ${blobY}px, 0) translate(-50%, -50%)`;
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ====================================================
     7. Easter egg: escribir "teamo" o "geral" → fireworks
     ==================================================== */
  function setupEasterEgg() {
    const triggers = {
      teamo: '💗 Yo más, mi niña 💗',
      geral: '✨ Hola hermosa ✨',
      love:  '💖 Para siempre 💖'
    };
    const triggerKeys = Object.keys(triggers);
    let buffer = '';

    document.addEventListener('keydown', (event) => {
      const tag = (event.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.length !== 1) return;

      buffer = (buffer + event.key.toLowerCase()).slice(-12);

      for (const key of triggerKeys) {
        if (buffer.endsWith(key)) {
          buffer = '';
          launchFireworks(triggers[key]);
          break;
        }
      }
    });
  }

  function launchFireworks(message) {
    if (prefersReducedMotion) return;

    const layer = document.createElement('div');
    layer.className = 'cin-fireworks';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    const palette = ['#ff6fbf', '#7c49ff', '#ff85c0', '#c46cff', '#ffd6ec', '#ffd1e8'];
    const bursts = 5;

    for (let b = 0; b < bursts; b++) {
      window.setTimeout(() => spawnBurst(layer, palette), b * 280);
    }

    if (message) {
      const note = document.createElement('div');
      note.className = 'cin-love-message';
      note.textContent = message;
      document.body.appendChild(note);
      window.setTimeout(() => note.remove(), 2700);
    }

    window.setTimeout(() => layer.remove(), bursts * 280 + 2000);
  }

  function spawnBurst(layer, palette) {
    const cx = (0.2 + Math.random() * 0.6) * window.innerWidth;
    const cy = (0.2 + Math.random() * 0.5) * window.innerHeight;
    const count = 26;
    const baseRadius = 140 + Math.random() * 80;
    const color = palette[Math.floor(Math.random() * palette.length)];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.25;
      const radius = baseRadius * (0.6 + Math.random() * 0.6);
      const fx = Math.cos(angle) * radius;
      const fy = Math.sin(angle) * radius + Math.random() * 30;

      const particle = document.createElement('span');
      particle.className = 'cin-firework-particle';
      particle.style.left = `${cx}px`;
      particle.style.top = `${cy}px`;
      particle.style.background = color;
      particle.style.color = color;
      particle.style.setProperty('--fx', `${fx}px`);
      particle.style.setProperty('--fy', `${fy}px`);
      particle.style.animationDelay = `${Math.random() * 0.05}s`;
      layer.appendChild(particle);

      window.setTimeout(() => particle.remove(), 1700);
    }
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
