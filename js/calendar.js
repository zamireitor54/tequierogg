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

const monthlyElevenMessages = {
  '2026-04-11': {
    title: 'Abril',
    body: `Mi niña, quería escribirte algo bonito porque sí, porque me nace, porque cuando se trata de ti siempre siento que tengo mucho por decir aunque a veces no encuentre las palabras perfectas.
Y la verdad es que esto que siento por ti no lo digo por decirlo. Te amo de verdad. Te amo en lo bonito, en lo tranquilo, en lo que me haces sentir cuando estoy bien, pero también en esos momentos donde todo pesa un poco más y aun así sigues siendo ese pensamiento que me da calma.
No digo que todo sea fácil, porque amar de verdad nunca es solo quedarse con lo lindo, también es aprender, entender, tener paciencia y seguir ahí. Y yo quiero seguir ahí, mi niña. Quiero seguir cuidándote, seguir eligiéndote, seguir demostrando con hechos que lo que siento por ti es sincero.
Solo quería que supieras eso: que te amo mucho, que me importas demasiado y que tenerte en mi vida es de las cosas más bonitas que me han pasado.`
  },
  '2026-05-11': {
    title: 'Mayo',
    body: `Mi niña, contigo aprendí que el amor más bonito no siempre es el más escandaloso, sino el más real. Ese que se nota en los detalles, en las ganas de quedarse, en la forma de preguntar cómo estás, en el deseo de hacerte sentir querida incluso en tus días difíciles.
Yo no quiero darte algo vacío ni algo a medias. Quiero darte un amor bonito, de esos que abrazan, de esos que dan paz, de esos que no te hacen dudar todo el tiempo. Porque si hay alguien a quien quiero querer bien, eres tú.
Y sí, sé que a veces no es fácil, que hay días raros, días pesados, momentos donde uno no sabe bien cómo decir todo lo que siente. Pero incluso en medio de eso, sigo teniendo claro algo: te amo, mi niña. Y no es un amor pequeño, ni un amor por impulso, es un amor que me nace de una parte muy sincera de mí.
Gracias por estar, por existir en mi vida y por hacerme sentir tantas cosas lindas sin siquiera intentarlo.`
  },
  '2026-06-11': {
    title: 'Junio',
    body: `Mi niña, hay días en los que me pongo a pensar en ti y me doy cuenta de lo mucho que significas para mí. A veces uno no dice todo lo que siente a cada rato, pero eso no quiere decir que no lo lleve por dentro. Yo sí lo llevo, y mucho.
Te amo de esa forma tranquila pero profunda, de esa forma que no necesita exagerar para ser real. Te amo porque eres tú, por tu forma de ser, por tu esencia, por cómo me haces sentir cuando apareces en mi mente sin avisar y de repente me cambias el día.
No sé si siempre voy a tener las mejores palabras, pero sí quiero que siempre te quede claro que lo mío contigo es de verdad. Que no te miro como algo pasajero. Que me importas, que me dueles cuando algo te duele, que me alegra verte bien y que me nace cuidarte con todo el cariño del mundo.
No ha sido fácil entender muchas cosas de la vida, del amor, de uno mismo… pero entre todo eso, quererte a ti se siente como una de las cosas más sinceras que tengo.`
  },
  '2026-07-11': {
    title: 'Julio',
    body: `Mi niña, a veces me pongo a pensar en todo lo que uno calla por no saber cómo decirlo, y la verdad es que si mi corazón hablara solo, creo que te repetiría mil veces lo mucho que te ama.
Porque sí, te amo. Te amo en serio. Y no solo por los momentos bonitos, no solo por lo tierno o lo romántico, sino por todo eso más profundo que haces sentir. Esa paz rara, esa necesidad de cuidarte, esas ganas de seguir estando incluso cuando no todo es perfecto.
A veces las cosas no son fáciles, a veces uno se equivoca, se confunde, no sabe cómo actuar o cómo expresar bien lo que siente. Pero cuando el amor es real, uno no se va a la primera, uno intenta, mejora, aprende y se queda. Y yo quiero ser eso contigo, mi niña. Alguien que no solo diga cosas lindas, sino alguien que de verdad esté.
Solo quería recordarte que eres demasiado importante para mí y que ocupas un lugar muy bonito en mi corazón.`
  },
  '2026-08-11': {
    title: 'Agosto',
    body: `Mi niña, contigo siento cosas que no me nacen con cualquiera. Hay una ternura en lo que siento por ti que me hace querer hablarte bonito, cuidarte bonito y amarte bonito.
No quiero que lo nuestro se sienta pesado, ni frío, ni lleno de dudas. Quiero que se sienta sincero. Quiero que cuando pienses en mí puedas sentir cariño, tranquilidad, confianza… esa sensación de saber que aquí hay alguien que te ama de verdad y que no juega con lo que siente.
Yo sé que no soy perfecto, sé que me faltan cosas, sé que a veces podría decirlas mejor o demostrar más. Pero también sé que lo que siento por ti es real, y cuando algo es real, vale la pena trabajarlo, cuidarlo y no dejarlo ir tan fácil.
Te amo mucho, mi niña. Más de lo que a veces sé explicar. Y aunque no siempre me salgan las palabras exactas, nunca quiero que te falte la certeza de que eres alguien muy especial para mí.`
  },
  '2026-09-11': {
    title: 'Septiembre',
    body: `Mi niña, qué bonito se siente poder amar a alguien como te amo a ti. Porque no es solo un sentimiento lindo y ya, es algo que me mueve, que me importa, que me hace pensar en ti con cariño incluso en los momentos más simples del día.
A veces me imagino todo lo que quisiera hacerte sentir: paz, amor, seguridad, esa tranquilidad de saber que no estás queriendo sola. Porque tú mereces algo bonito, algo sincero, algo que no te desgaste el corazón.
Y aunque no siempre sea fácil, aunque haya días más pesados que otros, yo sigo teniendo ganas de esto, ganas de ti, ganas de seguir construyendo algo bonito. Porque cuando alguien vale la pena, uno no se cansa de intentarlo.
Te amo, mi niña, y te amo con esa mezcla de ternura, admiración y verdad que hace que todo se sienta más profundo. De verdad gracias por existir y por ocupar este lugar tan grande dentro de mí.`
  },
  '2026-10-11': {
    title: 'Octubre',
    body: `Mi niña, a estas alturas ya no me quedan dudas de lo importante que eres para mí. Hay personas que pasan por la vida de uno y ya, pero tú no. Tú te fuiste quedando poquito a poco, de una forma tan linda, que ahora ya no sé pensar en muchas cosas sin que aparezcas tú en medio.
Y no te voy a mentir, no todo siempre es fácil. A veces amar también da miedo, a veces cuesta encontrar la manera correcta, a veces uno quisiera hacerlo todo perfecto y no puede. Pero incluso con todo eso, hay algo que en mí no cambia: te amo y quiero seguir aquí.
Quiero seguir siendo parte de tu vida de una manera bonita. Quiero que sientas que en mí tienes alguien que te quiere de verdad, que te admira, que te piensa bonito, que quiere verte bien y abrazarte incluso en tus días más difíciles.
Te amo mucho, mi niña, y ojalá nunca se te olvide lo valiosa que eres para mí.`
  },
  '2026-11-11': {
    title: 'Noviembre',
    body: `Mi niña, quería escribirte algo que se sintiera como yo, como lo que de verdad llevo por dentro cuando pienso en ti. Y la verdad es esta: te amo muchísimo.
Te amo con todo eso que no siempre sé poner en orden, con todo eso que a veces se me queda atorado en el pecho porque siento demasiado y las palabras no alcanzan. Te amo por quien eres, por cómo me haces sentir, por la forma tan bonita en la que te has ido volviendo parte de mis días, de mis pensamientos y de mi corazón.
No digo que todo sea perfecto, porque el amor real no se trata de perfección. Se trata de elegir, de cuidar, de hablar, de quedarse, de seguir aun cuando no todo sale exactamente como uno quiere. Y si de algo estoy seguro, es que contigo sí vale la pena.
Gracias por estar, por ser mi niña, por despertar en mí este amor tan sincero. Y pase lo que pase, quiero que recuerdes siempre esto: hay un corazón aquí que te ama de verdad, que te piensa bonito y que siempre va a querer lo mejor para ti.`
  }
};

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatRichText(text) {
  return String(text || '')
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function getDisplayMessage(rawMessage, dayNumber) {
  const text = String(rawMessage || '').trim();
  const match = text.match(/^Día\s+(\d+)\s*:\s*([\s\S]*)$/i);

  if (match) {
    return {
      title: `Día ${match[1]}`,
      body: match[2].trim()
    };
  }

  return {
    title: `Día ${dayNumber + 1}`,
    body: text || 'Mensaje no disponible'
  };
}

function getMonthlyElevenMessage(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return monthlyElevenMessages[key] || null;
}

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
    messageDisplayDiv.innerHTML = '<div class="message-empty-copy">El calendario comenzará el 17 de noviembre de 2025 ✨</div>';
    messageDisplayDiv.classList.add('empty');
    return;
  }

  const msg = window.messagesModule?.dailyMessages?.[dayNum] || 'Mensaje no disponible';
  const date = getDateFromDayNumber(dayNum);
  const { title, body } = getDisplayMessage(msg, dayNum);
  const monthlyMessage = getMonthlyElevenMessage(date);

  messageDisplayDiv.innerHTML = `
    <article class="message-panel">
      <div class="message-day-title">${escapeHtml(title)}</div>
      <div class="message-day-body">
        ${formatRichText(body)}
      </div>
    </article>
    ${monthlyMessage ? `
      <article class="message-panel message-panel-secondary">
        <div class="message-month-title">Feliz mes, mi cielo</div>
        <div class="message-month-label">${escapeHtml(monthlyMessage.title)}</div>
        <div class="message-day-body">
          ${formatRichText(monthlyMessage.body)}
        </div>
      </article>
    ` : ''}
  `;
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
  if (document.activeElement && calendarUnlockModal.contains(document.activeElement) && document.activeElement.blur) {
    document.activeElement.blur();
  }
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
      if (cellDate.getTime() === todayDate.getTime() && selectedDayNum === dayNum) {
        dayBtn.classList.add('today-selected');
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
