/**
 * fixes.js
 * Correcciones de comportamiento y wrappeo de emojis tras revisión visual.
 * Se carga después de cinematic.js.
 *
 *  1. Wrappea emojis en headers con gradiente para que conserven color
 *  2. Conecta el click del corazón flotante directamente con el modal del
 *     contador (sin la lógica de slide-in del panel lateral)
 *  3. Renombra el botón "Sorpréndeme" si está vacío o corregido
 */
(function () {
  'use strict';

  // ====================================================
  // -1. MAP MÓVIL · fuerza layout via inline styles (imposible sobreescribir)
  // - Mueve .map-photo-pocket como primer hijo de .map-placeholder
  // - Fuerza .memory-map a position:static + height:280px
  // - Fuerza .map-placeholder a flex column, sin overflow:hidden
  // - Escucha resize para reaplicar
  // ====================================================
  // Helper: setProperty con !important (gana contra cualquier CSS)
  function forceStyle(el, key, value) {
    if (!el) return;
    try { el.style.setProperty(key, value, 'important'); } catch (_) {}
  }

  function applyMobileMapLayout() {
    const isMobile = window.innerWidth < 760;
    const placeholder = document.querySelector('.map-placeholder');
    const pocket = document.querySelector('.map-photo-pocket');
    const mapEl = document.getElementById('memory-map');
    const copy = document.querySelector('.map-placeholder-copy');
    if (!placeholder) return;

    if (isMobile) {
      // DOM: pocket como primer hijo (usar contains() no === directo, por si
      // hay wrappers intermedios como .print-gallery)
      if (pocket && placeholder.contains(pocket) && placeholder.firstElementChild !== pocket) {
        placeholder.insertBefore(pocket, placeholder.firstChild);
      }

      // CSS GRID inline — imposible de perder contra flex/position/absolute
      forceStyle(placeholder, 'display', 'grid');
      forceStyle(placeholder, 'grid-template-columns', '1fr');
      forceStyle(placeholder, 'grid-template-rows', 'auto 280px auto');
      forceStyle(placeholder, 'grid-template-areas', '"photo" "map" "caption"');
      forceStyle(placeholder, 'gap', '14px');
      forceStyle(placeholder, 'min-height', '0');
      forceStyle(placeholder, 'max-height', 'none');
      forceStyle(placeholder, 'height', 'auto');
      forceStyle(placeholder, 'overflow', 'hidden');
      forceStyle(placeholder, 'padding', '12px');
      forceStyle(placeholder, 'width', '100%');
      forceStyle(placeholder, 'max-width', '100%');
      forceStyle(placeholder, 'box-sizing', 'border-box');
      forceStyle(placeholder, 'margin', '0 auto');
      forceStyle(placeholder, 'border-radius', '22px');

      if (pocket) {
        // Grid area photo (arriba). z-index alto para nunca quedar detrás del map
        forceStyle(pocket, 'grid-area', 'photo');
        forceStyle(pocket, 'position', 'static');
        forceStyle(pocket, 'top', 'auto');
        forceStyle(pocket, 'right', 'auto');
        forceStyle(pocket, 'bottom', 'auto');
        forceStyle(pocket, 'left', 'auto');
        forceStyle(pocket, 'transform', 'none');
        forceStyle(pocket, 'width', '100%');
        forceStyle(pocket, 'max-width', '100%');
        forceStyle(pocket, 'margin', '0');
        forceStyle(pocket, 'z-index', '3');
        pocket.classList.remove('is-caption-tall');
      }

      if (mapEl) {
        // Grid area map (medio). z-index bajo para nunca quedar encima del pocket
        forceStyle(mapEl, 'grid-area', 'map');
        forceStyle(mapEl, 'position', 'static');
        forceStyle(mapEl, 'inset', 'auto');
        forceStyle(mapEl, 'top', 'auto');
        forceStyle(mapEl, 'right', 'auto');
        forceStyle(mapEl, 'bottom', 'auto');
        forceStyle(mapEl, 'left', 'auto');
        forceStyle(mapEl, 'height', '280px');
        forceStyle(mapEl, 'min-height', '280px');
        forceStyle(mapEl, 'max-height', '280px');
        forceStyle(mapEl, 'width', '100%');
        forceStyle(mapEl, 'max-width', '100%');
        forceStyle(mapEl, 'box-sizing', 'border-box');
        forceStyle(mapEl, 'z-index', '1');
        forceStyle(mapEl, 'overflow', 'hidden');

        // Leaflet: multi invalidateSize
        [60, 300, 900].forEach((ms) => {
          window.setTimeout(() => {
            try { window.memoryMapModule?.map?.invalidateSize?.(); } catch (_) {}
          }, ms);
        });
      }

      if (copy) {
        forceStyle(copy, 'grid-area', 'caption');
        forceStyle(copy, 'position', 'static');
        forceStyle(copy, 'left', 'auto');
        forceStyle(copy, 'right', 'auto');
        forceStyle(copy, 'bottom', 'auto');
        forceStyle(copy, 'top', 'auto');
        forceStyle(copy, 'inset', 'auto');
        forceStyle(copy, 'margin', '0');
        forceStyle(copy, 'width', '100%');
        forceStyle(copy, 'max-width', '100%');
        forceStyle(copy, 'z-index', '2');
      }
    } else {
      // Desktop: limpiar todos los inline (vuelve a CSS normal)
      placeholder.style.cssText = '';
      if (pocket) pocket.style.cssText = '';
      if (mapEl) mapEl.style.cssText = '';
      if (copy) copy.style.cssText = '';
    }
  }

  let mapLayoutTimer = null;
  let mapLayoutRunning = false;
  function scheduleMapLayout() {
    if (mapLayoutRunning) return; // evita loops si algo dispara desde dentro
    if (mapLayoutTimer) clearTimeout(mapLayoutTimer);
    mapLayoutTimer = setTimeout(() => {
      mapLayoutRunning = true;
      try { applyMobileMapLayout(); } finally { mapLayoutRunning = false; }
    }, 40);
  }

  window.addEventListener('resize', scheduleMapLayout, { passive: true });
  window.addEventListener('orientationchange', scheduleMapLayout, { passive: true });
  // Re-aplicar cuando el mapa/fotos terminen de cargar
  window.addEventListener('superGallery:items', scheduleMapLayout);
  window.addEventListener('memory-map:spotlight-photo', scheduleMapLayout);

  // Aplicar en cuanto el DOM esté listo + múltiples pasadas para pillar
  // Leaflet post-init sin importar cuánto tarde (red lenta, tiles remotos)
  function runInitialSequence() {
    applyMobileMapLayout();
    [200, 700, 1500].forEach((ms) => setTimeout(applyMobileMapLayout, ms));
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInitialSequence);
  } else {
    runInitialSequence();
  }

  // ====================================================
  // 0. PERF · Pausar todas las animaciones cuando la pestaña oculta.
  // Marca la <html> con .tab-hidden → CSS aplica animation-play-state: paused
  // a TODOS los elementos con animación. Cero CPU cuando el usuario está en
  // otra pestaña. Se activa/desactiva vía visibilitychange.
  // ====================================================
  const applyVisibility = () => {
    document.documentElement.classList.toggle('tab-hidden', document.hidden);
  };
  document.addEventListener('visibilitychange', applyVisibility, { passive: true });
  applyVisibility();

  // ====================================================
  // 1. Wrappear emojis en headers con gradiente
  // ====================================================
  // Regex que captura emojis (incluye compuestos como 💞, banderas, etc.)
  const EMOJI_RE = /(\p{Extended_Pictographic}(?:‍\p{Extended_Pictographic})*️?)/gu;

  function wrapEmojisIn(node) {
    if (!node) return;
    if (node.dataset?.cinEmojiWrapped === '1') return;

    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode(textNode) {
        return EMOJI_RE.test(textNode.nodeValue)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });

    const textsToReplace = [];
    let current;
    while ((current = walker.nextNode())) {
      textsToReplace.push(current);
    }

    textsToReplace.forEach((textNode) => {
      const text = textNode.nodeValue;
      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      EMOJI_RE.lastIndex = 0;
      let match;
      while ((match = EMOJI_RE.exec(text)) !== null) {
        if (match.index > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }
        const span = document.createElement('span');
        span.className = 'cin-emoji';
        span.textContent = match[0];
        frag.appendChild(span);
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      }
      textNode.parentNode.replaceChild(frag, textNode);
    });

    node.dataset.cinEmojiWrapped = '1';
  }

  function wrapEmojisInGradientHeaders() {
    const selectors = [
      '.super-gallery-head h4',
      '.extras .extra-card h3',
      '.cards-section .card h2',
      '.footer p'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(wrapEmojisIn);
  }

  // ====================================================
  // 2. Love counter: mueve el panel al hero como tarjeta horizontal
  //    + click sobre la tarjeta abre el modal con el detalle
  // ====================================================
  function relocateLoveCounterToHero() {
    const panel = document.getElementById('love-counter-panel');
    const heroContent = document.querySelector('.hero .hero-content')
                     || document.querySelector('.hero-content');
    const modal = document.getElementById('love-counter-modal');
    if (!panel || !heroContent) return;

    // Si ya fue movido, no repetir
    if (panel.dataset.cinRelocated === '1') return;

    // Marca y aplica clase para el nuevo styling
    panel.classList.add('cin-counter-card');
    panel.setAttribute('role', 'button');
    panel.setAttribute('tabindex', '0');
    panel.setAttribute('aria-label', 'Abrir detalle de nuestro tiempo juntos');

    // Mueve el panel al final de .hero-content (después de .hero-actions)
    heroContent.appendChild(panel);
    panel.dataset.cinRelocated = '1';

    // Click/Enter en la tarjeta → abre el modal (si existe)
    if (modal) {
      const openModal = () => {
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.getElementById('notes-fab')?.classList.add('hidden');
        document.getElementById('btn-open-login-footer')?.classList.add('hidden');
        document.getElementById('btn-push-settings')?.classList.add('hidden');
      };
      const restoreFabs = () => {
        document.getElementById('notes-fab')?.classList.remove('hidden');
        document.getElementById('btn-open-login-footer')?.classList.remove('hidden');
        document.getElementById('btn-push-settings')?.classList.remove('hidden');
      };

      panel.addEventListener('click', openModal);
      panel.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openModal();
        }
      });

      document.getElementById('love-counter-modal-close')
        ?.addEventListener('click', restoreFabs);
      modal.addEventListener('click', (event) => {
        if (event.target === modal) restoreFabs();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
          restoreFabs();
        }
      });
    }
  }

  // ====================================================
  // 3. Init
  // ====================================================
  function init() {
    try { wrapEmojisInGradientHeaders(); } catch (err) {
      console.warn('[fixes] emoji wrap falló:', err);
    }
    try { relocateLoveCounterToHero(); } catch (err) {
      console.warn('[fixes] relocate love-counter falló:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
