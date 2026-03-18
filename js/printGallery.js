/**
 * printGallery.js
 * Módulo de galería de fotos de impresión: cíclica simple, overlay
 */

/**
 * Inicializar galería de impresión
 */
function initPrintGallery() {
  const placeholders = [
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="100%" height="100%" fill="%23ff6fbf"/><text x="50%" y="50%" fill="%23fff" font-size="48" font-family="Poppins" dominant-baseline="middle" text-anchor="middle">Galería vacía</text></svg>'
  ];

  const frame = document.getElementById('photo-frame');
  if (!frame) return;

  // Lista dinámica: se alimenta con fotos de la super-galería (BD).
  // Fallback: si no hay nada, mostramos placeholder.
  let sourceList = [];

  let idx = 0;
  let imgs = [];
  let shuffled = [];

  function showPlaceholder() {
    frame.innerHTML = '';
    const placeholder = document.createElement('div');
    placeholder.style.textAlign = 'center';
    placeholder.style.padding = '14px';
    placeholder.style.color = '#6a4bb3';
    placeholder.style.fontWeight = '700';
    placeholder.innerHTML = `
      <div style="font-size: 18px;">📸 Galería vacía de recuerdos</div>
      <div style="font-size: 13px; margin-top: 6px; color:#5d4a7f;">Pulsa "Subir recuerdo" para guardar un momento.</div>
    `;
    frame.appendChild(placeholder);
  }

  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildImages(list) {
    sourceList = (list || []).filter(Boolean);
    idx = 0;
    shuffled = shuffleArray(sourceList);

    frame.innerHTML = '';

    if (!shuffled.length) {
      showPlaceholder();
      imgs = [];
      return;
    }

    imgs = shuffled.map((src, i) => {
      const img = document.createElement('img');
      // src puede ser URL pública (https://...) o ruta local
      img.src = src.startsWith('http') ? src : encodeURI(src);
      img.alt = `Foto ${i + 1}`;
      img.tabIndex = 0;
      if (i !== 0) img.classList.add('hidden');

      img.onerror = () => {
        console.warn('Galería: error cargando imagen', src);
        img.src = placeholders[0];
        img.classList.remove('hidden');
        img.setAttribute('data-errored', 'true');
      };

      frame.appendChild(img);
      return img;
    });
  }

  /**
   * Mostrar índice específico
   */
  function showIndex(n) {
    if (!imgs.length) return;
    idx = ((n % imgs.length) + imgs.length) % imgs.length;
    imgs.forEach((im, i) => im.classList.toggle('hidden', i !== idx));
  }

  /**
   * Siguiente foto (en orden aleatorio, pero determinista por "shuffle")
   */
  function next() {
    showIndex(idx + 1);
  }

  // Click para siguiente
  frame.addEventListener('click', next);

  // Enter o Space para siguiente
  frame.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      next();
    }
  });

  // Si todas fallan, mostrar placeholder
  setTimeout(() => {
    const allErrored = imgs.length && imgs.every(i => i.getAttribute('data-errored') === 'true' || (i.naturalWidth === 0 && i.complete));
    if (allErrored) {
      showPlaceholder();
    }
  }, 1000);

  /**
   * Abrir overlay de foto grande
   */
  function openOverlay(startIndex) {
    const overlay = document.createElement('div');
    overlay.className = 'photo-overlay';

    const bigImg = document.createElement('img');
    bigImg.src = imgs[startIndex] ? imgs[startIndex].src : placeholders[0];
    bigImg.alt = imgs[startIndex] ? imgs[startIndex].alt : 'Foto';

    const close = document.createElement('button');
    close.className = 'close-btn';
    close.textContent = 'Cerrar';

    const prev = document.createElement('button');
    prev.className = 'nav-btn prev';
    prev.innerHTML = '◀';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'nav-btn next';
    nextBtn.innerHTML = '▶';

    overlay.appendChild(prev);
    overlay.appendChild(nextBtn);
    overlay.appendChild(bigImg);
    overlay.appendChild(close);
    document.body.appendChild(overlay);

    let cur = startIndex;

    /**
     * Mostrar foto grande
     */
    function showBig(i) {
      if (!imgs.length) return;
      cur = ((i % imgs.length) + imgs.length) % imgs.length;
      bigImg.src = imgs[cur] ? imgs[cur].src : placeholders[0];
    }

    /**
     * Handler de teclado
     */
    function onKey(e) {
      if (e.key === 'Escape') cleanup();
      if (e.key === 'ArrowLeft') showBig(cur - 1);
      if (e.key === 'ArrowRight') showBig(cur + 1);
    }

    /**
     * Limpiar overlay
     */
    function cleanup() {
      document.removeEventListener('keydown', onKey);
      try { document.body.removeChild(overlay); } catch (e) { }
    }

    prev.addEventListener('click', () => showBig(cur - 1));
    nextBtn.addEventListener('click', () => showBig(cur + 1));
    close.addEventListener('click', cleanup);
    overlay.addEventListener('click', (ev) => { if (ev.target === overlay) cleanup(); });
    document.addEventListener('keydown', onKey);
  }

  // Botón expandir
  const expandBtn = document.getElementById('photo-expand');
  if (expandBtn) {
    expandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openOverlay(idx);
    });
  }

  // ====== Fuente: super-galería (BD) ======
  function toUrlsFromItems(items) {
    return (items || [])
      .map(it => it?.url)
      .filter(Boolean);
  }

  // 1) Intento inmediato (por si ya cargó)
  try {
    const existing = window.galleryModule?.allItems?.();
    const urls = toUrlsFromItems(existing);
    buildImages(urls);
  } catch (e) {
    buildImages([]);
  }

  // 2) Escuchar cuando `gallery.js` termine de cargar la BD
  window.addEventListener('superGallery:items', (ev) => {
    const urls = toUrlsFromItems(ev?.detail?.items);
    buildImages(urls);
  });
}

// Exportar para app.js
window.printGalleryModule = {
  initPrintGallery
};
