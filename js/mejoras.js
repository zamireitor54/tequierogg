/**
 * mejoras.js
 * Capa final de mejoras. Se carga DESPUÉS de fixes.js.
 *
 *  1. Devuelve el panel del love-counter al <aside class="love-counter">
 *     (fixes.js lo había movido al hero).
 *  2. Maneja el TOGGLE del contador:
 *     - El hover ya muestra el panel vía CSS (:hover)
 *     - Click en la pestañita → fija .is-open (sticky)
 *     - Click fuera o Esc → cierra
 *     - Click en el panel mismo → abre el modal con el detalle
 *  3. Asegura que el botón "Quitar filtro" esté en <body> con label
 *     y sincroniza .is-visible viendo el style.display que cambia
 *     gallery.js cuando hay filtros activos.
 */
(function () {
  'use strict';

  // ====================================================
  // 1. Love-counter: devolverlo a su aside original + inyectar X
  // ====================================================
  function restoreLoveCounter() {
    const aside = document.querySelector('aside.love-counter');
    const panel = document.getElementById('love-counter-panel');
    let toggle = document.getElementById('love-counter-toggle');
    if (!aside || !panel) return null;

    if (panel.parentElement !== aside) {
      aside.appendChild(panel);
    }

    // Clonar el toggle para limpiar el handler de app.js que abre el modal
    if (toggle && toggle.dataset.mejCloned !== '1') {
      const clone = toggle.cloneNode(true);
      clone.dataset.mejCloned = '1';
      toggle.replaceWith(clone);
      toggle = clone;
    }

    if (toggle && aside.firstChild !== toggle) {
      aside.insertBefore(toggle, aside.firstChild);
    }
    panel.classList.remove('cin-counter-card');
    panel.removeAttribute('data-cin-relocated');

    if (toggle) {
      toggle.setAttribute('aria-label', 'Ver nuestro contador de tiempo');
      toggle.removeAttribute('title');
      toggle.setAttribute('aria-expanded', 'false');
    }

    // Inyectar botón X (close) en el panel si no existe
    if (!panel.querySelector('.mej-counter-close')) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'mej-counter-close';
      closeBtn.setAttribute('aria-label', 'Cerrar contador');
      closeBtn.textContent = '✕';
      panel.insertBefore(closeBtn, panel.firstChild);
    }

    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Contador de nuestro tiempo');

    return { aside, panel, toggle };
  }

  // ====================================================
  // 2. Toggle abrir/cerrar — SOLO POR CLICK
  //    Click corazón → abre. Click en X → cierra. Esc → cierra.
  // ====================================================
  function setupCounterToggle(refs) {
    if (!refs) return;
    const { aside, panel, toggle } = refs;
    if (aside.dataset.mejToggleBound === '1') return;
    aside.dataset.mejToggleBound = '1';

    const setOpen = (open) => {
      aside.classList.toggle('is-open', open);
      if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (panel) panel.classList.toggle('is-open', open);
    };

    // Click en la pestañita → abre
    toggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(true);
    }, true); // captura para correr antes que app.js

    // Click en la X dentro del panel → cierra
    const closeBtn = panel.querySelector('.mej-counter-close');
    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      setOpen(false);
    }, true);

    // Bloquear el listener viejo de app.js que abría el modal:
    // capturamos cualquier click en el panel y detenemos la propagación.
    panel?.addEventListener('click', (e) => {
      // Sólo bloqueamos la propagación si NO es la X (la X ya tiene su handler)
      if (!e.target.closest('.mej-counter-close')) {
        e.stopImmediatePropagation();
        e.stopPropagation();
      }
    }, true);

    // Click FUERA del aside → cerrar
    document.addEventListener('click', (e) => {
      if (!aside.classList.contains('is-open')) return;
      if (aside.contains(e.target)) return;
      const modalEl = document.getElementById('love-counter-modal');
      if (modalEl && !modalEl.classList.contains('hidden') && modalEl.contains(e.target)) return;
      setOpen(false);
    });

    // Esc → cerrar
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const modalEl = document.getElementById('love-counter-modal');
      if (modalEl && !modalEl.classList.contains('hidden')) return;
      if (aside.classList.contains('is-open')) setOpen(false);
    });
  }

  // ====================================================
  // 3. Botón "Quitar filtro": vive en body + observer
  // ====================================================
  function ensureClearFilterInBody() {
    const btn = document.getElementById('btn-clear-filter');
    if (!btn) return;
    if (btn.parentElement !== document.body) {
      document.body.appendChild(btn);
    }
    if (!btn.dataset.mejLabel) {
      btn.innerHTML = '<span aria-hidden="true" style="font-size:1.1em;line-height:1;">✕</span><span>Quitar filtro</span>';
      btn.dataset.mejLabel = '1';
    }
    btn.setAttribute('aria-label', 'Quitar filtro de la galería');
    btn.setAttribute('title', 'Quitar filtro');

    if (btn.dataset.mejObserver === '1') return;
    btn.dataset.mejObserver = '1';

    const syncVisibility = () => {
      const styleDisplay = (btn.style.display || '').trim();
      const isHidden = btn.hidden === true || btn.hasAttribute('hidden');
      const shouldShow = !isHidden && styleDisplay !== '' && styleDisplay !== 'none';
      btn.classList.toggle('is-visible', !!shouldShow);
      if (shouldShow && btn.parentElement === document.body
          && document.body.lastElementChild !== btn) {
        document.body.appendChild(btn);
      }
    };
    const mo = new MutationObserver(syncVisibility);
    mo.observe(btn, { attributes: true, attributeFilter: ['style', 'hidden', 'class', 'disabled', 'aria-hidden'] });
    syncVisibility();
    setTimeout(syncVisibility, 300);
    setTimeout(syncVisibility, 1200);

    const filterPlace = document.getElementById('filter-place');
    const searchCaption = document.getElementById('search-caption');
    const onFilterChange = () => setTimeout(syncVisibility, 80);
    filterPlace?.addEventListener('change', onFilterChange);
    filterPlace?.addEventListener('input', onFilterChange);
    searchCaption?.addEventListener('input', onFilterChange);
    searchCaption?.addEventListener('change', onFilterChange);
    searchCaption?.addEventListener('keyup', onFilterChange);
  }

  // ====================================================
  // 4. Init
  // ====================================================
  function init() {
    let refs = null;
    try { refs = restoreLoveCounter(); } catch (err) {
      console.warn('[mejoras] restoreLoveCounter falló:', err);
    }
    try { setupCounterToggle(refs); } catch (err) {
      console.warn('[mejoras] setupCounterToggle falló:', err);
    }
    try { ensureClearFilterInBody(); } catch (err) {
      console.warn('[mejoras] ensureClearFilterInBody falló:', err);
    }
    // Segundas pasadas
    setTimeout(() => {
      try {
        const r = restoreLoveCounter();
        if (r) setupCounterToggle(r);
        ensureClearFilterInBody();
      } catch (_) {}
    }, 350);
    setTimeout(() => {
      try {
        const r = restoreLoveCounter();
        if (r) setupCounterToggle(r);
        ensureClearFilterInBody();
      } catch (_) {}
    }, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
