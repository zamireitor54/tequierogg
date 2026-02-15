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

// Referencias del DOM
let superGrid, filterPlace, searchCaption, btnOpenUpload, uploadModal, btnCancelUpload;
let btnDoUpload, uploadFiles, uploadPlace, uploadDate, uploadCaption, uploadAlbum, albumField;
let uploadStatus, btnClearFilter, lightbox, lightboxImg, lightboxCap, lightboxClose;
let lightboxPrev, lightboxNext;

/**
 * Helper: obtener lugares únicos de los items
 */
function uniquePlaces(items) {
  const set = new Set(items.map(i => (i.place || '').trim()).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
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
  const q = (searchCaption?.value || '').trim().toLowerCase();
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
  renderPlaceFilter();

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

  // Mostrar/ocultar botón "Quitar filtro"
  if (btnClearFilter) {
    btnClearFilter.style.display = activeAlbum ? '' : 'none';
  }

  superGrid.innerHTML = '';
  if (!items.length) {
    superGrid.innerHTML = `
    <div class="msg" style="grid-column:1/-1">
      Aquí van tus recuerdos 💞<br>
      Pulsa <strong>"Subir recuerdo"</strong> para agregar fotos con lugar y fecha.
    </div>`;
    return;
  }

  items.forEach((it, idx) => {
    const card = document.createElement('div');
    card.className = 'sg-item';

    card.innerHTML = `
    <img src="${it.url}" alt="recuerdo">
    <div class="sg-meta">
      <div class="top">
        <span class="sg-pill">🗂️ ${it.album || 'Sin bloque'}</span>
        <span class="sg-pill">📍 ${it.place || '—'}</span>
      </div>
      <div class="cap">📅 ${formatNiceDate(it.date) || ''} — ${it.caption || ''}</div>
    </div>`;
    card.addEventListener('click', () => openLightbox(items, idx));
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
}

/**
 * Abrir lightbox (modal de foto grande)
 */
function openLightbox(items, idx) {
  if (!lightbox) return;
  lightbox.classList.remove('hidden');
  lightbox.setAttribute('aria-hidden', 'false');
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

  const albumName = (it.album || '').trim();
  const niceDate = formatNiceDate(it.date) || '';

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

  const btnAdmin = isAuthed ? `
    <div class="lb-admin">
      <button id="btn-edit-photo" class="lb-icon" title="Editar">✏️</button>
      <button id="btn-delete-photo" class="lb-icon danger" title="Eliminar">🗑️</button>
    </div>
  ` : '';

  // Renderizar el album: título grande para foto individual, badge para bloque
  const albumDisplay = albumName
    ? isBlock
      ? `<span class="lightbox-badge">🗂️ ${albumName}</span>`
      : `<div class="lightbox-title">${albumName}</div>`
    : '';

  lightboxCap.innerHTML = `
    <div class="lightbox-meta">
      ${albumDisplay}
      <span class="lightbox-pill">📍 ${it.place || '—'}</span>
      <span class="lightbox-pill">📅 ${niceDate}</span>
      ${btnReunir}
      ${activeAlbum ? `<button id="btn-volver-mezcla" class="btn small outline">Volver a mezclar</button>` : ''}
    </div>

    <div class="lightbox-text">${it.caption || ''}</div>

    ${btnAdmin}

    ${isAuthed ? `
      <div id="lb-edit-form" class="lb-edit hidden">
        <div class="lb-edit-card">
          <div class="lb-edit-head">
            <div class="lb-edit-title">Editar recuerdo ✨</div>
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
              <span>🗂️ Bloque</span>
              <input id="edit-album" class="input" placeholder="Ej: Camping, Playa..." value="${(it.album||'').replaceAll('"','&quot;')}" />
            </label>

            <label class="lb-field lb-span-2">
              <span>💌 Mensajito</span>
              <textarea id="edit-cap" class="textarea" rows="4" placeholder="Escribe algo lindo...">${it.caption || ''}</textarea>
            </label>
          </div>

          <div class="lb-edit-actions">
            <button id="btn-cancel-edit" class="btn small outline">Cancelar</button>
            <button id="btn-save-edit" class="btn small">Guardar 💾</button>
          </div>

          <div id="lb-edit-status" class="muted" style="margin-top:8px;"></div>
        </div>
      </div>
    ` : ''}
  `;

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
    if (!isAuthed) return;

    const ok = confirm("¿Seguro que quieres borrar esta foto? 😥");
    if (!ok) return;

    const delBtn = document.getElementById('btn-delete-photo');
    const editBtn = document.getElementById('btn-edit-photo');
    if (delBtn) delBtn.disabled = true;
    if (editBtn) editBtn.disabled = true;

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
    }
  });

  // Edit UI: abrir el formulario de edición
  document.getElementById('btn-edit-photo')?.addEventListener('click', () => {
    const f = document.getElementById('lb-edit-form');
    if (f) {
      f.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  });

  const closeEdit = () => {
    const f = document.getElementById('lb-edit-form');
    if (f) f.classList.add('hidden');
    document.body.style.overflow = '';
  };
  document.getElementById('btn-cancel-edit')?.addEventListener('click', closeEdit);
  document.getElementById('btn-cancel-edit-x')?.addEventListener('click', closeEdit);

  // Cerrar edit al click fuera (overlay)
  const editOverlay = document.getElementById('lb-edit-form');
  editOverlay?.addEventListener('click', (e) => {
    if (e.target === editOverlay) closeEdit();
  });

  document.getElementById('btn-save-edit')?.addEventListener('click', async () => {
    if (!isAuthed) return;

    const status = document.getElementById('lb-edit-status');
    const place = document.getElementById('edit-place')?.value?.trim() || null;
    const date  = document.getElementById('edit-date')?.value?.trim() || null;
    const album = document.getElementById('edit-album')?.value?.trim() || null;
    const caption = document.getElementById('edit-cap')?.value?.trim() || null;

    if (status) status.textContent = 'Guardando...';

    const { error } = await supabaseClient
      .from('photos')
      .update({ place, date, album, caption })
      .eq('id', it.id);

    if (error){
      if (status) status.textContent = 'Error: ' + error.message;
      return;
    }

    if (status) status.textContent = '¡Listo! ✅';
    closeEdit();
    await loadFromDB();
    closeLightbox();
  });
}

/**
 * Cerrar lightbox
 */
function closeLightbox() {
  lightbox.classList.add('hidden');
  lightbox.setAttribute('aria-hidden', 'true');
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
  uploadModal.classList.add('hidden');
  uploadModal.setAttribute('aria-hidden', 'true');
}

/**
 * Inicializar galería: wiring de eventos
 */
function initGallery() {
  // Referencias del DOM
  superGrid = document.getElementById('super-gallery-grid');
  filterPlace = document.getElementById('filter-place');
  searchCaption = document.getElementById('search-caption');
  btnOpenUpload = document.getElementById('btn-open-upload');
  uploadModal = document.getElementById('upload-modal');
  btnCancelUpload = document.getElementById('btn-cancel-upload');
  btnDoUpload = document.getElementById('btn-do-upload');
  uploadFiles = document.getElementById('upload-files');
  uploadPlace = document.getElementById('upload-place');
  uploadDate = document.getElementById('upload-date');
  uploadCaption = document.getElementById('upload-caption');
  uploadAlbum = document.getElementById('upload-album');
  albumField = document.getElementById('album-field');
  uploadStatus = document.getElementById('upload-status');
  btnClearFilter = document.getElementById('btn-clear-filter');
  lightbox = document.getElementById('lightbox');
  lightboxImg = document.getElementById('lightbox-img');
  lightboxCap = document.getElementById('lightbox-cap');
  lightboxClose = document.getElementById('lightbox-close');
  lightboxPrev = document.getElementById('lightbox-prev');
  lightboxNext = document.getElementById('lightbox-next');

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

  // Auth UI references inside modal
  const authEmail = document.getElementById('auth-email');
  const authPass  = document.getElementById('auth-pass');
  const btnLogin  = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const authState = document.getElementById('auth-state');

  // Función para refrescar UI de auth (expuesta para poder llamarla desde openUpload)
  async function refreshAuthUI() {
    if (!authState) return;
    if (!supabaseClient) {
      authState.textContent = 'SDK de Supabase no cargado.';
      if (btnLogout) btnLogout.style.display = 'none';
      return;
    }

    try {
      const { data } = await supabaseClient.auth.getSession();
      const session = data?.session;

      if (session) {
          authState.textContent = `Sesión: ${session.user.email}`;
          if (btnLogout) btnLogout.style.display = '';
          isAuthed = true;
      } else {
        authState.textContent = 'No has iniciado sesión.';
        if (btnLogout) btnLogout.style.display = 'none';
          isAuthed = false;
      }
    } catch (e) {
      console.error('refreshAuthUI error', e);
      authState.textContent = 'Error comprobando sesión.';
    }
      // actualizar UI de la galería (para que botones admin aparezcan/no aparezcan)
      try { renderSuperGallery(); } catch(e){/* noop */}
  }
  // Exponer para que openUpload pueda invocarla
  window.refreshAuthUI = refreshAuthUI;

  // Login
  btnLogin?.addEventListener('click', async () => {
    if (!supabaseClient) {
      authState && (authState.textContent = 'Supabase no está listo.');
      return;
    }
    const email = (authEmail?.value || '').trim();
    const password = (authPass?.value || '').trim();
    if (!email || !password) {
      authState && (authState.textContent = 'Pon tu correo y contraseña.');
      return;
    }

    authState && (authState.textContent = 'Iniciando sesión...');
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      authState && (authState.textContent = 'Error: ' + error.message);
      return;
    }

    if (authPass) authPass.value = '';
    await refreshAuthUI();
    authState && (authState.textContent = 'Sesión iniciada ✅ Ya puedes subir.');
  });

  // Logout
  btnLogout?.addEventListener('click', async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    await refreshAuthUI();
    authState && (authState.textContent = 'Sesión cerrada.');
  });

  // Event listeners: filtros
  filterPlace?.addEventListener('change', renderSuperGallery);
  searchCaption?.addEventListener('input', renderSuperGallery);
  btnClearFilter?.addEventListener('click', () => {
    activeAlbum = "";
    shuffledOrder = null;
    renderSuperGallery();
  });

  // Event listeners: modal upload
  btnOpenUpload?.addEventListener('click', openUpload);
  btnCancelUpload?.addEventListener('click', closeUpload);
  uploadModal?.addEventListener('click', (e) => { if (e.target === uploadModal) closeUpload(); });

  const uploadPreview = document.getElementById('upload-preview');

  // Mostrar/ocultar campo de álbum según cantidad de archivos + generar preview
  uploadFiles?.addEventListener('change', () => {
    const files = uploadFiles.files || [];
    const count = files.length;

    const albumLabel = document.getElementById('album-label');
    const uploadPreview = document.getElementById('upload-preview');

    // Siempre mostrar campo
    if (albumField) albumField.style.display = '';

    if (count <= 1) {
      // UNA FOTO
      if (albumLabel) albumLabel.textContent = '🖼️ Nombre de la foto';
      if (uploadAlbum) uploadAlbum.placeholder = 'Ej: Mi princesa hermosa...';
    } else {
      // VARIAS FOTOS
      if (albumLabel) albumLabel.textContent = '🗂️ Nombre del bloque';
      if (uploadAlbum) uploadAlbum.placeholder = 'Ej: Camping, Playa, Cumpleaños...';
    }

    // ===== preview miniatura =====
    if (!uploadPreview) return;

    uploadPreview.innerHTML = '';

    for (const f of files){
      const url = URL.createObjectURL(f);
      const div = document.createElement('div');
      div.className = 'upload-thumb';
      div.innerHTML = `
        <img src="${url}" alt="">
        <span>${f.name}</span>
      `;
      uploadPreview.appendChild(div);
    }
  });

  // Subir (guardar en Supabase Storage + insertar en tabla photos)
  btnDoUpload?.addEventListener('click', async () => {
    const files = uploadFiles?.files;
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
      uploadStatus.textContent = 'Inicia sesión arriba para poder subir.';
      return;
    }

    const place = (uploadPlace?.value || '').trim();
    const date = (uploadDate?.value || '').trim();
    const caption = (uploadCaption?.value || '').trim();
    const album = (uploadAlbum?.value || '').trim() || null;

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
        const { error: insErr } = await supabaseClient
          .from('photos')
          .insert([{
            url,
            path,
            place: place || null,
            date: date || null,
            caption: caption || null,
            album: album || null
          }]);

        if (insErr) {
          uploadStatus.textContent = 'Error guardando en BD: ' + insErr.message;
          return;
        }
      }

      uploadStatus.textContent = '¡Listo! 💖';

      // limpiar
      uploadFiles.value = '';
      uploadPlace.value = '';
      uploadDate.value = '';
      uploadCaption.value = '';
      if (uploadAlbum) uploadAlbum.value = '';
      if (albumField) albumField.style.display = 'none';
      const uploadPreview = document.getElementById('upload-preview');
      if (uploadPreview) {
        if (uploadPreview._urls) {
          for (const u of uploadPreview._urls) URL.revokeObjectURL(u);
          uploadPreview._urls = [];
        }
        uploadPreview.innerHTML = '';
      }

      closeUpload();

      // recargar desde BD
      await loadFromDB();

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
async function loadFromDB() {
  if (!supabaseClient) {
    console.warn('Supabase client no inicializado, no se cargará la BD.');
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error cargando fotos:", error.message || error);
      return;
    }

    allItems = data || [];
    shuffledOrder = null; // mezclar una sola vez por carga
    renderSuperGallery();
  } catch (e) {
    console.error('Error en loadFromDB:', e);
  }
}

// Llamada inicial para poblar la galería desde la BD
loadFromDB();
