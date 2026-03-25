// notes.js (3 cuadernos compartidos: general, geral, zamir)
(function(){
  const fab = document.getElementById('notes-fab');
  const modal = document.getElementById('notes-modal');
  const closeBtn = document.getElementById('notes-close');

  const input = document.getElementById('notes-input');
  const btnAdd = document.getElementById('notes-add');
  const btnClear = document.getElementById('notes-clear');
  const list = document.getElementById('notes-list');
  const status = document.getElementById('notes-status');
  const tabs = Array.from(document.querySelectorAll('.notes-tab'));
  let notesProfilesMap = { byId: {}, byEmail: {} };

  let activeCat = 'general';
  let notesLoadingStartedAt = 0;
  const CAT_META = {
    general: { name: 'General', empty: 'No hay notas en General aún 🌸', whoYou: 'Tú', whoOther: 'Otra persona', tone: 'general' },
    geral: { name: 'Para Geral', empty: 'No hay notas en Para Geral aún 💗', whoYou: 'Tú', whoOther: 'Otra persona', tone: 'geral' },
    zamir: { name: 'Para Zamir', empty: 'No hay notas en Para Zamir aún 🖤', whoYou: 'Tú', whoOther: 'Otra persona', tone: 'zamir' }
  };
  function renderNotesLoading(){
    if(!list) return;
    list.innerHTML = `
      <div class="notes-loading">
        <div class="notes-loading-top">
          <div class="notes-loading-badge">Cargando notas</div>
          <div class="notes-loading-dots"><span></span><span></span><span></span></div>
        </div>
        <div class="notes-loading-copy">Cargando las noticas mi amor del cuadernito.</div>
        <div class="notes-loading-list">
          <div class="notes-loading-card"></div>
          <div class="notes-loading-card"></div>
          <div class="notes-loading-card short"></div>
        </div>
      </div>`;
  }

  function niceTime(iso){
    try{
      const d = new Date(iso);
      const date = new Intl.DateTimeFormat('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(d);
      const time = new Intl.DateTimeFormat('es-CO', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(d).replace(/\./g, '').replace(/\s+/g, ' ').trim();
      return `${date} · ${time}`;
    } catch { return ''; }
  }

  function formatAuthorLabel(authorName, email, authorId, session){
    if (authorName) return String(authorName).trim();

    if (email) {
      const clean = String(email).trim().toLowerCase();
      const local = clean.split('@')[0] || clean;
      return local
        .split(/[._-]+/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }

    if (authorId) {
      return authorId === session?.user?.id ? 'Tú' : 'Otra persona';
    }

    return 'Nuestro cuadernito';
  }

  async function loadProfilesMap(){
    const sb = window.supabaseClient;
    if(!sb) return { byId: {}, byEmail: {} };

    const { data, error } = await sb
      .from('profiles')
      .select('id, email, display_name');

    if(error || !data){
      return { byId: {}, byEmail: {} };
    }

    return data.reduce((acc, profile) => {
      if (profile?.id) acc.byId[profile.id] = profile.display_name || '';
      if (profile?.email) acc.byEmail[String(profile.email).trim().toLowerCase()] = profile.display_name || '';
      return acc;
    }, { byId: {}, byEmail: {} });
  }

  function rememberProfileName(profile = {}){
    const displayName = String(profile.displayName || profile.display_name || '').trim();
    const userId = String(profile.userId || profile.id || '').trim();
    const email = String(profile.email || '').trim().toLowerCase();
    if (userId && displayName) notesProfilesMap.byId[userId] = displayName;
    if (email && displayName) notesProfilesMap.byEmail[email] = displayName;
  }

  function open(){
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    notesLoadingStartedAt = Date.now();

    // Mover foco al textarea cuando abre
    setTimeout(() => {
      input?.focus();
    }, 50);

    loadNotes();
  }

  function close(){
    // Quitar foco del botón antes de ocultar
    if (document.activeElement) {
      document.activeElement.blur();
    }

    modal.classList.add('hidden');
    document.body.style.overflow = '';

    // Devolver foco al botón flotante
    setTimeout(() => {
      fab?.focus();
    }, 10);
  }

  fab?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && modal && !modal.classList.contains('hidden')) close(); });
  window.addEventListener('profile:name-updated', (e) => {
    rememberProfileName(e.detail || {});
    if (modal && !modal.classList.contains('hidden')) {
      loadNotes();
    }
  });

  function refreshComposeState(){
    const hasText = !!(input?.value || '').trim();
    btnAdd?.classList.toggle('is-ready', hasText);
    btnAdd && (btnAdd.disabled = !hasText);
  }
  btnClear?.addEventListener('click', ()=>{ input.value = ''; refreshComposeState(); input.focus(); });

  tabs.forEach(t=>{
    t.addEventListener('click', ()=>{
      tabs.forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      activeCat = t.getAttribute('data-cat') || 'general';
      notesLoadingStartedAt = Date.now();
      loadNotes();
    });
  });

  async function refreshTabCounts(){
    const sb = window.supabaseClient;
    if(!sb) return;
    const session = await ensureSession();
    if(!session){
      tabs.forEach(tab => {
        const countEl = tab.querySelector('.notes-tab-count');
        if (countEl) countEl.textContent = '0';
      });
      return;
    }

    const { data, error } = await sb
      .from('notes')
      .select('category');

    if(error || !data){
      tabs.forEach(tab => {
        const countEl = tab.querySelector('.notes-tab-count');
        if (countEl) countEl.textContent = '0';
      });
      return;
    }

    const counts = data.reduce((acc, note) => {
      const key = note.category || 'general';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    tabs.forEach(tab => {
      const cat = tab.getAttribute('data-cat') || 'general';
      const countEl = tab.querySelector('.notes-tab-count');
      if (countEl) countEl.textContent = String(counts[cat] || 0);
    });
  }

  async function ensureSession(){
    const sb = window.supabaseClient;
    if(!sb){
      status.textContent = 'Supabase no está listo.';
      return null;
    }
    const { data } = await sb.auth.getSession();
    return data?.session || null;
  }

  async function loadNotes(){
    const sb = window.supabaseClient;
    if(!list) return;
    renderNotesLoading();
    status.textContent = '';
    await refreshTabCounts();

    const session = await ensureSession();
    if(!session){
      status.textContent = 'Inicia sesión para ver/guardar notas.';
      list.innerHTML = `<div class="note-empty"><div class="note-empty-icon">🔒</div><div class="note-empty-title">No hay sesión activa</div><div class="note-empty-copy">Inicia sesión para ver, guardar y editar sus noticas bonitas.</div></div>`;
      return;
    }
    notesProfilesMap = await loadProfilesMap();

    const { data, error } = await sb
      .from('notes')
      .select('*')
      .eq('category', activeCat)
      .order('created_at', { ascending: false });

    if(error){
      status.textContent = 'Error: ' + error.message;
      return;
    }

    const elapsed = Date.now() - notesLoadingStartedAt;
    const waitMore = Math.max(0, 3000 - elapsed);
    if (waitMore) {
      await new Promise(resolve => setTimeout(resolve, waitMore));
    }

    list.innerHTML = '';

    if(!data?.length){
      const meta = CAT_META[activeCat] || CAT_META.general;
      list.innerHTML = `<div class="note-empty note-empty-${meta.tone}"><div class="note-empty-icon">💌</div><div class="note-empty-title">Mi amor, toca dejar un pedacito de nosotros aquí</div><div class="note-empty-copy"><em>Este cuadernito está esperando algo bonito de los dos.</em></div></div>`;
      return;
    }

    data.forEach((n, idx)=>{
      // Autor: preferimos correo si existe; si no, usamos el UUID para decidir "Tú" / "Otra persona"
      const candidates = [
        n.author_email,
        n.user_email,
        n.email,
        n.created_by_email,
        n.created_by
      ].filter(Boolean).map(String);

      const authorEmail = candidates.find(x => x.includes('@')) || '';
      const authorId =
        (n.author_id || n.user_id || (typeof n.created_by === 'string' ? n.created_by : null) || null);
      const authorName = notesProfilesMap.byId[authorId]
        || notesProfilesMap.byEmail[String(authorEmail).trim().toLowerCase()]
        || n.author_name
        || '';

      const authorLabel = formatAuthorLabel(authorName, authorEmail, authorId, session);
      const isMine = authorId === session?.user?.id || authorEmail === session?.user?.email;
      const meta = CAT_META[activeCat] || CAT_META.general;

      const div = document.createElement('div');
      div.className = `note-item note-item-${meta.tone}`;
      div.style.animationDelay = `${idx * 90}ms`;
      div.innerHTML = `
        <div class="note-text">${escapeHtml(n.content).replaceAll('\n','<br>')}</div>
        <div class="note-meta">
          <div class="note-time">
            ${authorLabel ? `<span class="note-author-pill ${isMine ? 'is-you' : 'is-other'}">${escapeHtml(authorLabel)}</span>` : ''}
            ${niceTime(n.created_at)}
          </div>
          <div class="note-btns">
            <button class="note-btn" data-edit="${n.id}">✏️</button>
            <button class="note-btn danger" data-del="${n.id}">🗑️</button>
          </div>
        </div>
      `;
      list.appendChild(div);
    });

    list.querySelectorAll('[data-del]').forEach(btn=>{
      btn.addEventListener('click', ()=>delNote(btn.getAttribute('data-del')));
    });
    list.querySelectorAll('[data-edit]').forEach(btn=>{
      btn.addEventListener('click', ()=>editNote(btn.getAttribute('data-edit')));
    });
  }

  async function addNote(){
    const sb = window.supabaseClient;
    const text = (input.value || '').trim();
    if(!text){ status.textContent = 'Escribe algo primero ✍️'; return; }

    const session = await ensureSession();
    if(!session){ status.textContent = 'Inicia sesión para guardar.'; return; }

    status.textContent = 'Guardando...';
    const author_email = session?.user?.email || null;
    const author_id = session?.user?.id || null;
    const ownProfile = await window.fetchProfileById?.(author_id);
    const author_name = ownProfile?.display_name || null;

    // Intento 1: guardar también autor (si tu tabla tiene columnas)
    let { error } = await sb
      .from('notes')
      .insert([{
        content: text,
        category: activeCat,
        author_email,
        author_id,
        author_name
      }]);

    // Fallback: si la tabla no tiene esas columnas, guarda sin autor (para no romper)
    if (error && /column .*author_email|column .*author_id|column .*author_name|schema cache|not exist/i.test(error.message || '')) {
      ({ error } = await sb
        .from('notes')
        .insert([{ content: text, category: activeCat }]));
    }

    if(error){ status.textContent = 'Error: ' + error.message; return; }

    input.value = '';
    status.textContent = 'Guardado ✅';
    await refreshTabCounts();
    await loadNotes();
  }

  async function delNote(id){
    const sb = window.supabaseClient;
    const ok = confirm('¿Borrar esta nota?');
    if(!ok) return;

    status.textContent = 'Borrando...';
    const { error } = await sb.from('notes').delete().eq('id', id);

    if(error){ status.textContent = 'Error: ' + error.message; return; }
    status.textContent = 'Borrada ✅';
    await refreshTabCounts();
    await loadNotes();
  }

  async function editNote(id){
    const sb = window.supabaseClient;

    const { data, error } = await sb
      .from('notes')
      .select('content')
      .eq('id', id)
      .single();

    if(error){ status.textContent = 'Error: ' + error.message; return; }

    const next = prompt('Editar nota:', data?.content || '');
    if(next === null) return;

    status.textContent = 'Guardando cambios...';
    const { error: upErr } = await sb.from('notes').update({ content: next }).eq('id', id);

    if(upErr){ status.textContent = 'Error: ' + upErr.message; return; }
    status.textContent = 'Actualizada ✅';
    await refreshTabCounts();
    await loadNotes();
  }

  btnAdd?.addEventListener('click', addNote);
  input?.addEventListener('keydown', (e)=>{ if(e.ctrlKey && e.key === 'Enter') addNote(); });
  input?.addEventListener('input', refreshComposeState);
  refreshComposeState();

  function escapeHtml(str){
    return (str || '').replace(/[&<>"']/g, (m)=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[m]));
  }
})();
