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

  // Lista dinámica: se alimenta con fotos de la super-galería (BD),
  // pero solo usa recuerdos que sí tengan ubicación de mapa.
  let sourceList = [];

  let idx = 0;
  let imgs = [];
  let shuffled = [];
  let autoAdvanceTimer = null;

  function hasRealCoords(item) {
    const lat = Number(item?.map_lat);
    const lng = Number(item?.map_lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
    if (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001) return false;
    return true;
  }

  function hasMapData(item) {
    if (!item) return false;
    const mapLocation = String(item?.map_location || '').trim();
    return !!mapLocation || hasRealCoords(item);
  }

  function restartAutoAdvance() {
    if (autoAdvanceTimer) {
      clearInterval(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
    if (imgs.length > 1) {
      autoAdvanceTimer = setInterval(() => {
        next();
      }, 10000);
    }
  }

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

  function updateMemoryPocketMeta(item) {
    const pocket = frame.closest('.print-gallery') || frame.parentElement;
    if (!pocket) return;

    let placeNode = pocket.querySelector('#map-photo-place');
    if (!placeNode) {
      placeNode = document.createElement('div');
      placeNode.id = 'map-photo-place';
      placeNode.className = 'map-photo-place';
      pocket.insertBefore(placeNode, pocket.querySelector('.print-gallery-hint') || null);
    }

    const place = String(item?.map_location || '').trim();
    placeNode.textContent = place ? `📍 ${place}` : '';
    placeNode.hidden = !place;

    const mapCopy = document.querySelector('.map-placeholder-copy');
    if (mapCopy) {
      const caption = String(item?.caption || '').trim();
      mapCopy.textContent = caption || 'Aquí irá apareciendo el recuerdo que está sonando en el mapa.';
    }

    const hint = pocket.querySelector('.print-gallery-hint');
    if (hint) {
      hint.textContent = '';
      hint.hidden = true;
    }
  }

  function emitSpotlight(item) {
    if (!hasMapData(item)) return;
    window.dispatchEvent(new CustomEvent('memory-map:spotlight-photo', {
      detail: { item }
    }));
  }

  function buildImages(list) {
    sourceList = (list || [])
      .filter(Boolean)
      .filter(item => hasMapData(item));
    idx = 0;
    shuffled = shuffleArray(sourceList);
    if (autoAdvanceTimer) {
      clearInterval(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }

    frame.innerHTML = '';

    if (!shuffled.length) {
      showPlaceholder();
      imgs = [];
      return;
    }

    imgs = shuffled.map((item, i) => {
      const img = document.createElement('img');
      const src = item?.url || '';
      img.src = src.startsWith('http') ? src : encodeURI(src);
      img.alt = `Foto ${i + 1}`;
      img.tabIndex = 0;
      img.dataset.itemIndex = String(i);
      if (i !== 0) img.classList.add('hidden');

      img.onerror = () => {
        console.warn('Galería: error cargando imagen', item?.url);
        img.src = placeholders[0];
        img.classList.remove('hidden');
        img.setAttribute('data-errored', 'true');
      };

      frame.appendChild(img);
      return img;
    });

    if (shuffled[0]) {
      updateMemoryPocketMeta(shuffled[0]);
      emitSpotlight(shuffled[0]);
    }

    restartAutoAdvance();
  }

  /**
   * Mostrar índice específico
   */
  function showIndex(n) {
    if (!imgs.length) return;
    idx = ((n % imgs.length) + imgs.length) % imgs.length;
    imgs.forEach((im, i) => im.classList.toggle('hidden', i !== idx));
    const currentItem = shuffled[idx];
    if (currentItem) {
      updateMemoryPocketMeta(currentItem);
      emitSpotlight(currentItem);
    }
  }

  /**
   * Siguiente foto (en orden aleatorio, pero determinista por "shuffle")
   */
  function next() {
    showIndex(idx + 1);
  }

  // Click para siguiente
  frame.addEventListener('click', () => {
    next();
    restartAutoAdvance();
  });

  // Enter o Space para siguiente
  frame.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      next();
      restartAutoAdvance();
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
  function toItemsFromGallery(items) {
    return (items || []).filter(Boolean);
  }

  // 1) Intento inmediato (por si ya cargó)
  try {
    const existing = window.galleryModule?.allItems?.();
    buildImages(toItemsFromGallery(existing));
  } catch (e) {
    buildImages([]);
  }

  // 2) Escuchar cuando `gallery.js` termine de cargar la BD
  window.addEventListener('superGallery:items', (ev) => {
    buildImages(toItemsFromGallery(ev?.detail?.items));
  });
}

// Exportar para app.js
window.printGalleryModule = {
  initPrintGallery
};
