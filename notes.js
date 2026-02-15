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

  let activeCat = 'general';

  function niceTime(iso){
    try{ return new Date(iso).toLocaleString(); } catch { return ''; }
  }

  function open(){
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

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
  modal?.addEventListener('click', (e)=>{ if(e.target === modal) close(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && modal && !modal.classList.contains('hidden')) close(); });

  btnClear?.addEventListener('click', ()=>{ input.value = ''; input.focus(); });

  tabs.forEach(t=>{
    t.addEventListener('click', ()=>{
      tabs.forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      activeCat = t.getAttribute('data-cat') || 'general';
      loadNotes();
    });
  });

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
    list.innerHTML = '';
    status.textContent = '';

    const session = await ensureSession();
    if(!session){
      status.textContent = 'Inicia sesión para ver/guardar notas.';
      list.innerHTML = `<div class="muted">🔒 No hay sesión activa.</div>`;
      return;
    }

    const { data, error } = await sb
      .from('notes')
      .select('*')
      .eq('category', activeCat)
      .order('created_at', { ascending: false });

    if(error){
      status.textContent = 'Error: ' + error.message;
      return;
    }

    if(!data?.length){
      const name = activeCat === 'general' ? 'General' : (activeCat === 'geral' ? 'Para Geral' : 'Para Zamir');
      list.innerHTML = `<div class="muted">No hay notas en <strong>${name}</strong> aún 💗</div>`;
      return;
    }

    data.forEach(n=>{
      const div = document.createElement('div');
      div.className = 'note-item';
      div.innerHTML = `
        <div class="note-text">${escapeHtml(n.content).replaceAll('\n','<br>')}</div>
        <div class="note-meta">
          <div class="note-time">${niceTime(n.created_at)}</div>
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
    const { error } = await sb
      .from('notes')
      .insert([{ content: text, category: activeCat }]);

    if(error){ status.textContent = 'Error: ' + error.message; return; }

    input.value = '';
    status.textContent = 'Guardado ✅';
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
    await loadNotes();
  }

  btnAdd?.addEventListener('click', addNote);
  input?.addEventListener('keydown', (e)=>{ if(e.ctrlKey && e.key === 'Enter') addNote(); });

  function escapeHtml(str){
    return (str || '').replace(/[&<>"']/g, (m)=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[m]));
  }
})();
