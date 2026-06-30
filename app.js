/**
 * app.js
 * Inicialización general de la página y helpers visuales.
 */
(function(){
  const LOVE_COUNTER_START_DATE = new Date('2026-01-11T23:11:00-05:00');

  function getDaysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
  }

  function addYearsClamped(date, yearsToAdd = 0) {
    const base = new Date(date);
    const day = base.getDate();
    base.setDate(1);
    base.setFullYear(base.getFullYear() + yearsToAdd);
    base.setDate(Math.min(day, getDaysInMonth(base.getFullYear(), base.getMonth())));
    return base;
  }

  function addMonthsClamped(date, monthsToAdd = 0) {
    const base = new Date(date);
    const day = base.getDate();
    base.setDate(1);
    base.setMonth(base.getMonth() + monthsToAdd);
    base.setDate(Math.min(day, getDaysInMonth(base.getFullYear(), base.getMonth())));
    return base;
  }

  function pluralizeCounterLabel(value, singular, plural = `${singular}S`) {
    return value === 1 ? singular : plural;
  }

  function formatCounterStartDate(date) {
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  function formatCounterClockValue(value) {
    return String(Math.max(0, Number(value) || 0)).padStart(2, '0');
  }

  function getLoveCounterDiff(startDate, nowDate = new Date()) {
    const now = new Date(nowDate);
    const start = new Date(startDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(now.getTime()) || now < start) {
      return null;
    }

    let anchor = new Date(start);
    let years = 0;
    let months = 0;

    while (addYearsClamped(anchor, 1) <= now) {
      anchor = addYearsClamped(anchor, 1);
      years += 1;
    }

    while (addMonthsClamped(anchor, 1) <= now) {
      anchor = addMonthsClamped(anchor, 1);
      months += 1;
    }

    let remainingMs = now.getTime() - anchor.getTime();
    const days = Math.floor(remainingMs / 86400000);
    remainingMs -= days * 86400000;
    const hours = Math.floor(remainingMs / 3600000);
    remainingMs -= hours * 3600000;
    const minutes = Math.floor(remainingMs / 60000);
    remainingMs -= minutes * 60000;
    const seconds = Math.floor(remainingMs / 1000);

    return {
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      totalMonths: years * 12 + months,
      start
    };
  }

  function initLoveCounter() {
    const root = document.getElementById('love-counter');
    const panel = document.getElementById('love-counter-panel');
    const toggle = document.getElementById('love-counter-toggle');
    const yearsUnit = document.getElementById('love-counter-years-unit');
    const modal = document.getElementById('love-counter-modal');
    const modalClose = document.getElementById('love-counter-modal-close');
    const modalTitle = document.getElementById('love-counter-modal-title');
    const modalText = document.getElementById('love-counter-modal-text');

    if (!root || !panel || !toggle || !yearsUnit || !modal || !modalClose || !modalTitle || !modalText) return;

    const startDate = new Date(LOVE_COUNTER_START_DATE);
    if (Number.isNaN(startDate.getTime())) return;

    const startLabel = `Desde el ${formatCounterStartDate(startDate)}`;
    panel.dataset.startLabel = startLabel;

    const fields = {
      years: document.getElementById('love-counter-years'),
      yearsLabel: document.getElementById('love-counter-years-label'),
      months: document.getElementById('love-counter-months'),
      monthsLabel: document.getElementById('love-counter-months-label'),
      days: document.getElementById('love-counter-days'),
      daysLabel: document.getElementById('love-counter-days-label'),
      hours: document.getElementById('love-counter-hours'),
      minutes: document.getElementById('love-counter-minutes'),
      seconds: document.getElementById('love-counter-seconds')
    };

    let lastSnapshot = null;
    const mobileQuery = window.matchMedia('(max-width: 820px)');

    function animateValue(node, nextValue) {
      if (!node) return;
      const currentValue = node.textContent;
      const incomingValue = String(nextValue);
      if (currentValue === incomingValue) return;
      node.textContent = incomingValue;
      node.classList.remove('is-ticking');
      void node.offsetWidth;
      node.classList.add('is-ticking');
    }

    function renderCounter() {
      const diff = getLoveCounterDiff(startDate, new Date());
      if (!diff) return;

      const nextSnapshot = JSON.stringify(diff);
      const changedSeconds = !lastSnapshot || JSON.parse(lastSnapshot).seconds !== diff.seconds;

      yearsUnit.classList.toggle('hidden', diff.years <= 0);
      fields.yearsLabel.textContent = pluralizeCounterLabel(diff.years, 'AÑO', 'AÑOS');
      fields.monthsLabel.textContent = pluralizeCounterLabel(diff.months, 'MES', 'MESES');
      fields.daysLabel.textContent = pluralizeCounterLabel(diff.days, 'DÍA', 'DÍAS');

      animateValue(fields.years, diff.years);
      animateValue(fields.months, diff.months);
      animateValue(fields.days, diff.days);
      animateValue(fields.hours, formatCounterClockValue(diff.hours));
      animateValue(fields.minutes, formatCounterClockValue(diff.minutes));
      animateValue(fields.seconds, formatCounterClockValue(diff.seconds));

      if (changedSeconds && fields.seconds) {
        fields.seconds.classList.remove('is-ticking');
        void fields.seconds.offsetWidth;
        fields.seconds.classList.add('is-ticking');
      }

      modalTitle.textContent = diff.years > 0
        ? `Somos noviecitos hace ${diff.years} ${pluralizeCounterLabel(diff.years, 'año', 'años')}`
        : `Somos noviecitos hace ${diff.totalMonths} ${pluralizeCounterLabel(diff.totalMonths, 'mes', 'meses')}`;

      modalText.textContent = `Desde el ${formatCounterStartDate(diff.start)}`;

      lastSnapshot = nextSnapshot;
    }

    function setMobileOpen(forceOpen) {
      const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !root.classList.contains('is-open');
      root.classList.toggle('is-open', shouldOpen);
      toggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    }

    function closeModal() {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      modalClose.blur();
      document.getElementById('notes-fab')?.classList.remove('hidden');
      document.getElementById('btn-open-login-footer')?.classList.remove('hidden');
    }

    function openModal() {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.getElementById('notes-fab')?.classList.add('hidden');
      document.getElementById('btn-open-login-footer')?.classList.add('hidden');
    }

    // El panel desplegable está oculto via fixes.css.
    // Clic en el corazón flotante = abrir directamente el modal con el detalle.
    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      openModal();
    });

    panel.addEventListener('click', () => {
      openModal();
    });

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeModal();
        if (mobileQuery.matches) setMobileOpen(false);
      }
    });

    document.addEventListener('click', (event) => {
      if (!mobileQuery.matches) return;
      if (!root.classList.contains('is-open')) return;
      if (root.contains(event.target)) return;
      setMobileOpen(false);
    });

    mobileQuery.addEventListener('change', (event) => {
      if (!event.matches) setMobileOpen(false);
    });

    // Ocultar contador cuando se abren modales/galerías
    const observer = new MutationObserver(() => {
      const hasLightbox = document.body.classList.contains('lightbox-open');
      const hasNotesModal = !document.getElementById('notes-modal')?.classList.contains('hidden');
      const hasLoginModal = document.querySelector('[role="dialog"]:not(.hidden)') && !document.getElementById('love-counter-modal')?.classList.contains('hidden');
      
      if (hasLightbox || hasNotesModal || hasLoginModal) {
        root.classList.add('hidden');
      } else {
        root.classList.remove('hidden');
      }
    });

    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    const modalObserver = new MutationObserver(() => {
      const hasLightbox = document.body.classList.contains('lightbox-open');
      const hasNotesModal = !document.getElementById('notes-modal')?.classList.contains('hidden');
      const hasLoginModal = document.querySelector('[role="dialog"]:not(.hidden)') && !document.getElementById('love-counter-modal')?.classList.contains('hidden');
      
      if (hasLightbox || hasNotesModal || hasLoginModal) {
        root.classList.add('hidden');
      } else {
        root.classList.remove('hidden');
      }
    });

    modalObserver.observe(document.getElementById('notes-modal') || document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    renderCounter();
    window.setInterval(renderCounter, 1000);
  }

  function show100ReasonsModal() {
    if (!window.messagesModule?.hundredReasons) {
      console.error('hundredReasons no está disponible');
      return;
    }

    const reasons = window.messagesModule.hundredReasons;
    const modal = document.createElement('div');
    modal.className = 'popup-modal';
    modal.innerHTML = `
      <div class="popup-content">
        <button class="close-popup">×</button>
        <h2>100 Razones por las que soy feliz contigo 💕</h2>
        <div class="reasons-grid">
          ${reasons.map((reason, idx) => `
            <div class="reason-item">
              <span class="reason-number">${idx + 1}.</span>
              <p>${reason}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('.close-popup')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    setTimeout(() => modal.classList.add('show'), 10);
  }

  window.runTinyConfetti = function() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const particles = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 2 + 2,
        size: Math.random() * 4 + 2,
        color: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF85C0'][Math.floor(Math.random() * 5)]
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let activeCount = 0;

      particles.forEach(p => {
        if (p.y < canvas.height) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.1;

          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
          activeCount++;
        }
      });

      if (activeCount > 0) requestAnimationFrame(animate);
      else canvas.remove();
    };

    animate();
  };

  window.showPopup = function(text) {
    const modal = document.createElement('div');
    modal.className = 'popup-modal';
    modal.innerHTML = `
      <div class="popup-content" style="max-width: 500px;">
        <button class="close-popup">×</button>
        <p>${text}</p>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.close-popup')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    setTimeout(() => modal.classList.add('show'), 10);
  };

  document.addEventListener('DOMContentLoaded', () => {
    try { window.messagesModule?.renderMessageLists?.(); } catch(e) { console.error('Error en messages module:', e); }
    try { window.galleryModule?.initGallery?.(); } catch(e) { console.error('Error en gallery module:', e); }
    try { window.calendarModule?.initCalendar?.(); } catch(e) { console.error('Error en calendar module:', e); }
    try { window.printGalleryModule?.initPrintGallery?.(); } catch(e) { console.error('Error en printGallery module:', e); }
    try { window.memoryMapModule?.init?.(); } catch(e) { console.error('Error inicializando mapa:', e); }
    try { window.pushNotificationsModule?.initNotifications?.(); } catch(e) { console.error('Error inicializando notificaciones push:', e); }
    try { initLoveCounter(); } catch(e) { console.error('Error inicializando contador de amor:', e); }

    const specialMessageBanner = document.getElementById('special-message-banner');
    if (specialMessageBanner) {
      specialMessageBanner.innerHTML = '';
      specialMessageBanner.style.display = 'none';
    }

    const params = new URLSearchParams(window.location.search);
    const calendarDay = params.get('calendarDay');
    const openCalendar = params.get('openCalendar') === '1';
    if (calendarDay !== null) {
      const parsedDay = Number(calendarDay);
      if (Number.isFinite(parsedDay)) {
        try { window.calendarModule?.openDay?.(parsedDay, { openCalendar }); } catch (e) { console.error('Error abriendo día desde notificación:', e); }
        params.delete('calendarDay');
        params.delete('openCalendar');
        const nextQuery = params.toString();
        const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash || ''}`;
        window.history.replaceState({}, '', nextUrl);
      }
    }

    document.getElementById('btn-random-bday')?.addEventListener('click', show100ReasonsModal);
    document.getElementById('btn-push-settings')?.addEventListener('click', () => {
      try {
        window.pushNotificationsModule?.openPushSettingsModal?.();
      } catch (e) {
        console.error('Error abriendo modal de mensajitos diarios:', e);
      }
    });
  });
})();
