/**
 * gallery.js
 * Módulo de super galería: upload, filtrado, lightbox, álbumes, shuffle
 */

// =======================
// SUPABASE CONFIG
// =======================
const SUPABASE_URL = "https://zimiyyxsomgovctbnhdy.supabase.co";
const SUPABASE_KEY = "sb_publishable_nzy_iz8qh-aGq_9u5-QQgQ_lLoh0QwI";

// Crear cliente si el SDK está disponible (asegúrate de incluir el script CDN en index.html)
let supabaseClient = null;
if (window.supabase?.createClient) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  window.supabaseClient = supabaseClient; // 👈 para que notes.js lo use
  
  // Detectar cambios de sesión automáticamente
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    isAuthed = !!session;
    try { window.refreshAuthUI?.(); } catch(e){}
    try { renderSuperGallery(); } catch(e){}
  });
} else {
  console.warn('Supabase SDK no encontrado. Asegúrate de cargar https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2 antes de tus scripts.');
}

async function testConnection() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('photos')
      .select('*')
      .limit(1);

    if (error) {
      console.error("Error conectando a Supabase:", error.message || error);
    } else {
      console.log("Supabase conectado correctamente ✅");
    }
  } catch (e) {
    console.error('Error testConnection Supabase:', e);
  }
}

// Ejecutar prueba de conexión (siempre que el SDK exista)
testConnection();


// Estado de la galería
let allItems = [];
let activeAlbum = "";
let viewItems = [];
let shuffledOrder = null;
let lightboxIndex = 0;
let isAuthed = false;
let lastFocusedElementBeforeModal = null;

function setModalFocus(modal, focusSelector) {
  if (!modal) return;
  lastFocusedElementBeforeModal = document.activeElement;
  modal.inert = false;
  const toFocus = modal.querySelector(focusSelector);
  if (toFocus && toFocus.focus) {
    toFocus.focus();
  } else {
    modal.focus();
  }
}

function clearModalFocus(modal) {
  if (!modal) return;
  if (document.activeElement && modal.contains(document.activeElement)) {
    document.activeElement.blur();
  }
  modal.inert = true;
  if (lastFocusedElementBeforeModal && lastFocusedElementBeforeModal.focus) {
    lastFocusedElementBeforeModal.focus();
  }
  lastFocusedElementBeforeModal = null;
}

// Referencias del DOM
let superGrid, filterPlace, searchCaption, btnOpenUpload, uploadModal, btnCancelUpload;
let btnDoUpload, uploadFiles, uploadPlace, uploadMapLocation, uploadDate, uploadCaption, uploadAlbum, albumField;
let uploadStatus, btnClearFilter, lightbox, lightboxImg, lightboxCap, lightboxClose;
let lightboxPrev, lightboxNext;
let superGalleryCount;
let syncLightboxChromeRaf = null;
let syncLightboxChromeTimeout = null;
let syncLightboxChromeTimeoutLate = null;
let uploadObjectUrls = [];
let selectedUploadFiles = [];
let isGalleryLoading = false;
let galleryLoadingStartedAt = 0;
let superGalleryHead = null;
let superGalleryActions = null;
let superGallerySection = null;
let superGalleryActionsSpacer = null;

function setGalleryActionsFloating(isFloating) {
  if (!superGalleryActions) return;
  superGalleryActions.classList.toggle('is-floating', !!isFloating);
}

function syncGalleryActionsScrollOffset() {
  if (!superGalleryActions || !superGalleryActionsSpacer) return;
  superGalleryActions.classList.remove('is-fixed');
  setGalleryActionsFloating(false);
  superGalleryActionsSpacer.style.height = '0px';
  superGalleryActions.style.removeProperty('top');
  superGalleryActions.style.removeProperty('left');
  superGalleryActions.style.removeProperty('width');
}

function updateUploadMapLocationDisplay(label = '') {
  const display = document.getElementById('upload-map-location-display');
  if (!display) return;
  const clean = String(label || '').trim();
  display.textContent = clean || 'Aún no has elegido un punto en el mapa.';
  display.classList.toggle('empty', !clean);
}

function updateEditMapLocationDisplay(label = '') {
  const display = document.getElementById('edit-map-location-display');
  if (!display) return;
  const clean = String(label || '').trim();
  display.textContent = clean || 'Aún no has elegido un punto en el mapa.';
  display.classList.toggle('empty', !clean);
}

function parseCoordinateValue(rawValue) {
  if (rawValue === undefined || rawValue === null) return null;
  const clean = String(rawValue).trim();
  if (!clean) return null;
  const value = Number(clean);
  return Number.isFinite(value) ? value : null;
}

async function fetchProfileById(userId) {
  if (!supabaseClient || !userId) return null;
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('id, email, display_name')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error consultando profile:', error.message || error);
    return null;
  }

  return data || null;
}

async function fetchProfilesList() {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('id, email, display_name')
    .order('display_name', { ascending: true });

  if (error) {
    console.error('Error consultando profiles:', error.message || error);
    return [];
  }

  return data || [];
}

async function ensureProfileForSession(session, forcePrompt = false) {
  const userId = session?.user?.id || '';
  const email = session?.user?.email || '';
  if (!userId || !email || !supabaseClient) return '';

  const currentProfile = await fetchProfileById(userId);
  const currentName = (currentProfile?.display_name || '').trim();

  if (currentName && !forcePrompt) return currentName;

  if (!forcePrompt) {
    return '';
  }

  const raw = window.prompt('¿Con qué nombre quieres aparecer aquí?', currentName || '');
  const nextName = (raw || '').trim();
  if (!nextName) return currentName || '';

  const { error } = await supabaseClient
    .from('profiles')
    .upsert({
      id: userId,
      email,
      display_name: nextName
    }, { onConflict: 'id' });

  if (error) {
    console.error('Error guardando display_name en profiles:', error.message || error);
    return currentName || '';
  }

  return nextName;
}

async function getSessionDisplayName(session) {
  const userId = session?.user?.id || '';
  if (!userId) return '';
  const profile = await fetchProfileById(userId);
  return (profile?.display_name || '').trim();
}

function formatProfileLabel(rawName = '', fallbackEmail = '') {
  const name = String(rawName || '').trim();
  if (name) return name;

  const email = String(fallbackEmail || '').trim().toLowerCase();
  if (!email) return '';

  const local = email.split('@')[0] || email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

window.fetchProfileById = fetchProfileById;
window.ensureProfileForSession = ensureProfileForSession;

function renderGalleryLoading() {
  if (!superGrid) return;
  superGrid.classList.add('is-loading-gallery');
  superGrid.innerHTML = `
    <div class="gallery-loading-intro msg">
      <div class="gallery-loading-badge">Cargando recuerdos</div>
      <div class="gallery-loading-copy">Cargando sus foticos bonitas de la galería.</div>
    </div>
    <div class="gallery-loading-grid-shell">
      ${Array.from({ length: 6 }).map((_, idx) => `
        <div class="gallery-skeleton sg-item gallery-skeleton-${(idx % 3) + 1}">
          <div class="gallery-skeleton-shine"></div>
          <div class="gallery-skeleton-meta">
            <div class="gallery-skeleton-pill"></div>
            <div class="gallery-skeleton-line"></div>
          </div>
        </div>
      `).join('')}
    </div>`;
}

/**
 * Helper: obtener lugares únicos de los items
 */
function uniquePlaces(items) {
  const set = new Set(items.map(i => (i.place || '').trim()).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function uniqueAlbums(items) {
  const set = new Set(items.map(i => (i.album || '').trim()).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function uniquePlacesForSuggestions(items) {
  const source = window.memoryMapModule?.getPlaceOptions?.() || [];
  return Array.from(new Set(source))
    .sort((a, b) => a.localeCompare(b, 'es'));
}

function getStoredPhotoMapLocation(photoId) {
  return window.memoryMapModule?.getStoredPhotoMapLocation?.(photoId) || '';
}

function setStoredPhotoMapLocation(photoId, location) {
  window.memoryMapModule?.setStoredPhotoMapLocation?.(photoId, location);
}

function getStoredPhotoMapPoint(photoId) {
  return window.memoryMapModule?.getStoredPhotoMapPoint?.(photoId) || null;
}

function setStoredPhotoMapPoint(photoId, point) {
  window.memoryMapModule?.setStoredPhotoMapPoint?.(photoId, point);
}

function wirePlaceSuggestions(inputEl, suggestionsEl) {
  if (!inputEl || !suggestionsEl) return;

  const render = (query = '') => {
    const q = String(query || '').trim().toLowerCase();
    const allPlaces = uniquePlacesForSuggestions(allItems);
    const filtered = allPlaces
      .filter(place => !q || place.toLowerCase().includes(q));

    if (!filtered.length) {
      suggestionsEl.innerHTML = '';
      suggestionsEl.classList.add('hidden');
      return;
    }

    suggestionsEl.innerHTML = filtered.map(place => `
      <button type="button" class="lb-suggestion-item" data-value="${place.replaceAll('"','&quot;')}">
        <span class="lb-suggestion-icon">📍</span>
        <span class="lb-suggestion-text">${place}</span>
      </button>
    `).join('');

    suggestionsEl.classList.remove('hidden');

    suggestionsEl.querySelectorAll('.lb-suggestion-item').forEach(btn => {
      btn.addEventListener('click', () => {
        inputEl.value = btn.dataset.value || '';
        suggestionsEl.classList.add('hidden');
      });
    });
  };

  inputEl.addEventListener('click', () => render(inputEl.value));
  inputEl.addEventListener('focus', () => render(inputEl.value));
  inputEl.addEventListener('input', () => render(inputEl.value));
  inputEl.addEventListener('blur', () => {
    setTimeout(() => suggestionsEl.classList.add('hidden'), 120);
  });
}

function normalizeGallerySearchValue(rawValue) {
  const value = String(rawValue || '').trim();
  if (!value) return '';

  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const looksLikeCredentialAutofill = /@/.test(value) && /\.(com|net|org|co|io|app|dev|me|info)$/i.test(value);

  return (looksLikeEmail || looksLikeCredentialAutofill) ? '' : value.toLowerCase();
}

function sanitizeSearchCaptionInput() {
  if (!searchCaption) return '';
  const nextValue = normalizeGallerySearchValue(searchCaption.value);
  if (searchCaption.value && !nextValue) {
    searchCaption.value = '';
  }
  return nextValue;
}

/**
 * Helper: formatear fecha ISO a DD/MM/YYYY
 */
function formatNiceDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Helper: mezclar array usando Fisher-Yates
 */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Aplicar filtros (lugar, búsqueda, álbum)
 */
function applyFilters(items) {
  const p = (filterPlace?.value || '').trim().toLowerCase();
  const q = sanitizeSearchCaptionInput();
  const alb = (activeAlbum || '').trim().toLowerCase();

  return items.filter(it => {
    const okPlace = !p || (it.place || '').toLowerCase() === p;
    const okAlbum = !alb || (it.album || '').toLowerCase() === alb;
    const okQuery = !q || (`${it.caption || ''} ${it.place || ''} ${it.album || ''} ${it.date || ''}`).toLowerCase().includes(q);
    return okPlace && okAlbum && okQuery;
  });
}

/**
 * Renderizar dropdown de lugares
 */
function renderPlaceFilter() {
  if (!filterPlace) return;
  const places = uniquePlaces(allItems);
  const current = filterPlace.value;
  filterPlace.innerHTML = `<option value="">📍 Todos los lugares</option>` +
    places.map(p => `<option value="${p}">${p}</option>`).join('');
  if (current && places.includes(current)) filterPlace.value = current;
}

/**
 * Renderizar grid de galería con masonry
 */
function renderSuperGallery() {
  if (!superGrid) return;
  if (isGalleryLoading) {
    renderGalleryLoading();
    if (superGalleryCount) {
      superGalleryCount.textContent = 'Cargando recuerdos...';
    }
    return;
  }
  superGrid.classList.remove('is-loading-gallery');
  renderPlaceFilter();
  const albumCounts = allItems.reduce((acc, item) => {
    const key = (item.album || '').trim();
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  let items = allItems;

  // Siempre mezclado si no estás en modo reunir
  if (!activeAlbum) {
    if (!shuffledOrder) shuffledOrder = shuffleArray(items);
    items = shuffledOrder;
  } else {
    items = items
      .filter(x => x.album === activeAlbum)
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }

  // Aplicar filtros de búsqueda/lugar sobre el conjunto ya preparado
  items = applyFilters(items);

  // Guardar vista actual
  viewItems = items;

  if (superGalleryCount) {
    const total = items.length;
    superGalleryCount.textContent = `${total} ${total === 1 ? 'recuerdo' : 'recuerdos'}`;
  }

  const hasPlaceFilter = !!(filterPlace?.value || '').trim();
  const hasSearchFilter = !!sanitizeSearchCaptionInput();
  const hasActiveFilters = hasPlaceFilter || hasSearchFilter || !!activeAlbum;
  const useSparseLayout =
    ((hasPlaceFilter || hasSearchFilter) && items.length > 0 && items.length <= 2) ||
    (!!activeAlbum && items.length > 0 && items.length <= 2);

  superGrid.classList.toggle('is-grouped-view', !!activeAlbum);
  superGrid.classList.remove('is-compact-group');
  superGrid.classList.toggle('is-empty-state', !items.length);
  superGrid.classList.toggle('is-filtered-view', hasPlaceFilter || hasSearchFilter);
  superGrid.classList.toggle('is-sparse-results', useSparseLayout);
  superGrid.dataset.groupCount = String(items.length || 0);

  // Mostrar/ocultar botón "Quitar filtro"
  if (btnClearFilter) {
    btnClearFilter.hidden = !hasActiveFilters;
    btnClearFilter.disabled = !hasActiveFilters;
    btnClearFilter.classList.toggle('is-visible', hasActiveFilters);
    btnClearFilter.style.display = hasActiveFilters ? 'inline-flex' : 'none';
    btnClearFilter.setAttribute('aria-hidden', hasActiveFilters ? 'false' : 'true');
  }

  superGrid.innerHTML = '';
  if (!items.length) {
    superGrid.innerHTML = `
    <div class="gallery-empty-state-card">
      <strong>${hasActiveFilters ? 'No se encontraron recuerdos para esa búsqueda.' : 'Aquí van tus recuerdos 💞'}</strong><br>
      ${hasActiveFilters
        ? 'Prueba con otro lugar o escribe algo diferente para encontrar tus foticos.'
        : 'Pulsa <strong>"Subir recuerdo"</strong> para agregar fotos con lugar y fecha.'}
    </div>`;
    emitSuperGalleryItems();
    return;
  }

  items.forEach((it, idx) => {
    const card = document.createElement('div');
    card.className = 'sg-item';
    const albumName = (it.album || '').trim();
    const relatedCount = albumName ? (albumCounts[albumName] || 0) : 0;
    const canGroup = relatedCount > 1;

    card.innerHTML = `
    <img src="${it.url || 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27560%27%20height=%27340%27%3E%3Crect%20width=%27560%27%20height=%27340%27%20fill=%27%23f8f0ff%27%20/%3E%3Ctext%20x=%27280%27%20y=%27170%27%20fill=%27%238a4dff%27%20font-family=%27Arial%27%20font-size=%2724%27%20text-anchor=%27middle%27%3ESin%20imagen%3C/text%3E%3C/svg%3E'}" alt="${(it.caption||'recuerdo').replaceAll('"','&quot;')}">
    ${canGroup ? `
      <button class="sg-group-btn" type="button" data-album="${albumName.replaceAll('"', '&quot;')}" title="Ver ${relatedCount} de &quot;${albumName}&quot;" aria-label="Ver ${relatedCount} recuerdos de ${albumName}">
        <span class="sg-group-icon">🗂️</span>
        <span class="sg-group-count">${relatedCount}</span>
      </button>
    ` : ''}
    <div class="sg-meta">
      <div class="top">
      <span class="sg-pill">🗂️ ${it.album || 'Sin bloque'}</span>
            <span class="sg-pill">📍 ${it.place || it.map_location || 'Aún sin ubicación'}</span>
      </div>
      <div class="cap">📅 ${formatNiceDate(it.date) || ''} — ${it.caption || ''}</div>
    </div>`;
    card.addEventListener('click', () => openLightbox(items, idx));
    card.querySelector('.sg-group-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      activeAlbum = albumName;
      shuffledOrder = null;
      renderSuperGallery();
      superGrid?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    superGrid.appendChild(card);
  });

  // Animación de entrada
  if (superGrid && superGrid.animate) {
    try {
      superGrid.animate(
        [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 420, easing: 'cubic-bezier(.2,.9,.2,1)' }
      );
    } catch (e) { /* noop */ }
  }
  emitSuperGalleryItems();
}

/**
 * Abrir lightbox (modal de foto grande)
 */
function openLightbox(items, idx) {
  if (!lightbox) return;
  sanitizeSearchCaptionInput();
  lastFocusedElementBeforeModal = document.activeElement;
  // evitar que la página de fondo haga scroll mientras el overlay está abierto
  document.body.style.overflow = 'hidden';
  document.body.classList.add('lightbox-open');
  lightbox.classList.remove('hidden');
  lightbox.setAttribute('aria-hidden', 'false');
  setModalFocus(lightbox, '#btn-lightbox-close-inner');
  lightbox._items = items;
  lightboxIndex = idx;
  paintLightbox();
}

/**
 * Pintar contenido del lightbox
 */
function paintLightbox() {
  const items = lightbox._items || [];
  const it = items[lightboxIndex];
  if (!it) return;
  lightboxImg.src = it.url;

  let photoBg = lightbox.querySelector('.lightbox-photo-bg');
  if (!photoBg) {
    photoBg = document.createElement('div');
    photoBg.className = 'lightbox-photo-bg';
    lightbox.prepend(photoBg);
  }
  photoBg.style.backgroundImage = `url("${it.url}")`;

  // ✅ Asegurar wrapper dentro del figure para overlay de botones
  const figure = lightbox.querySelector('.lightbox-figure');
  if (!figure) return;

  let wrapper = figure.querySelector('.lb-img-wrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'lb-img-wrapper';
    // Insertar wrapper antes del img y mover el img dentro
    figure.insertBefore(wrapper, lightboxImg);
  } else {
    // si existe, asegurar que el wrapper esté dentro del figure
    if (wrapper.parentElement !== figure) figure.insertBefore(wrapper, lightboxCap || null);
  }

  let mediaFrame = wrapper.querySelector('.lb-media-frame');
  if (!mediaFrame) {
    mediaFrame = document.createElement('div');
    mediaFrame.className = 'lb-media-frame';
    wrapper.appendChild(mediaFrame);
  }

  if (lightboxImg.parentElement !== mediaFrame) {
    mediaFrame.appendChild(lightboxImg);
  }

  // Barra superior interna para controles dentro de la foto
  const staleFrameTops = Array.from(lightbox.querySelectorAll(':scope > .lb-frame-top'));
  staleFrameTops.forEach(node => node.remove());
  const staleEditForms = Array.from(lightbox.querySelectorAll(':scope > #lb-edit-form'));
  staleEditForms.forEach(node => node.remove());
  const staleDeleteForms = Array.from(lightbox.querySelectorAll(':scope > #lb-delete-modal'));
  staleDeleteForms.forEach(node => node.remove());

  let frameTop = mediaFrame.querySelector('.lb-frame-top');
  if (!frameTop) {
    frameTop = document.createElement('div');
    frameTop.className = 'lb-frame-top';
    frameTop.innerHTML = `
      <div class="lb-frame-left"></div>
      <div class="lb-frame-center"></div>
      <div class="lb-frame-right"></div>
    `;
    mediaFrame.appendChild(frameTop);
  }

  const frameLeft = frameTop.querySelector('.lb-frame-left');
  const frameCenter = frameTop.querySelector('.lb-frame-center');
  const frameRight = frameTop.querySelector('.lb-frame-right');
  frameRight.innerHTML = `
    <button id="btn-lightbox-close-inner" class="lb-fab lb-fab-close" title="Cerrar" aria-label="Cerrar">✕</button>
  `;
  frameCenter.innerHTML = items.length > 1
    ? `<div class="lightbox-counter">${lightboxIndex + 1} / ${items.length}</div>`
    : '';
  if (frameTop.parentElement !== lightbox) {
    lightbox.appendChild(frameTop);
  }

  // ✅ asegurar que el caption esté dentro del mismo contenedor visual
  lightboxCap.classList.add('lb-panel');
  if (lightboxCap.parentElement !== wrapper) wrapper.appendChild(lightboxCap);

  // overlay admin flotante (editor/eliminar) sobre la imagen
  let admin = mediaFrame.querySelector('#lb-admin-overlay');
  if (!admin) {
    admin = document.createElement('div');
    admin.id = 'lb-admin-overlay';
    admin.className = 'lb-admin-overlay';
    frameLeft.appendChild(admin);
  } else if (admin.parentElement !== frameLeft) {
    frameLeft.appendChild(admin);
  }
  admin.innerHTML = ``;

  const albumName = (it.album || '').trim();
  const albumOptions = uniqueAlbums(allItems);
  const niceDate = formatNiceDate(it.date) || '';
  const initialAuthorLabel = formatProfileLabel(
    it.author_name || it.uploaded_by_name || '',
    it.author_email || it.uploaded_by_email || ''
  );

  // Detectar si es un bloque (múltiples fotos con el mismo album)
  const sameAlbumCount = albumName ? allItems.filter(x => x.album === albumName).length : 0;
  const isBlock = albumName && sameAlbumCount > 1;

  // El botón "Ver todas" solo aparece para bloques
  const btnReunir = isBlock
    ? `<button id="btn-reunir-album" class="btn small outline"
        style="background:rgba(255,255,255,0.10); border-color:rgba(255,255,255,0.18); color:#fff;">
        Ver todas de "${albumName}"
      </button>`
    : '';

  // (Se elimina el centrado JS; el layout ahora lo maneja CSS en .lightbox-figure)

  // Renderizar el album: título grande para foto individual, badge para bloque
  const albumDisplay = albumName
    ? isBlock
      ? `<span class="lightbox-meta-item">🗂️ ${albumName}</span>`
      : `<span class="lightbox-meta-item">🗂️ ${albumName}</span>`
    : '';
  const placeDisplay = `<span class="lightbox-meta-item">📍 ${it.place || '—'}</span>`;
  const dateDisplay = `<span class="lightbox-date-pill">📅 ${niceDate}</span>`;
  const authorDisplay = initialAuthorLabel
    ? `<span id="lightbox-author" class="lightbox-author-chip">💗 Lo subió ${initialAuthorLabel}</span>`
    : `<span id="lightbox-author" class="lightbox-author-chip" hidden></span>`;
  lightboxCap.innerHTML = `
    <div class="lightbox-meta-row">
      <div class="lightbox-meta">
        ${albumDisplay}
        <span class="lightbox-meta-sep">•</span>
        ${placeDisplay}
        <span class="lightbox-meta-sep">•</span>
        ${dateDisplay}
      </div>
      <div class="lightbox-panel-tools">
        ${btnReunir}
        <button id="btn-edit-photo" class="lb-panel-tool ${isAuthed ? '' : 'is-disabled'}" title="${isAuthed ? 'Editar' : 'Inicia sesión para editar'}">✏️</button>
        <button id="btn-delete-photo" class="lb-panel-tool danger ${isAuthed ? '' : 'is-disabled'}" title="${isAuthed ? 'Eliminar' : 'Inicia sesión para borrar'}">🗑️</button>
      </div>
    </div>

    <div id="lb-caption" class="lightbox-text">${it.caption || ''}</div>

    <div class="lightbox-info-bottom">
      <div class="lightbox-info-actions">
        ${activeAlbum ? `<button id="btn-volver-mezcla" class="btn small outline">Volver a mezclar</button>` : ''}
      </div>
      <div class="lightbox-author-wrap"${initialAuthorLabel ? '' : ' hidden'}>
        ${authorDisplay}
      </div>
    </div>

    <button id="lb-more" class="lb-more" type="button">Ver más</button>

    ${isAuthed ? `
      <div id="lb-edit-form" class="lb-edit hidden">
        <div class="lb-edit-shell">
          <div class="lb-edit-card">
            <div class="lb-edit-head">
              <div class="lb-edit-headcopy">
                <div class="lb-edit-eyebrow">Editor de recuerdo</div>
                <div class="lb-edit-title">Editar recuerdo ✨</div>
                <div class="lb-edit-subtitle">Actualiza los datos de esta foto y guarda el momento como quieres recordarlo.</div>
              </div>
              <button id="btn-cancel-edit-x" class="lb-x" aria-label="Cerrar">✕</button>
            </div>

            <div class="lb-edit-grid">
              <label class="lb-field">
                <span>📍 Lugar</span>
                <input id="edit-place" class="input" value="${(it.place||'').replaceAll('"','&quot;')}" />
              </label>

              <label class="lb-field">
                <span>📅 Fecha</span>
                <input id="edit-date" class="input" type="date" value="${it.date || ''}" />
              </label>

              <label class="lb-field lb-span-2">
                <span>🗺️ Ubicación en el mapa</span>
                <input id="edit-map-location" type="hidden" value="${((it.map_location || getStoredPhotoMapLocation(it.id)) || '').replaceAll('"','&quot;')}" />
                <div class="map-location-tools">
                  <button id="btn-edit-map-picker" class="btn small outline" type="button">🗺️ Poner ubicación</button>
                  <span class="muted">Toca el punto exacto y se guardará con esta foto.</span>
                </div>
                <div id="edit-map-location-display" class="map-location-display ${(it.map_location || getStoredPhotoMapLocation(it.id)) ? '' : 'empty'}">${(it.map_location || getStoredPhotoMapLocation(it.id) || 'Aún no has elegido un punto en el mapa.').replaceAll('<','&lt;')}</div>
              </label>

              <label class="lb-field lb-span-2">
                <span>🗂️ Bloque</span>
                <div class="lb-suggest">
                  <input id="edit-album" class="input" autocomplete="off" placeholder="Elige un bloque o escribe uno nuevo..." value="${(it.album||'').replaceAll('"','&quot;')}" />
                  <div id="album-suggestions" class="lb-suggestions hidden"></div>
                </div>
              </label>

              <label class="lb-field lb-span-2">
                <span>💌 Mensajito</span>
                <textarea id="edit-cap" class="textarea" rows="4" placeholder="Escribe algo lindo...">${it.caption || ''}</textarea>
              </label>

              <label class="lb-field lb-span-2">
                <span>💗 Quién la subió</span>
                <select id="edit-author" class="input">
                  <option value="">Sin asignar por ahora</option>
                </select>
              </label>
            </div>

            <div class="lb-edit-actions">
              <button id="btn-cancel-edit" class="btn small outline">Cancelar</button>
              <button id="btn-save-edit" class="btn small">Guardar 💾</button>
            </div>

            <div id="lb-edit-status" class="muted" style="margin-top:8px;"></div>
          </div>
        </div>
      </div>

      <div id="lb-delete-modal" class="lb-delete hidden">
        <div class="lb-delete-shell">
          <div class="lb-delete-card">
            <button id="btn-cancel-delete-x" class="lb-delete-x" aria-label="Cerrar">✕</button>
            <div class="lb-delete-icon">🗑️</div>
            <div class="lb-delete-eyebrow">Nuestro recuerdo</div>
            <div class="lb-delete-title">¿Será que sí queremos borrar esta fotico?</div>
            <div class="lb-delete-copy">Si la borramos, este pedacito de nosotros se va a ir de la galería y ya no volverá a aparecer aquí.</div>

            <div class="lb-delete-preview">
              ${albumName ? `<span class="lb-delete-chip">🗂️ ${albumName}</span>` : ''}
              <span class="lb-delete-chip">📍 ${it.place || 'Sin lugar'}</span>
              <span class="lb-delete-chip">📅 ${niceDate || 'Sin fecha'}</span>
            </div>

            <div class="lb-delete-message">${it.caption || 'Este recuerdo no tiene mensajito, pero igual se borrará de tu galería.'}</div>

            <div class="lb-delete-actions">
              <button id="btn-cancel-delete" class="btn small outline">Cancelar</button>
              <button id="btn-confirm-delete" class="btn small danger-solid">Sí, borrémosla</button>
            </div>
          </div>
        </div>
      </div>
    ` : ''}
  `;

  const editForm = document.getElementById('lb-edit-form');
  if (editForm && editForm.parentElement !== lightbox) {
    lightbox.appendChild(editForm);
  }
  const deleteModal = document.getElementById('lb-delete-modal');
  if (deleteModal && deleteModal.parentElement !== lightbox) {
    lightbox.appendChild(deleteModal);
  }
  document.getElementById('edit-place')?.setAttribute('value', it.place || '');
  if (document.getElementById('edit-place')) document.getElementById('edit-place').value = it.place || '';
  document.getElementById('edit-map-location')?.setAttribute('value', it.map_location || getStoredPhotoMapLocation(it.id) || '');
  if (document.getElementById('edit-map-location')) {
    const editMapLocation = document.getElementById('edit-map-location');
    const storedPoint = getStoredPhotoMapPoint(it.id);
    editMapLocation.value = it.map_location || getStoredPhotoMapLocation(it.id) || '';
    editMapLocation.dataset.mapLat = String(it.map_lat ?? storedPoint?.lat ?? '');
    editMapLocation.dataset.mapLng = String(it.map_lng ?? storedPoint?.lng ?? '');
  }
  updateEditMapLocationDisplay(it.map_location || getStoredPhotoMapLocation(it.id) || '');
  if (document.getElementById('edit-date')) document.getElementById('edit-date').value = it.date || '';
  if (document.getElementById('edit-album')) document.getElementById('edit-album').value = it.album || '';
  if (document.getElementById('edit-cap')) document.getElementById('edit-cap').value = it.caption || '';
  const editAuthor = document.getElementById('edit-author');
  const currentAuthorId = String(it.created_by || it.author_id || '').trim();
  const currentAuthorEmail = String(it.author_email || '').trim().toLowerCase();
  if (editAuthor) {
    fetchProfilesList().then((profiles) => {
      const options = profiles.map((profile) => {
        const profileId = String(profile.id || '').trim();
        const profileEmail = String(profile.email || '').trim().toLowerCase();
        const selected = (currentAuthorId && currentAuthorId === profileId)
          || (!currentAuthorId && currentAuthorEmail && currentAuthorEmail === profileEmail);
        const label = formatProfileLabel(profile.display_name, profile.email) || profile.email || 'Perfil';
        const detail = profile.email ? ` (${profile.email})` : '';
        return `<option value="${profileId.replaceAll('"', '&quot;')}" data-email="${profileEmail.replaceAll('"', '&quot;')}" data-name="${String(profile.display_name || '').replaceAll('"', '&quot;')}"${selected ? ' selected' : ''}>${label}${detail}</option>`;
      }).join('');
      editAuthor.innerHTML = `<option value="">Sin asignar por ahora</option>${options}`;
      if (!currentAuthorId && !currentAuthorEmail) {
        editAuthor.value = '';
      }
    }).catch(() => {});
  }

  const editAlbumInput = document.getElementById('edit-album');
  const albumSuggestions = document.getElementById('album-suggestions');
  const renderAlbumSuggestions = (query = '') => {
    if (!albumSuggestions) return;
    const q = query.trim().toLowerCase();
    const filtered = albumOptions.filter(album => !q || album.toLowerCase().includes(q));

    if (!filtered.length) {
      albumSuggestions.innerHTML = '';
      albumSuggestions.classList.add('hidden');
      return;
    }

    albumSuggestions.innerHTML = filtered.map(album => `
      <button type="button" class="lb-suggestion-item" data-value="${album.replaceAll('"','&quot;')}">
        <span class="lb-suggestion-icon">🗂️</span>
        <span class="lb-suggestion-text">${album}</span>
      </button>
    `).join('');

    albumSuggestions.classList.remove('hidden');

    albumSuggestions.querySelectorAll('.lb-suggestion-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if (editAlbumInput) editAlbumInput.value = btn.dataset.value || '';
        albumSuggestions.classList.add('hidden');
      });
    });
  };

  editAlbumInput?.addEventListener('focus', () => renderAlbumSuggestions(editAlbumInput.value));
  editAlbumInput?.addEventListener('input', () => renderAlbumSuggestions(editAlbumInput.value));
  editAlbumInput?.addEventListener('blur', () => {
    setTimeout(() => albumSuggestions?.classList.add('hidden'), 120);
  });

  document.getElementById('btn-edit-map-picker')?.addEventListener('click', async () => {
    const currentValue = document.getElementById('edit-map-location')?.value || '';
    const picked = await window.memoryMapModule?.openPicker?.({ initialPlace: currentValue });
    if (!picked?.label) return;
    const input = document.getElementById('edit-map-location');
    if (input) {
      input.value = picked.label;
      input.dataset.mapLat = String(picked.lat || '');
      input.dataset.mapLng = String(picked.lng || '');
    }
    updateEditMapLocationDisplay(picked.label);
  });

  const syncLightboxChrome = () => {
    if (!lightbox || lightbox.classList.contains('hidden') || !lightboxImg) return;
    const rect = lightboxImg.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const navSize = 52;
    const navMargin = viewportWidth <= 640 ? 10 : 18;
    const navTop = Math.min(
      Math.max(38, rect.top + (rect.height / 2)),
      Math.max(38, viewportHeight - 38)
    );
    const prevLeft = Math.max(navMargin, rect.left - 60);
    const nextLeft = Math.min(
      Math.max(navMargin, viewportWidth - navSize - navMargin),
      rect.right + 10
    );

    frameTop.style.top = `${Math.max(12, rect.top + 14)}px`;
    frameTop.style.left = `${rect.left + 14}px`;
    frameTop.style.width = `${Math.max(0, rect.width - 28)}px`;

    if (lightboxPrev) {
      lightboxPrev.style.left = `${prevLeft}px`;
      lightboxPrev.style.right = 'auto';
      lightboxPrev.style.top = `${navTop}px`;
    }
    if (lightboxNext) {
      lightboxNext.style.left = `${nextLeft}px`;
      lightboxNext.style.right = 'auto';
      lightboxNext.style.top = `${navTop}px`;
    }
  };

  if (syncLightboxChromeRaf) cancelAnimationFrame(syncLightboxChromeRaf);
  if (syncLightboxChromeTimeout) clearTimeout(syncLightboxChromeTimeout);
  if (syncLightboxChromeTimeoutLate) clearTimeout(syncLightboxChromeTimeoutLate);
  syncLightboxChromeRaf = requestAnimationFrame(() => {
    syncLightboxChrome();
    requestAnimationFrame(syncLightboxChrome);
  });
  syncLightboxChromeTimeout = setTimeout(syncLightboxChrome, 80);
  syncLightboxChromeTimeoutLate = setTimeout(syncLightboxChrome, 220);
  lightboxImg.onload = () => {
    syncLightboxChrome();
    requestAnimationFrame(syncLightboxChrome);
    setTimeout(syncLightboxChrome, 80);
    setTimeout(syncLightboxChrome, 220);
  };
  if (typeof lightboxImg.decode === 'function') {
    lightboxImg.decode()
      .then(() => {
        syncLightboxChrome();
        requestAnimationFrame(syncLightboxChrome);
        setTimeout(syncLightboxChrome, 80);
      })
      .catch(() => {});
  }

  // ✅ Ver más / Ver menos (solo si el texto se clampa)
  const cap = document.getElementById('lb-caption');
  const more = document.getElementById('lb-more');
  const innerClose = document.getElementById('btn-lightbox-close-inner');
  const authorNode = document.getElementById('lightbox-author');
  const authorWrap = lightboxCap.querySelector('.lightbox-author-wrap');

  innerClose?.addEventListener('click', closeLightbox);

  const authorId = it.created_by || it.author_id || it.user_id || '';
  if (!initialAuthorLabel && authorNode && authorId) {
    fetchProfileById(authorId).then((profile) => {
      if (!profile || lightbox._items?.[lightboxIndex]?.id !== it.id) return;
      const profileName = formatProfileLabel(profile.display_name, profile.email);
      if (!profileName) return;
      authorNode.textContent = `💗 Lo subió ${profileName}`;
      authorNode.hidden = false;
      if (authorWrap) authorWrap.hidden = false;
    }).catch(() => {});
  }

  if (cap && more) {
    // Detecta si quedó clamped (overflow)
    requestAnimationFrame(() => {
      const isOverflowing = cap.scrollHeight > cap.clientHeight + 2;
      more.style.display = isOverflowing ? 'inline-flex' : 'none';
    });

    more.addEventListener('click', () => {
      const expanded = cap.classList.toggle('expanded');
      more.textContent = expanded ? 'Ver menos' : 'Ver más';
    });
  }

  // Reunir por álbum
  const reunir = document.getElementById('btn-reunir-album');
  reunir?.addEventListener('click', () => {
    activeAlbum = albumName;
    shuffledOrder = null;

    // Cierra siempre el lightbox para que no quede la foto encima
    closeLightbox();

    // Render del bloque reunido
    renderSuperGallery();

    // Scroll a la galería
    document.querySelector('.super-gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Volver a mezclar
  const volver = document.getElementById('btn-volver-mezcla');
  volver?.addEventListener('click', () => {
    activeAlbum = "";
    shuffledOrder = null;
    closeLightbox();
    renderSuperGallery();
    document.querySelector('.super-gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Nuevo: Eliminar foto (optimista) y UI de edición integrada
  document.getElementById('btn-delete-photo')?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!isAuthed) {
      alert("Inicia sesión para poder borrar esta foto.");
      return;
    }
    const deleteModal = document.getElementById('lb-delete-modal');
    if (deleteModal) {
      deleteModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      return;
    }
  });

  const performDelete = async () => {
    const delBtn = document.getElementById('btn-delete-photo');
    const editBtn = document.getElementById('btn-edit-photo');
    const confirmDeleteBtn = document.getElementById('btn-confirm-delete');
    if (delBtn) delBtn.disabled = true;
    if (editBtn) editBtn.disabled = true;
    if (confirmDeleteBtn) {
      confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.textContent = 'Borrando...';
    }

    const deleteModal = document.getElementById('lb-delete-modal');
    if (deleteModal) deleteModal.classList.add('hidden');

    try {
      // 0) eliminar de UI de forma optimista
      allItems = allItems.filter(x => x.id !== it.id);
      shuffledOrder = null;
      closeLightbox();
      renderSuperGallery();

      // 1) borrar en DB
      const { error: delDbErr } = await supabaseClient
        .from('photos')
        .delete()
        .eq('id', it.id);

      if (delDbErr) {
        alert("No pude borrar en BD: " + delDbErr.message);
        await loadFromDB();
        return;
      }

      // 2) borrar Storage (si path existe)
      if (it.path) {
        const { error: delStErr } = await supabaseClient
          .storage
          .from('recuerdos')
          .remove([it.path]);

        if (delStErr) console.warn("No pude borrar en storage:", delStErr.message);
      }

      await loadFromDB();
    } catch (err) {
      console.error(err);
      alert("Error inesperado borrando.");
      await loadFromDB();
    } finally {
      if (delBtn) delBtn.disabled = false;
      if (editBtn) editBtn.disabled = false;
      if (confirmDeleteBtn) {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Sí, borrémosla';
      }
    }
  };

  // Edit UI: abrir el formulario de edición
  document.getElementById('btn-edit-photo')?.addEventListener('click', () => {
    if (!isAuthed) {
      alert("Inicia sesión para poder editar esta foto.");
      return;
    }
    const f = document.getElementById('lb-edit-form');
    if (f) {
      f.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  });

  const closeEdit = () => {
    const f = document.getElementById('lb-edit-form');
    if (f) f.classList.add('hidden');
    document.body.style.overflow = 'hidden';
  };
  document.getElementById('btn-cancel-edit')?.addEventListener('click', closeEdit);
  document.getElementById('btn-cancel-edit-x')?.addEventListener('click', closeEdit);

  const closeDelete = () => {
    const f = document.getElementById('lb-delete-modal');
    if (f) f.classList.add('hidden');
    document.body.style.overflow = 'hidden';
  };
  document.getElementById('btn-cancel-delete')?.addEventListener('click', closeDelete);
  document.getElementById('btn-cancel-delete-x')?.addEventListener('click', closeDelete);
  document.getElementById('btn-confirm-delete')?.addEventListener('click', performDelete);

  // Cerrar edit al click fuera (overlay)
  const editOverlay = document.getElementById('lb-edit-form');
  const deleteOverlay = document.getElementById('lb-delete-modal');

  document.getElementById('btn-save-edit')?.addEventListener('click', async () => {
    if (!isAuthed) return;

    const status = document.getElementById('lb-edit-status');
    const place = document.getElementById('edit-place')?.value?.trim() || null;
    const mapInput = document.getElementById('edit-map-location');
    const map_location = mapInput?.value?.trim() || null;
    let map_lat = parseCoordinateValue(mapInput?.dataset?.mapLat);
    let map_lng = parseCoordinateValue(mapInput?.dataset?.mapLng);
    const date  = document.getElementById('edit-date')?.value?.trim() || null;
    const album = document.getElementById('edit-album')?.value?.trim() || null;
    const caption = document.getElementById('edit-cap')?.value?.trim() || null;
    const authorSelect = document.getElementById('edit-author');
    const selectedOption = authorSelect?.selectedOptions?.[0] || null;
    const created_by = authorSelect?.value?.trim() || null;
    const author_email = selectedOption?.dataset?.email?.trim() || null;
    const author_name = selectedOption
      ? (selectedOption.dataset?.name?.trim() || formatProfileLabel(selectedOption.textContent, author_email))
      : null;

    if (status) status.textContent = 'Guardando...';

    if (map_location && (!Number.isFinite(map_lat) || !Number.isFinite(map_lng))) {
      const resolved = await window.memoryMapModule?.resolvePlace?.(map_location);
      if (resolved?.lat && resolved?.lng) {
        map_lat = Number(resolved.lat);
        map_lng = Number(resolved.lng);
        if (mapInput) {
          mapInput.dataset.mapLat = String(map_lat);
          mapInput.dataset.mapLng = String(map_lng);
        }
      }
    }
    if (!Number.isFinite(map_lat) || !Number.isFinite(map_lng)) {
      map_lat = null;
      map_lng = null;
    }

    const nextPatch = { place, map_location, map_lat, map_lng, date, album, caption, created_by, author_email, author_name };

    let { error } = await supabaseClient
      .from('photos')
      .update(nextPatch)
      .eq('id', it.id);

    if (error && /column .*created_by|column .*author_email|column .*author_name|column .*map_location|column .*map_lat|column .*map_lng|schema cache|not exist/i.test(error.message || '')) {
      ({ error } = await supabaseClient
        .from('photos')
        .update({ place, date, album, caption })
        .eq('id', it.id));
    }

    if (error){
      if (status) status.textContent = 'Error: ' + error.message;
      return;
    }

    Object.assign(it, nextPatch);
    setStoredPhotoMapLocation(it.id, map_location);
    setStoredPhotoMapPoint(it.id, { lat: map_lat, lng: map_lng });
    allItems = allItems.map(photo => photo.id === it.id ? { ...photo, ...nextPatch } : photo);
    if (Array.isArray(lightbox._items)) {
      lightbox._items = lightbox._items.map(photo => photo.id === it.id ? { ...photo, ...nextPatch } : photo);
    }

    if (status) status.textContent = '¡Listo! ✅';
    renderSuperGallery();
    emitSuperGalleryItems();
    if (map_location) {
      window.dispatchEvent(new CustomEvent('memory-map:focus-place', {
        detail: { place: map_location, photoId: it.id }
      }));
    }
    closeEdit();
    paintLightbox();
  });
}

/**
 * Cerrar lightbox
 */
function closeLightbox() {
  if (!lightbox) return;
  clearModalFocus(lightbox);
  lightbox.classList.add('hidden');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  const frameTop = lightbox.querySelector('.lb-frame-top');
  if (frameTop) frameTop.remove();
  if (syncLightboxChromeTimeout) {
    clearTimeout(syncLightboxChromeTimeout);
    syncLightboxChromeTimeout = null;
  }
  if (syncLightboxChromeTimeoutLate) {
    clearTimeout(syncLightboxChromeTimeoutLate);
    syncLightboxChromeTimeoutLate = null;
  }
  const editForm = document.getElementById('lb-edit-form');
  if (editForm) editForm.remove();
  const deleteForm = document.getElementById('lb-delete-modal');
  if (deleteForm) deleteForm.remove();
  // devolver scroll al body
  document.body.style.overflow = '';
}

/**
 * Navegar en lightbox
 */
function navLightbox(step) {
  const items = lightbox._items || [];
  if (!items.length) return;
  lightboxIndex = (lightboxIndex + step + items.length) % items.length;
  paintLightbox();
}

/**
 * Abrir modal de upload
 */
function openUpload() {
  if (!uploadModal) return;
  setModalFocus(uploadModal, '#upload-files');
  uploadModal.classList.remove('hidden');
  uploadModal.setAttribute('aria-hidden', 'false');
  uploadStatus.textContent = '';
  // Actualizar estado de auth cuando se abre el modal
  window.refreshAuthUI?.();
}

/**
 * Cerrar modal de upload
 */
function closeUpload() {
  if (!uploadModal) return;
  clearModalFocus(uploadModal);
  uploadModal.classList.add('hidden');
  uploadModal.setAttribute('aria-hidden', 'true');
  closeUploadAuthModal();
}

function openUploadAuthModal() {
  const authModal = document.getElementById('upload-auth-modal');
  if (!authModal) return;
  setModalFocus(authModal, '#btn-close-upload-auth');
  try { window.refreshAuthUI?.(); } catch(e){}
  authModal.classList.remove('hidden');
  authModal.setAttribute('aria-hidden', 'false');
}
  const authModal = document.getElementById('upload-auth-modal');
  if (!authModal) return;
  try { window.refreshAuthUI?.(); } catch(e){}
  authModal.classList.remove('hidden');
  authModal.setAttribute('aria-hidden', 'false');
}

function closeUploadAuthModal() {
  const authModal = document.getElementById('upload-auth-modal');
  if (!authModal) return;
  clearModalFocus(authModal);
  authModal.classList.add('hidden');
  authModal.setAttribute('aria-hidden', 'true');
}

function syncUploadInputFiles() {
  if (!uploadFiles) return;
  const dt = new DataTransfer();
  selectedUploadFiles.forEach(file => dt.items.add(file));
  uploadFiles.files = dt.files;
}

function clearUploadPreview() {
  const uploadPreview = document.getElementById('upload-preview');
  uploadObjectUrls.forEach(url => URL.revokeObjectURL(url));
  uploadObjectUrls = [];
  if (uploadPreview) uploadPreview.innerHTML = '';
}

function refreshUploadPreview() {
  const files = selectedUploadFiles || [];
  const count = files.length;
  const albumLabel = document.getElementById('album-label');
  const uploadPreview = document.getElementById('upload-preview');
  const uploadDropzone = document.getElementById('upload-dropzone');

  if (albumField) albumField.style.display = '';

  if (count <= 1) {
    if (albumLabel) albumLabel.textContent = '🖼️ Título';
    if (uploadAlbum) uploadAlbum.placeholder = 'Ej: Mi princesa hermosa...';
  } else {
    if (albumLabel) albumLabel.textContent = '🗂️ Nombre del bloque';
    if (uploadAlbum) uploadAlbum.placeholder = 'Ej: Camping, Playa, Cumpleaños...';
  }

  if (uploadDropzone) {
    uploadDropzone.classList.toggle('has-files', count > 0);
    const title = uploadDropzone.querySelector('.upload-dropzone-title');
    const copy = uploadDropzone.querySelector('.upload-dropzone-copy');
    if (title) title.textContent = count ? `${count} foto${count > 1 ? 's' : ''} seleccionada${count > 1 ? 's' : ''}` : 'Arrastra tus fotos';
    if (copy) copy.textContent = count ? 'Puedes agregar más o cambiar la selección' : 'o toca para seleccionarlas';
  }

  if (!uploadPreview) return;

  clearUploadPreview();

  files.forEach((f, index) => {
    const url = URL.createObjectURL(f);
    uploadObjectUrls.push(url);
    const div = document.createElement('div');
    div.className = 'upload-preview-card';
    div.innerHTML = `
      <button type="button" class="upload-preview-remove" data-index="${index}" aria-label="Quitar foto">✕</button>
      <img src="${url}" alt="">
      <span>${f.name}</span>
    `;
    div.querySelector('.upload-preview-remove')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      selectedUploadFiles = selectedUploadFiles.filter((_, i) => i !== index);
      syncUploadInputFiles();
      refreshUploadPreview();
    });
    uploadPreview.appendChild(div);
  });
}

/**
 * Inicializar galería: wiring de eventos
 */
function initGallery() {
  // Referencias del DOM
  superGallerySection = document.querySelector('.super-gallery');
  superGrid = document.getElementById('super-gallery-grid');
  superGalleryCount = document.getElementById('super-gallery-count');
  superGalleryHead = document.querySelector('.super-gallery-head');
  superGalleryActions = document.querySelector('.super-gallery-actions');
  if (superGalleryActions && !superGalleryActionsSpacer) {
    superGalleryActionsSpacer = document.createElement('div');
    superGalleryActionsSpacer.className = 'super-gallery-actions-spacer';
    superGalleryActions.insertAdjacentElement('afterend', superGalleryActionsSpacer);
  }
  filterPlace = document.getElementById('filter-place');
  searchCaption = document.getElementById('search-caption');
  const btnOpenLogin = document.getElementById('btn-open-login');
  const btnOpenLoginFooter = document.getElementById('btn-open-login-footer');
  btnOpenUpload = document.getElementById('btn-open-upload');
  uploadModal = document.getElementById('upload-modal');
  btnCancelUpload = document.getElementById('btn-cancel-upload');
  btnDoUpload = document.getElementById('btn-do-upload');
  uploadFiles = document.getElementById('upload-files');
  uploadPlace = document.getElementById('upload-place');
  uploadMapLocation = document.getElementById('upload-map-location');
  const btnUploadMapPicker = document.getElementById('btn-upload-map-picker');
  uploadDate = document.getElementById('upload-date');
  uploadCaption = document.getElementById('upload-caption');
  uploadAlbum = document.getElementById('upload-album');
  albumField = document.getElementById('album-field');
  uploadStatus = document.getElementById('upload-status');
  btnClearFilter = document.getElementById('btn-clear-filter');
  if (btnClearFilter && btnClearFilter.parentElement !== document.body) {
    document.body.appendChild(btnClearFilter);
  }
  if (btnClearFilter) {
    btnClearFilter.hidden = true;
    btnClearFilter.disabled = true;
    btnClearFilter.classList.remove('is-visible');
    btnClearFilter.style.display = 'none';
    btnClearFilter.setAttribute('aria-hidden', 'true');
  }
  syncGalleryActionsScrollOffset();
  lightbox = document.getElementById('lightbox');
  lightboxImg = document.getElementById('lightbox-img');
  lightboxCap = document.getElementById('lightbox-cap');
  lightboxClose = document.getElementById('lightbox-close');
  lightboxPrev = document.getElementById('lightbox-prev');
  lightboxNext = document.getElementById('lightbox-next');

  btnUploadMapPicker?.addEventListener('click', async () => {
    const currentValue = uploadMapLocation?.value || '';
    const picked = await window.memoryMapModule?.openPicker?.({ initialPlace: currentValue });
    if (!picked?.label || !uploadMapLocation) return;
    uploadMapLocation.value = picked.label;
    uploadMapLocation.dataset.mapLat = String(picked.lat || '');
    uploadMapLocation.dataset.mapLng = String(picked.lng || '');
    updateUploadMapLocationDisplay(picked.label);
  });
  updateUploadMapLocationDisplay(uploadMapLocation?.value || '');

  // Event listeners: lightbox
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox || lightbox.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navLightbox(-1);
    if (e.key === 'ArrowRight') navLightbox(1);
  });
  lightboxPrev?.addEventListener('click', () => navLightbox(-1));
  lightboxNext?.addEventListener('click', () => navLightbox(1));
  window.addEventListener('resize', () => {
    syncGalleryActionsScrollOffset();
    if (!lightbox || lightbox.classList.contains('hidden')) return;
    const frameTop = lightbox.querySelector('.lb-frame-top');
    if (!frameTop || !lightboxImg) return;
    const rect = lightboxImg.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const navSize = 52;
    const navMargin = viewportWidth <= 640 ? 10 : 18;
    const navTop = Math.min(
      Math.max(38, rect.top + (rect.height / 2)),
      Math.max(38, viewportHeight - 38)
    );
    const prevLeft = Math.max(navMargin, rect.left - 60);
    const nextLeft = Math.min(
      Math.max(navMargin, viewportWidth - navSize - navMargin),
      rect.right + 10
    );
    frameTop.style.top = `${Math.max(12, rect.top + 14)}px`;
    frameTop.style.left = `${rect.left + 14}px`;
    frameTop.style.width = `${Math.max(0, rect.width - 28)}px`;
    if (lightboxPrev) {
      lightboxPrev.style.left = `${prevLeft}px`;
      lightboxPrev.style.right = 'auto';
      lightboxPrev.style.top = `${navTop}px`;
    }
    if (lightboxNext) {
      lightboxNext.style.left = `${nextLeft}px`;
      lightboxNext.style.right = 'auto';
      lightboxNext.style.top = `${navTop}px`;
    }
    requestAnimationFrame(() => {
      const nextRect = lightboxImg.getBoundingClientRect();
      if (!nextRect.width || !nextRect.height) return;
      const nextViewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
      const nextViewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const nextNavMargin = nextViewportWidth <= 640 ? 10 : 18;
      const nextNavTop = Math.min(
        Math.max(38, nextRect.top + (nextRect.height / 2)),
        Math.max(38, nextViewportHeight - 38)
      );
      const nextPrevLeft = Math.max(nextNavMargin, nextRect.left - 60);
      const nextNextLeft = Math.min(
        Math.max(nextNavMargin, nextViewportWidth - navSize - nextNavMargin),
        nextRect.right + 10
      );
      frameTop.style.top = `${Math.max(12, nextRect.top + 14)}px`;
      frameTop.style.left = `${nextRect.left + 14}px`;
      frameTop.style.width = `${Math.max(0, nextRect.width - 28)}px`;
      if (lightboxPrev) {
        lightboxPrev.style.left = `${nextPrevLeft}px`;
        lightboxPrev.style.top = `${nextNavTop}px`;
      }
      if (lightboxNext) {
        lightboxNext.style.left = `${nextNextLeft}px`;
        lightboxNext.style.top = `${nextNavTop}px`;
      }
    });
  });

  // Nota: el centrado ya lo controla CSS; no hace falta listener aquí

  // Auth UI references inside modal
  const authEmail = document.getElementById('auth-email');
  const authPass  = document.getElementById('auth-pass');
  const btnLogin  = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const authState = document.getElementById('auth-state');
  const authModalState = document.getElementById('auth-modal-state');
  const authModalActiveEmail = document.getElementById('auth-modal-active-email');
  const authDisplayNameWrap = document.getElementById('auth-display-name-wrap');
  const authDisplayNameInput = document.getElementById('auth-display-name-input');
  const btnEditDisplayName = document.getElementById('btn-edit-display-name');
  const btnSaveDisplayName = document.getElementById('btn-save-display-name');
  const authFormView = document.getElementById('upload-auth-form-view');
  const authActiveView = document.getElementById('upload-auth-active-view');
  const authBox = document.getElementById('auth-box');
  const btnCloseUploadX = document.getElementById('btn-close-upload-x');
  const uploadDropzone = document.getElementById('upload-dropzone');
  const btnCloseUploadAuth = document.getElementById('btn-close-upload-auth');
  const uploadAuthModal = document.getElementById('upload-auth-modal');

  // Función para refrescar UI de auth (expuesta para poder llamarla desde openUpload)
  async function refreshAuthUI() {
    if (!authState) return;
    if (!supabaseClient) {
      authState.textContent = 'SDK de Supabase no cargado.';
      if (authModalState) authModalState.textContent = 'SDK de Supabase no cargado.';
      if (btnLogout) btnLogout.style.display = 'none';
      return;
    }

    try {
      const { data } = await supabaseClient.auth.getSession();
      const session = data?.session;

      if (session) {
          const displayName = await getSessionDisplayName(session);
          const needsName = !displayName;
          authState.textContent = displayName ? `Sesión activa: ${displayName}` : `Sesión activa: ${session.user.email}`;
          if (authModalState) authModalState.textContent = needsName ? 'Pon el nombre con el que quieres aparecer.' : '';
          if (authModalActiveEmail) authModalActiveEmail.textContent = displayName || session.user.email;
          if (authDisplayNameWrap) authDisplayNameWrap.classList.toggle('hidden', !needsName);
          if (authDisplayNameInput) authDisplayNameInput.value = displayName || '';
          if (btnEditDisplayName) btnEditDisplayName.style.display = needsName ? 'none' : '';
          if (authFormView) authFormView.classList.add('hidden');
          if (authActiveView) authActiveView.classList.remove('hidden');
          if (authBox) authBox.classList.add('is-authed');
          if (btnOpenLogin) btnOpenLogin.textContent = '🔓 Cerrar sesión';
          if (btnOpenLoginFooter) btnOpenLoginFooter.textContent = '🔓';
          if (btnOpenLoginFooter) btnOpenLoginFooter.setAttribute('aria-label', 'Cerrar sesión');
          if (btnOpenLoginFooter) btnOpenLoginFooter.setAttribute('title', 'Cerrar sesión');
          isAuthed = true;
      } else {
        authState.textContent = 'No has iniciado sesión.';
        if (authModalState) authModalState.textContent = 'Pon tus datos para iniciar sesión.';
          if (authModalActiveEmail) authModalActiveEmail.textContent = '';
          if (authDisplayNameWrap) authDisplayNameWrap.classList.add('hidden');
          if (authDisplayNameInput) authDisplayNameInput.value = '';
          if (btnEditDisplayName) btnEditDisplayName.style.display = '';
          if (authFormView) authFormView.classList.remove('hidden');
          if (authActiveView) authActiveView.classList.add('hidden');
          if (authBox) authBox.classList.remove('is-authed');
          if (btnOpenLogin) btnOpenLogin.textContent = '🔐 Iniciar sesión';
          if (btnOpenLoginFooter) btnOpenLoginFooter.textContent = '🔐';
          if (btnOpenLoginFooter) btnOpenLoginFooter.setAttribute('aria-label', 'Iniciar sesión');
          if (btnOpenLoginFooter) btnOpenLoginFooter.setAttribute('title', 'Iniciar sesión');
          isAuthed = false;
      }
    } catch (e) {
      console.error('refreshAuthUI error', e);
      authState.textContent = 'Error comprobando sesión.';
      if (authModalState) authModalState.textContent = 'Error comprobando sesión.';
    }
      // actualizar UI de la galería (para que botones admin aparezcan/no aparezcan)
      try { renderSuperGallery(); } catch(e){/* noop */}
  }
  // Exponer para que openUpload pueda invocarla
  window.refreshAuthUI = refreshAuthUI;

  // Login
  btnLogin?.addEventListener('click', async () => {
    if (!supabaseClient) {
      authModalState && (authModalState.textContent = 'Supabase no está listo.');
      return;
    }
    const email = (authEmail?.value || '').trim();
    const password = (authPass?.value || '').trim();
    if (!email || !password) {
      authModalState && (authModalState.textContent = 'Pon tu correo y contraseña.');
      return;
    }

    authModalState && (authModalState.textContent = 'Iniciando sesión...');
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      authModalState && (authModalState.textContent = 'Error: ' + error.message);
      return;
    }

    if (authPass) authPass.value = '';
    const { data } = await supabaseClient.auth.getSession();
    if (data?.session) {
      const existingName = await getSessionDisplayName(data.session);
      if (!existingName) {
        if (authModalState) authModalState.textContent = 'Falta tu nombre para terminar.';
      }
    }
    await refreshAuthUI();
    authModalState && (authModalState.textContent = 'Sesión iniciada ✅');
  });

  btnEditDisplayName?.addEventListener('click', async () => {
    const { data } = await supabaseClient.auth.getSession();
    if (!data?.session) return;
    const currentName = await getSessionDisplayName(data.session);
    if (authDisplayNameWrap) authDisplayNameWrap.classList.remove('hidden');
    if (authDisplayNameInput) {
      authDisplayNameInput.value = currentName || '';
      authDisplayNameInput.focus();
    }
    if (btnEditDisplayName) btnEditDisplayName.style.display = 'none';
    if (authModalState) authModalState.textContent = 'Cambia tu nombre y guárdalo.';
  });

  btnSaveDisplayName?.addEventListener('click', async () => {
    if (!supabaseClient) return;
    const { data } = await supabaseClient.auth.getSession();
    const session = data?.session;
    if (!session) return;
    const nextName = (authDisplayNameInput?.value || '').trim();
    if (!nextName) {
      if (authModalState) authModalState.textContent = 'Escribe el nombre con el que quieres aparecer.';
      return;
    }

    const { error } = await supabaseClient
      .from('profiles')
      .upsert({
        id: session.user.id,
        email: session.user.email,
        display_name: nextName
      }, { onConflict: 'id' });

    if (error) {
      if (authModalState) authModalState.textContent = 'Error guardando nombre: ' + error.message;
      return;
    }

    await refreshAuthUI();
    window.dispatchEvent(new CustomEvent('profile:name-updated', {
      detail: {
        userId: session.user.id,
        email: session.user.email,
        displayName: nextName
      }
    }));
    if (authModalState) authModalState.textContent = 'Nombre guardado ✅';
  });

  // Logout
  btnLogout?.addEventListener('click', async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    await refreshAuthUI();
    if (authModalState) authModalState.textContent = 'Sesión cerrada.';
  });

  // Event listeners: filtros
  filterPlace?.addEventListener('change', renderSuperGallery);
  searchCaption?.addEventListener('input', () => {
    sanitizeSearchCaptionInput();
    renderSuperGallery();
  });
  searchCaption?.addEventListener('change', () => {
    sanitizeSearchCaptionInput();
    renderSuperGallery();
  });
  searchCaption?.addEventListener('blur', sanitizeSearchCaptionInput);
  sanitizeSearchCaptionInput();
  btnClearFilter?.addEventListener('click', () => {
    activeAlbum = "";
    if (filterPlace) filterPlace.value = "";
    if (searchCaption) searchCaption.value = "";
    shuffledOrder = null;
    renderSuperGallery();
  });
  window.addEventListener('scroll', syncGalleryActionsScrollOffset, { passive: true });

  // Event listeners: login + modal upload
  btnOpenLogin?.addEventListener('click', openUploadAuthModal);
  btnOpenLoginFooter?.addEventListener('click', openUploadAuthModal);
  btnOpenUpload?.addEventListener('click', openUpload);
  btnCancelUpload?.addEventListener('click', closeUpload);
  btnCloseUploadX?.addEventListener('click', closeUpload);
  btnCloseUploadAuth?.addEventListener('click', closeUploadAuthModal);

  // Mostrar/ocultar campo de álbum según cantidad de archivos + generar preview
  uploadFiles?.addEventListener('change', () => {
    selectedUploadFiles = Array.from(uploadFiles.files || []);
    refreshUploadPreview();
  });

  const preventDropDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
    uploadDropzone?.addEventListener(evt, preventDropDefaults);
  });
  ['dragenter', 'dragover'].forEach(evt => {
    uploadDropzone?.addEventListener(evt, () => uploadDropzone.classList.add('is-dragover'));
  });
  ['dragleave', 'drop'].forEach(evt => {
    uploadDropzone?.addEventListener(evt, () => uploadDropzone.classList.remove('is-dragover'));
  });
  uploadDropzone?.addEventListener('drop', (e) => {
    const files = Array.from(e.dataTransfer?.files || []).filter(file => file.type.startsWith('image/'));
    if (!files.length || !uploadFiles) return;
    selectedUploadFiles = files;
    syncUploadInputFiles();
    refreshUploadPreview();
  });

  // Subir (guardar en Supabase Storage + insertar en tabla photos)
  btnDoUpload?.addEventListener('click', async () => {
    const files = selectedUploadFiles;
    if (!files || !files.length) {
      uploadStatus.textContent = 'Selecciona al menos una foto.';
      return;
    }

    if (!supabaseClient) {
      uploadStatus.textContent = 'Supabase no está listo.';
      return;
    }

    // Verificar sesión
    if (!isAuthed) {
      uploadStatus.textContent = 'Inicia sesión para poder subir.';
      openUploadAuthModal();
      return;
    }

    const place = (uploadPlace?.value || '').trim();
    const map_location = (uploadMapLocation?.value || '').trim();
    let map_lat = parseCoordinateValue(uploadMapLocation?.dataset?.mapLat);
    let map_lng = parseCoordinateValue(uploadMapLocation?.dataset?.mapLng);
    const date = (uploadDate?.value || '').trim();
    const caption = (uploadCaption?.value || '').trim();
    const album = (uploadAlbum?.value || '').trim() || null;
    const { data: authData } = await supabaseClient.auth.getSession();
    const session = authData?.session || null;
    const authorId = session?.user?.id || null;
    const authorEmail = session?.user?.email || null;
    const ownProfile = authorId ? await fetchProfileById(authorId) : null;
    const authorName = ownProfile?.display_name || null;

    if (map_location && (!Number.isFinite(map_lat) || !Number.isFinite(map_lng))) {
      const resolved = await window.memoryMapModule?.resolvePlace?.(map_location);
      if (resolved?.lat && resolved?.lng) {
        map_lat = Number(resolved.lat);
        map_lng = Number(resolved.lng);
        if (uploadMapLocation) {
          uploadMapLocation.dataset.mapLat = String(map_lat);
          uploadMapLocation.dataset.mapLng = String(map_lng);
        }
      }
    }
    if (!Number.isFinite(map_lat) || !Number.isFinite(map_lng)) {
      map_lat = null;
      map_lng = null;
    }

    uploadStatus.textContent = 'Subiendo a Supabase...';

    try {
      for (const f of files) {
        // nombre seguro
        const ext = (f.name.split('.').pop() || 'jpg').toLowerCase();
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const path = `recuerdos/${Date.now()}_${fileName}`;

        // 1) Subir al bucket
        const { error: upErr } = await supabaseClient
          .storage
          .from('recuerdos')
          .upload(path, f, { upsert: false });

        if (upErr) {
          uploadStatus.textContent = 'Error subiendo: ' + upErr.message;
          return;
        }

        // 2) URL pública
        const { data: pub } = supabaseClient.storage.from('recuerdos').getPublicUrl(path);
        const url = pub?.publicUrl;

        // 3) Insertar en DB
        let { data: insertedPhoto, error: insErr } = await supabaseClient
          .from('photos')
          .insert([{
            url,
            path,
            place: place || null,
            map_location: map_location || null,
            map_lat: map_lat,
            map_lng: map_lng,
            date: date || null,
            caption: caption || null,
            album: album || null,
            created_by: authorId,
            author_email: authorEmail,
            author_name: authorName
          }])
          .select('id')
          .single();

        if (insErr && /column .*created_by|column .*author_email|column .*author_name|column .*map_location|column .*map_lat|column .*map_lng|schema cache|not exist/i.test(insErr.message || '')) {
          ({ data: insertedPhoto, error: insErr } = await supabaseClient
            .from('photos')
            .insert([{
              url,
              path,
              place: place || null,
              date: date || null,
              caption: caption || null,
              album: album || null
            }])
            .select('id')
            .single()); 
        }

        if (insErr) {
          uploadStatus.textContent = 'Error guardando en BD: ' + insErr.message;
          return;
        }

        if (insertedPhoto?.id && map_location) {
          setStoredPhotoMapLocation(insertedPhoto.id, map_location);
          setStoredPhotoMapPoint(insertedPhoto.id, { lat: map_lat, lng: map_lng });
        }
      }

      uploadStatus.textContent = '¡Listo! 💖';

      // limpiar
      selectedUploadFiles = [];
      uploadFiles.value = '';
      uploadPlace.value = '';
      if (uploadMapLocation) {
        uploadMapLocation.value = '';
        delete uploadMapLocation.dataset.mapLat;
        delete uploadMapLocation.dataset.mapLng;
      }
      updateUploadMapLocationDisplay('');
      uploadDate.value = '';
      uploadCaption.value = '';
      if (uploadAlbum) uploadAlbum.value = '';
      if (albumField) albumField.style.display = 'none';
      clearUploadPreview();
      refreshUploadPreview();

      closeUpload();

      // recargar desde BD
      await loadFromDB();
      if (map_location) {
        window.dispatchEvent(new CustomEvent('memory-map:focus-place', {
          detail: { place: map_location }
        }));
      }

    } catch (e) {
      console.error(e);
      uploadStatus.textContent = 'Error inesperado subiendo.';
    }
  });

  // Render inicial
  shuffledOrder = null;
  activeAlbum = "";
  
  // Verificar sesión al iniciar la página
  (async () => {
    if (!supabaseClient) return;
    const { data } = await supabaseClient.auth.getSession();
    isAuthed = !!data?.session;
    renderSuperGallery();
  })();
}

// Exportar para app.js
window.galleryModule = {
  initGallery,
  allItems: () => allItems,
  viewItems: () => viewItems
};

// Cargar desde la BD al final del archivo (siempre que el cliente exista)
function emitSuperGalleryItems() {
  window.dispatchEvent(new CustomEvent('superGallery:items', {
    detail: { items: allItems }
  }));
}

async function loadFromDB() {
  if (!supabaseClient) {
    console.warn('Supabase client no inicializado, no se cargará la BD.');
    allItems = [];
    renderSuperGallery();
    emitSuperGalleryItems();
    return;
  }

  try {
    isGalleryLoading = true;
    galleryLoadingStartedAt = Date.now();
    renderSuperGallery();
    const { data, error } = await supabaseClient
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error cargando fotos:", error.message || error);
      allItems = [];
      renderSuperGallery();
      emitSuperGalleryItems();
      return;
    }

    const profileRows = await fetchProfilesList();
    const profileById = new Map((profileRows || []).map(profile => [String(profile.id || '').trim(), profile]));

    allItems = (data || []).map(item => {
      const profile = profileById.get(String(item.created_by || item.author_id || item.user_id || '').trim());
      const resolvedAuthorName = profile?.display_name || item.author_name || item.uploaded_by_name || null;
      const resolvedAuthorEmail = profile?.email || item.author_email || item.uploaded_by_email || null;
      return ({
      ...item,
      author_name: resolvedAuthorName,
      author_email: resolvedAuthorEmail,
      map_location: item.map_location || getStoredPhotoMapLocation(item.id) || null,
      map_lat: item.map_lat ?? getStoredPhotoMapPoint(item.id)?.lat ?? null,
      map_lng: item.map_lng ?? getStoredPhotoMapPoint(item.id)?.lng ?? null
      });
    });
    shuffledOrder = null; // mezclar una sola vez por carga
    const elapsed = Date.now() - galleryLoadingStartedAt;
    const waitMore = Math.max(0, 1500 - elapsed);
    if (waitMore) {
      await new Promise(resolve => setTimeout(resolve, waitMore));
    }
    isGalleryLoading = false;
    renderSuperGallery();
    emitSuperGalleryItems();
  } catch (e) {
    console.error('Error en loadFromDB:', e);
    allItems = [];
    const elapsed = Date.now() - galleryLoadingStartedAt;
    const waitMore = Math.max(0, 1500 - elapsed);
    if (waitMore) {
      await new Promise(resolve => setTimeout(resolve, waitMore));
    }
    isGalleryLoading = false;
    renderSuperGallery();
    emitSuperGalleryItems();
  }
}

// Llamada inicial para poblar la galería desde la BD
loadFromDB();
