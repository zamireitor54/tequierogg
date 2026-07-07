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
