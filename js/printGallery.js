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

  // Lista de imágenes (rutas relativas)
  const sourceList = [
    'img/img 2.jpg',
    'img/img 3.jpg',
    'img/img 4.jpg',
    'img/img 5.jpg',
    'img/img 6.jpg',
    'img/img 7.jpg',
    'img/img 8.jpg',
    'img/img 9.jpg',
    'img/img 10.jpg',
    'img/img 11.jpg',
    'img/img 12.jpg',
    'img/img 13.jpg',
    'img/img 14.jpg',
    'img/img 15.jpg',
    'img/img 16.jpg',
    'img/img 17.jpg',
    'img/img 18.jpg',
    'img/img 19.jpg',
    'img/img 20.jpg',
    'img/miniña.jpg'
  ];

  let idx = 0;
  const imgs = sourceList.map((src, i) => {
    const img = document.createElement('img');
    img.src = encodeURI(src);
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

  /**
   * Mostrar índice específico
   */
  function showIndex(n) {
    idx = ((n % imgs.length) + imgs.length) % imgs.length;
    imgs.forEach((im, i) => im.classList.toggle('hidden', i !== idx));
  }

  /**
   * Siguiente foto
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
      frame.innerHTML = '';
      const ph = document.createElement('img');
      ph.src = placeholders[0];
      ph.alt = 'Galería vacía';
      frame.appendChild(ph);
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
}

// Exportar para app.js
window.printGalleryModule = {
  initPrintGallery
};
