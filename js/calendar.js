/**
 * calendar.js
 * Módulo de calendario: sistema de 365 días, navegación, desbloqueo
 */

// Fechas de inicio y fin del período (fechas locales normalizadas)
const startDate = new Date(2025, 10, 17, 0, 0, 0, 0); // Nov 17, 2025 medianoche local
const endDate = new Date(2026, 10, 17, 0, 0, 0, 0);   // Nov 17, 2026 medianoche local

// Estado del calendario
// Nota: se inicializa correctamente en initCalendar() según la fecha actual
let currentDisplayMonth = new Date(2025, 10, 17);
let unlockedAll = false;
let selectedDayNum = null;

// Referencias del DOM
let calendarDiv, messageDisplayDiv, currentMonthDiv, prevMonthBtn, nextMonthBtn;
let toggleCalendarBtn, calendarContainer, selectedDateSpan, unlockAllBtn;
let calendarUnlockModal, calendarUnlockInput, calendarUnlockStatus;
let calendarUnlockConfirmBtn, calendarUnlockCancelBtn, calendarUnlockCloseBtn;

/**
 * Calcular el día número (0-364) desde la fecha actual
 */
function getDayNumber() {
  const today = new Date();
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const startNormalized = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
  
  const diffTime = todayNormalized - startNormalized;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 0 ? Math.min(diffDays, 364) : -1;
}

/**
 * Obtener fecha desde número de día
 */
function getDateFromDayNumber(dayNum) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + dayNum);
  return date;
}

/**
 * Obtener número de día desde una fecha específica
 */
function getDayNumberFromDate(date) {
  const dNormalized = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const startNormalized = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
  
  const diffTime = dNormalized - startNormalized;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 0 ? Math.min(diffDays, 364) : -1;
}

/**
 * Obtener nombre del mes
 */
function getMonthName(date) {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return months[date.getMonth()] + ' ' + date.getFullYear();
}

/**
 * Formatear fecha a DD/MM/YYYY
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Mostrar mensaje de día bloqueado (ayuda/advertencia)
 */
function showLockedDayMessage(dayOfMonth) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = 0;
  overlay.style.background = 'rgba(20, 10, 30, 0.5)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 9998;
  overlay.style.backdropFilter = 'blur(2px)';

  const card = document.createElement('div');
  card.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))';
  card.style.padding = '32px 28px';
  card.style.borderRadius = '16px';
  card.style.maxWidth = '420px';
  card.style.width = '90%';
  card.style.textAlign = 'center';
  card.style.boxShadow = '0 20px 60px rgba(33, 20, 60, 0.25)';
  card.style.border = '2px solid rgba(255, 111, 191, 0.2)';
  card.style.animation = 'slideIn 0.3s ease';

  const title = document.createElement('p');
  title.style.fontSize = '1.4rem';
  title.style.fontWeight = '700';
  title.style.color = '#7c49ff';
  title.style.marginBottom = '12px';
  title.textContent = 'No puedes ver este mensajito aún';

  const message = document.createElement('p');
  message.style.fontSize = '1rem';
  message.style.color = '#241332';
  message.style.lineHeight = '1.6';
  message.style.marginBottom = '24px';
  message.innerHTML = `Amor mío, el día <strong style="color: #ff6fbf;">${dayOfMonth}</strong> aún no llega… debes esperar a ese día para verlo. Te quiero muchototote mi niña impaciente jeje<br><br>Besoss preciosaa!`;

  const btnClose = document.createElement('button');
  btnClose.textContent = 'De acuerdo mi pollo <33';
  btnClose.style.background = 'linear-gradient(135deg, #7c49ff, #ff6fbf)';
  btnClose.style.color = 'white';
  btnClose.style.border = 'none';
  btnClose.style.padding = '12px 28px';
  btnClose.style.borderRadius = '10px';
  btnClose.style.fontSize = '0.95rem';
  btnClose.style.fontWeight = '600';
  btnClose.style.cursor = 'pointer';
  btnClose.style.transition = 'transform 0.2s ease';
  btnClose.addEventListener('mouseenter', () => {
    btnClose.style.transform = 'scale(1.05)';
  });
  btnClose.addEventListener('mouseleave', () => {
    btnClose.style.transform = 'scale(1)';
  });
  btnClose.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  card.appendChild(title);
  card.appendChild(message);
  card.appendChild(btnClose);
  overlay.appendChild(card);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });

  document.body.appendChild(overlay);
}

/**
 * Mostrar mensaje en el div de display
 */
function displayMessage(dayNum, closeCalendar = false, persistSelection = true) {
  if (!messageDisplayDiv) return;

  if (dayNum < 0) {
    messageDisplayDiv.textContent = 'El calendario comenzará el 17 de noviembre de 2025 ✨';
    messageDisplayDiv.classList.add('empty');
    return;
  }

  const msg = window.messagesModule?.dailyMessages?.[dayNum] || 'Mensaje no disponible';
  messageDisplayDiv.textContent = msg;
  messageDisplayDiv.classList.remove('empty');
  messageDisplayDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  if (persistSelection) {
    selectedDayNum = dayNum;
  }

  if (selectedDateSpan) {
    const d = getDateFromDayNumber(dayNum);
    selectedDateSpan.textContent = formatDate(d);
  }

  if (closeCalendar && calendarContainer && !calendarContainer.classList.contains('calendar-hidden')) {
    toggleCalendar();
  }
}

/**
 * Mostrar popup genérico
 */
function showPopup(text) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = 0;
  overlay.style.background = 'rgba(20,10,30,0.45)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 9999;

  const card = document.createElement('div');
  card.style.maxWidth = '720px';
  card.style.width = '92%';
  card.style.padding = '26px';
  card.style.borderRadius = '16px';
  card.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.9))';
  card.style.boxShadow = '0 18px 60px rgba(36,19,50,0.4)';
  card.style.textAlign = 'center';
  card.style.color = '#331c3f';

  const h = document.createElement('h2');
  h.textContent = 'Un mensaje para ti';
  h.style.margin = '0 0 12px 0';
  h.style.fontSize = '1.4rem';
  h.style.fontFamily = 'Sacramento, Poppins, serif';
  card.appendChild(h);

  const p = document.createElement('p');
  p.textContent = text;
  p.style.fontSize = '1.05rem';
  p.style.margin = '0 0 18px 0';
  card.appendChild(p);

  const close = document.createElement('button');
  close.textContent = 'Cerrar';
  close.className = 'btn small';
  close.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  card.appendChild(close);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

function closeCalendarUnlockModal() {
  if (!calendarUnlockModal) return;
  calendarUnlockModal.classList.add('hidden');
  calendarUnlockModal.setAttribute('aria-hidden', 'true');
  if (calendarUnlockInput) {
    calendarUnlockInput.value = '';
  }
  if (calendarUnlockStatus) {
    calendarUnlockStatus.textContent = '';
  }
}

function confirmCalendarUnlock() {
  const code = String(calendarUnlockInput?.value || '').trim();
  if (code === '9118') {
    unlockedAll = true;
    unlockAllBtn?.classList.add('active');
    if (unlockAllBtn) unlockAllBtn.textContent = 'Bloquear por fecha';
    renderCalendar();
    closeCalendarUnlockModal();
    showPopup('¡Listo! Todos los días quedan desbloqueados.');
    return;
  }

  if (calendarUnlockStatus) {
    calendarUnlockStatus.textContent = 'Clave incorrecta. Intenta de nuevo.';
  }
  calendarUnlockInput?.focus();
  calendarUnlockInput?.select();
}

function openCalendarUnlockModal() {
  if (!calendarUnlockModal) return;
  calendarUnlockModal.classList.remove('hidden');
  calendarUnlockModal.setAttribute('aria-hidden', 'false');
  if (calendarUnlockInput) {
    calendarUnlockInput.value = '';
  }
  if (calendarUnlockStatus) {
    calendarUnlockStatus.textContent = '';
  }
  requestAnimationFrame(() => {
    calendarUnlockInput?.focus();
  });
}

/**
 * Renderizar calendario del mes actual
 */
function renderCalendar() {
  if (!calendarDiv) return;
  calendarDiv.classList.remove('calendar-grid-animate');
  calendarDiv.innerHTML = '';

  const today = getDayNumber();
  const todayLocal = new Date();
  const todayDate = new Date(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate(), 0, 0, 0, 0);

  const monthStart = new Date(currentDisplayMonth.getFullYear(), currentDisplayMonth.getMonth(), 1);
  const monthEnd = new Date(currentDisplayMonth.getFullYear(), currentDisplayMonth.getMonth() + 1, 0);

  if (currentMonthDiv) {
    currentMonthDiv.textContent = getMonthName(currentDisplayMonth);
  }

  const isNov2025 = currentDisplayMonth.getMonth() === 10 && currentDisplayMonth.getFullYear() === 2025;
  const isNov2026 = currentDisplayMonth.getMonth() === 10 && currentDisplayMonth.getFullYear() === 2026;

  let startDay = 1;
  let endDay = monthEnd.getDate();

  if (isNov2025) {
    startDay = 17;
  }
  if (isNov2026) {
    endDay = 17;
  }

  let firstDayOfWeek = monthStart.getDay();
  firstDayOfWeek = (firstDayOfWeek + 6) % 7;

  if (!isNov2025) {
    for (let i = 0; i < firstDayOfWeek; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day-empty';
      calendarDiv.appendChild(emptyCell);
    }
  } else {
    const nov17 = new Date(2025, 10, 17);
    const nov17DayOfWeek = (nov17.getDay() + 6) % 7;
    for (let i = 0; i < nov17DayOfWeek; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day-empty';
      calendarDiv.appendChild(emptyCell);
    }
  }

  for (let dayOfMonth = startDay; dayOfMonth <= endDay; dayOfMonth++) {
    const cellDate = new Date(currentDisplayMonth.getFullYear(), currentDisplayMonth.getMonth(), dayOfMonth, 0, 0, 0, 0);

    const dayNum = getDayNumberFromDate(cellDate);

    const dayBtn = document.createElement('button');
    dayBtn.className = 'calendar-day';
    dayBtn.setAttribute('data-day', dayOfMonth);
    dayBtn.textContent = dayOfMonth;

    const available = unlockedAll ? (dayNum >= 0 && dayNum <= 364) : (dayNum >= 0 && dayNum <= today);

    if (available) {
      dayBtn.classList.add('available');
      if (cellDate.getTime() === todayDate.getTime()) {
        dayBtn.classList.add('today');
      }
      if (selectedDayNum === dayNum) {
        dayBtn.classList.add('selected');
      }

      dayBtn.addEventListener('click', () => {
        selectedDayNum = dayNum;
        renderCalendar();
        displayMessage(dayNum, true, false);
      });
    } else if (dayNum < 0 || dayNum > 364) {
      dayBtn.classList.add('locked');
      dayBtn.textContent = dayOfMonth;
      dayBtn.title = 'Este día no está en el rango';
      dayBtn.addEventListener('click', () => {
        showLockedDayMessage(dayOfMonth);
      });
    } else {
      dayBtn.classList.add('locked');
      dayBtn.textContent = dayOfMonth;
      dayBtn.title = 'Este día aún no está disponible';
      dayBtn.addEventListener('click', () => {
        showLockedDayMessage(dayOfMonth);
      });
    }

    calendarDiv.appendChild(dayBtn);
  }

  requestAnimationFrame(() => {
    calendarDiv.classList.add('calendar-grid-animate');
  });

  const currentDayNum = getDayNumber();
  if (selectedDayNum !== null) {
    displayMessage(selectedDayNum, false, false);
  } else if (currentDayNum >= 0) {
    displayMessage(currentDayNum, false, false);
  } else {
    displayMessage(0, false, false);
  }
}

/**
 * Toggle para mostrar/ocultar calendario
 */
function toggleCalendar() {
  if (calendarContainer) {
    calendarContainer.classList.toggle('calendar-hidden');

    if (toggleCalendarBtn) {
      if (calendarContainer.classList.contains('calendar-hidden')) {
        toggleCalendarBtn.textContent = 'Abrir calendario 📖';
        toggleCalendarBtn.classList.remove('active');
      } else {
        toggleCalendarBtn.textContent = 'Cerrar calendario 📖';
        toggleCalendarBtn.classList.add('active');
      }
    }
  }
}

function openDay(dayNum, { openCalendar = true } = {}) {
  const safeDayNum = Number(dayNum);
  if (!Number.isFinite(safeDayNum) || safeDayNum < 0 || safeDayNum > 364) return;

  selectedDayNum = safeDayNum;
  currentDisplayMonth = getDateFromDayNumber(safeDayNum);
  renderCalendar();
  displayMessage(safeDayNum, false, false);

  if (openCalendar && calendarContainer?.classList.contains('calendar-hidden')) {
    toggleCalendar();
  }
}

/**
 * Inicializar el calendario
 */
function initCalendar() {
  // Referencias del DOM
  calendarDiv = document.getElementById('calendar');
  messageDisplayDiv = document.getElementById('message-display');
  currentMonthDiv = document.getElementById('current-month');
  prevMonthBtn = document.getElementById('prev-month');
  nextMonthBtn = document.getElementById('next-month');
  toggleCalendarBtn = document.getElementById('toggle-calendar');
  calendarContainer = document.getElementById('calendar-container');
  selectedDateSpan = document.getElementById('selected-date');
  unlockAllBtn = document.getElementById('unlock-all');
  calendarUnlockModal = document.getElementById('calendar-unlock-modal');
  calendarUnlockInput = document.getElementById('calendar-unlock-code');
  calendarUnlockStatus = document.getElementById('calendar-unlock-status');
  calendarUnlockConfirmBtn = document.getElementById('btn-confirm-calendar-unlock');
  calendarUnlockCancelBtn = document.getElementById('btn-cancel-calendar-unlock');
  calendarUnlockCloseBtn = document.getElementById('btn-close-calendar-unlock-x');

  // ✅ Al iniciar, mostrar el mes del día actual (si está dentro del rango).
  // Si la fecha actual está fuera del rango, caer al inicio/fin.
  const today = new Date();
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  if (todayNormalized < startDate) {
    currentDisplayMonth = new Date(startDate);
  } else if (todayNormalized > endDate) {
    currentDisplayMonth = new Date(endDate);
  } else {
    currentDisplayMonth = new Date(todayNormalized);
  }

  // Event listeners: navegación de meses
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      currentDisplayMonth.setMonth(currentDisplayMonth.getMonth() - 1);
      if (currentDisplayMonth < new Date(2025, 10, 1)) {
        currentDisplayMonth = new Date(2025, 10, 17);
      }
      renderCalendar();
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      currentDisplayMonth.setMonth(currentDisplayMonth.getMonth() + 1);
      if (currentDisplayMonth > new Date(2026, 10, 31)) {
        currentDisplayMonth = new Date(2026, 10, 17);
      }
      renderCalendar();
    });
  }

  // Toggle calendario
  if (toggleCalendarBtn) {
    toggleCalendarBtn.addEventListener('click', toggleCalendar);
  }

  calendarUnlockConfirmBtn?.addEventListener('click', confirmCalendarUnlock);
  calendarUnlockCancelBtn?.addEventListener('click', closeCalendarUnlockModal);
  calendarUnlockCloseBtn?.addEventListener('click', closeCalendarUnlockModal);
  calendarUnlockModal?.addEventListener('click', (event) => {
    if (event.target === calendarUnlockModal) {
      closeCalendarUnlockModal();
    }
  });
  calendarUnlockInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      confirmCalendarUnlock();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      closeCalendarUnlockModal();
    }
  });

  // Desbloquear todo (con clave)
  if (unlockAllBtn) {
    unlockAllBtn.addEventListener('click', () => {
      if (unlockedAll) {
        unlockedAll = false;
        unlockAllBtn.classList.remove('active');
        unlockAllBtn.textContent = 'Desbloquear todos';
        renderCalendar();
        showPopup('Modo bloqueo por fecha activado. Volvimos a bloquear los días futuros.');
        return;
      }

      openCalendarUnlockModal();
    });
  }

  // Render inicial
  renderCalendar();
}

// Exportar para app.js
window.calendarModule = {
  initCalendar,
  openDay
};
