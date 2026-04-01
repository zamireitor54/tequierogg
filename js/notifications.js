(function () {
  const STORAGE_KEY = 'zamge_push_prompt_dismissed';
  const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1']);
  const FIXED_DAILY_TIME = '06:00';
  const FIXED_DAILY_TIME_LABEL = '6:00 a. m.';

  function isLocalUrl(value) {
    try {
      const url = new URL(value, window.location.origin);
      return LOCAL_HOSTNAMES.has(url.hostname);
    } catch {
      return false;
    }
  }

  function isCurrentHostLocal() {
    return LOCAL_HOSTNAMES.has(window.location.hostname);
  }

  function pickApiBase(...values) {
    for (const rawValue of values) {
      const value = String(rawValue || '').trim();
      if (!value) continue;
      if (isLocalUrl(value) && !isCurrentHostLocal()) continue;
      return value.replace(/\/+$/, '');
    }
    return isCurrentHostLocal() ? window.location.origin.replace(/\/+$/, '') : '';
  }

  const API_BASE = (() => {
    const metaValue = document.querySelector('meta[name="push-api-base"]')?.getAttribute('content')?.trim();
    const globalValue = String(window.ZAMGE_PUSH_API_BASE || '').trim();
    const storedValue = String(localStorage.getItem('zamge_push_api_base') || '').trim();
    return pickApiBase(metaValue, globalValue, storedValue);
  })();

  let serviceWorkerRegistration = null;
  let currentSubscription = null;
  let settingsUiBound = false;
  let backendStatus = { checked: false, available: false, message: '' };

  function getUnavailableBackendMessage() {
    return isCurrentHostLocal()
      ? 'Los mensajitos diarios no funcionarán desde Live Server. Para probarlos en tu PC abre esta página con `npm start` para levantar el backend.'
      : 'Los mensajitos diarios necesitan un backend de notificaciones aparte. En GitHub Pages el diseño sí sirve, pero para activar avisos hay que conectar ese backend.';
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }

  function getSettingsElements() {
    return {
      modal: document.getElementById('push-settings-modal'),
      enabled: document.getElementById('push-enabled'),
      timeField: document.getElementById('push-settings-time-field'),
      hour: document.getElementById('push-hour'),
      minute: document.getElementById('push-minute'),
      meridiem: document.getElementById('push-meridiem'),
      meridiemButtons: Array.from(document.querySelectorAll('.push-meridiem-btn')),
      status: document.getElementById('push-settings-status'),
      liveState: document.getElementById('push-live-state'),
      backendState: document.getElementById('push-backend-state'),
      openBtn: document.getElementById('btn-push-settings'),
      saveBtn: document.getElementById('btn-save-push-settings'),
      testBtn: document.getElementById('btn-test-push-settings'),
      cancelBtn: document.getElementById('btn-cancel-push-settings'),
      closeBtn: document.getElementById('btn-close-push-settings-x')
    };
  }

  async function getPublicKey() {
    if (!API_BASE) {
      throw new Error(getUnavailableBackendMessage());
    }
    let res;
    try {
      res = await fetch(`${API_BASE}/api/push/public-key`);
    } catch (_error) {
      throw new Error('Los mensajitos diarios necesitan un backend de notificaciones. En GitHub Pages el diseño funciona, pero las notificaciones no se pueden guardar hasta conectar ese backend.');
    }
    if (res.status === 404) {
      throw new Error('Los mensajitos diarios necesitan un backend de notificaciones. En esta URL no está configurado todavía.');
    }
    if (!res.ok) throw new Error('No se pudo preparar la activación de los mensajitos diarios.');
    const data = await res.json();
    return data.publicKey;
  }

  async function checkBackendAvailability() {
    if (backendStatus.checked) return backendStatus;

    if (!API_BASE) {
      backendStatus = {
        checked: true,
        available: false,
        message: getUnavailableBackendMessage()
      };
      return backendStatus;
    }

    try {
      const res = await fetch(`${API_BASE}/api/push/public-key`, { method: 'GET' });
      if (res.ok) {
        backendStatus = { checked: true, available: true, message: '' };
        return backendStatus;
      }
    } catch (_error) {
      // handled below with friendly fallback
    }

    backendStatus = {
      checked: true,
      available: false,
      message: getUnavailableBackendMessage()
    };
    return backendStatus;
  }

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return null;
    if (serviceWorkerRegistration) return serviceWorkerRegistration;
    serviceWorkerRegistration = await navigator.serviceWorker.register('sw.js', { scope: './' });
    return serviceWorkerRegistration;
  }

  function getTimeParts(value) {
    const [hourText = '06', minuteText = '00'] = String(value || FIXED_DAILY_TIME).split(':');
    return {
      hour: Math.min(23, Math.max(0, Number(hourText) || 6)),
      minute: Math.min(59, Math.max(0, Number(minuteText) || 0))
    };
  }

  function to12HourParts(value = '06:00') {
    const { hour, minute } = getTimeParts(value);
    const meridiem = hour >= 12 ? 'PM' : 'AM';
    const normalizedHour = hour % 12 || 12;
    return {
      hour: String(normalizedHour).padStart(2, '0'),
      minute: String(minute).padStart(2, '0'),
      meridiem
    };
  }

  function from12HourParts(hourText, minuteText, meridiemText) {
    const rawHour = Math.min(12, Math.max(1, Number(hourText) || 6));
    const minute = Math.min(59, Math.max(0, Number(minuteText) || 0));
    let hour = rawHour % 12;
    if (String(meridiemText || 'AM').toUpperCase() === 'PM') {
      hour += 12;
    }
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  function populateTimeSelects() {
    const els = getSettingsElements();
    if (!els.hour) return;
    writeSelectedTime(FIXED_DAILY_TIME);
  }

  function normalizeHourInput(rawValue) {
    const digitsOnly = String(rawValue || '').replace(/\D+/g, '').slice(0, 2);
    if (!digitsOnly) return '06';
    const hour = Math.min(12, Math.max(1, Number(digitsOnly) || 6));
    return String(hour).padStart(2, '0');
  }

  function normalizeMinuteInput(rawValue) {
    const digitsOnly = String(rawValue || '').replace(/\D+/g, '').slice(0, 2);
    if (!digitsOnly) return '00';
    const minute = Math.min(59, Math.max(0, Number(digitsOnly) || 0));
    return String(minute).padStart(2, '0');
  }

  function overwriteTimeInputDigit(input, digit, normalize) {
    if (!input) return;
    const cleanDigit = String(digit || '').replace(/\D+/g, '').slice(0, 1);
    if (!cleanDigit) return;

    const current = normalize(input.value || input.placeholder || '');
    const start = Math.max(0, Math.min(1, input.selectionStart ?? 0));
    const end = Math.max(start, Math.min(2, input.selectionEnd ?? start));
    const chars = current.padEnd(2, '0').slice(0, 2).split('');

    if (end > start) {
      chars[start] = cleanDigit;
      if (start + 1 < end) {
        for (let index = start + 1; index < end; index += 1) {
          chars[index] = '0';
        }
      }
    } else {
      chars[start] = cleanDigit;
    }

    input.value = normalize(chars.join(''));
    const nextPos = Math.min(2, start + 1);
    requestAnimationFrame(() => input.setSelectionRange(nextPos, nextPos));
  }

  function bindOverwriteNumericInput(input, normalize, onChange, onEnter) {
    if (!input) return;

    input.addEventListener('focus', () => {
      const normalized = normalize(input.value || input.placeholder || '');
      input.value = normalized;
      requestAnimationFrame(() => input.setSelectionRange(0, 0));
    });

    input.addEventListener('click', () => {
      const caret = Math.max(0, Math.min(2, input.selectionStart ?? 0));
      requestAnimationFrame(() => input.setSelectionRange(caret, caret));
    });

    input.addEventListener('keydown', (event) => {
      if (/^\d$/.test(event.key)) {
        event.preventDefault();
        overwriteTimeInputDigit(input, event.key, normalize);
        onChange?.();
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        onEnter?.();
        return;
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        const current = normalize(input.value || input.placeholder || '');
        const chars = current.padEnd(2, '0').slice(0, 2).split('');
        const start = Math.max(0, Math.min(1, input.selectionStart ?? 0));
        const end = Math.max(start, Math.min(2, input.selectionEnd ?? start));
        const index = end > start ? start : (event.key === 'Backspace' ? Math.max(0, start - 1) : start);
        chars[index] = '0';
        input.value = normalize(chars.join(''));
        const nextPos = event.key === 'Backspace' ? index : Math.min(2, index);
        requestAnimationFrame(() => input.setSelectionRange(nextPos, nextPos));
        onChange?.();
      }
    });

    input.addEventListener('input', () => {
      input.value = normalize(input.value);
      onChange?.();
    });

    input.addEventListener('blur', () => {
      input.value = normalize(input.value);
      onChange?.();
    });
  }

  function readSelectedTime() {
    return FIXED_DAILY_TIME;
  }

  function writeSelectedTime(value) {
    const els = getSettingsElements();
    const parts = to12HourParts(value);
    if (els.hour) els.hour.value = normalizeHourInput(parts.hour);
    if (els.minute) els.minute.value = normalizeMinuteInput(parts.minute);
    if (els.meridiem) els.meridiem.value = parts.meridiem;
    els.meridiemButtons?.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.value === parts.meridiem);
    });
  }

  function formatFriendlyTime(value) {
    const parts = to12HourParts(value);
    return `${Number(parts.hour)}:${parts.minute} ${parts.meridiem === 'AM' ? 'a. m.' : 'p. m.'}`;
  }

  function syncTimeFieldVisibility() {
    const els = getSettingsElements();
    if (!els.timeField) return;
    els.timeField.classList.add('is-hidden');
  }

  function syncBackendDependentUi() {
    const els = getSettingsElements();
    const available = !!backendStatus.available;
    if (els.enabled) {
      els.enabled.disabled = !available;
    }
    if (els.saveBtn) {
      els.saveBtn.disabled = !available;
      els.saveBtn.title = available ? '' : 'Necesitas un backend de notificaciones para guardar esto.';
    }
    if (els.testBtn) {
      els.testBtn.disabled = !available;
      els.testBtn.title = available ? '' : 'Primero necesitas conectar el backend de notificaciones.';
    }
    if (!available && els.enabled) {
      els.enabled.checked = false;
    }
    syncTimeFieldVisibility();
  }

  function renderBackendState() {
    const els = getSettingsElements();
    if (!els.backendState) return;

    if (backendStatus.available) {
      els.backendState.textContent = `Backend listo para enviar notificaciones reales cada mañana alrededor de las ${FIXED_DAILY_TIME_LABEL} ✅`;
      els.backendState.classList.add('is-ready');
      els.backendState.classList.remove('is-unavailable');
      return;
    }

    els.backendState.textContent = isCurrentHostLocal()
      ? 'Estás viendo la versión local. Para probar el envío real usa `npm start` y abre la página desde ese backend.'
      : 'En GitHub Pages el diseño sí se ve, pero el envío real solo funciona si conectas un backend push aparte.';
    els.backendState.classList.add('is-unavailable');
    els.backendState.classList.remove('is-ready');
  }

  function renderLiveState() {
    const els = getSettingsElements();
    if (!els.liveState) return;
    if (!backendStatus.available) {
      els.liveState.textContent = 'Avisos no disponibles en esta versión de la página.';
      els.liveState.classList.add('is-paused');
      els.liveState.classList.remove('is-active');
      syncBackendDependentUi();
      return;
    }
    syncTimeFieldVisibility();
    if (els.enabled?.checked) {
      els.liveState.textContent = `✅ Mensajes activos — recibirás tu mensaje cada mañana alrededor de las ${FIXED_DAILY_TIME_LABEL}.`;
      els.liveState.classList.add('is-active');
      els.liveState.classList.remove('is-paused');
    } else {
      els.liveState.textContent = '💤 Mensajitos pausados por ahora.';
      els.liveState.classList.add('is-paused');
      els.liveState.classList.remove('is-active');
    }
  }

  async function postJson(url, body) {
    if (!API_BASE) {
      throw new Error(getUnavailableBackendMessage());
    }
    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (_error) {
      throw new Error('No pude guardar esto porque el backend de notificaciones no está conectado en esta versión publicada.');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'No se pudo completar la configuración de los mensajitos.');
    return data;
  }

  async function getExistingSubscription(registration) {
    if (!registration?.pushManager) return null;
    currentSubscription = await registration.pushManager.getSubscription();
    return currentSubscription;
  }

  async function saveSubscriptionSettings({ enabled = true, time = '06:00' } = {}) {
    const registration = await registerServiceWorker();
    const subscription = await getExistingSubscription(registration);
    if (!subscription) throw new Error('Primero debes activar las notificaciones.');

    const { hour, minute } = getTimeParts(time);
    await postJson(`${API_BASE}/api/push/settings`, {
      endpoint: subscription.endpoint,
      enabled,
      preferredHour: hour,
      preferredMinute: minute
    });
  }

  async function ensureSubscription({ enabled = true, time = '06:00' } = {}) {
    if (!('Notification' in window) || !('PushManager' in window)) {
      throw new Error('Tu navegador no soporta notificaciones push.');
    }

    const registration = await registerServiceWorker();
    if (!registration) throw new Error('No se pudo registrar el service worker.');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('No se concedió el permiso para notificaciones.');
    }

    const publicKey = await getPublicKey();
    let subscription = await getExistingSubscription(registration);
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
    }

    const { hour, minute } = getTimeParts(time);
    await postJson(`${API_BASE}/api/push/subscribe`, {
      subscription: subscription.toJSON(),
      enabled,
      preferredHour: hour,
      preferredMinute: minute
    });

    currentSubscription = subscription;
    return subscription;
  }

  async function syncSubscription() {
    const registration = await registerServiceWorker();
    if (!registration) return;
    const subscription = await getExistingSubscription(registration);
    if (!subscription) return;

    await postJson(`${API_BASE}/api/push/subscribe`, {
      subscription: subscription.toJSON()
    });
  }

  async function readCurrentSettings() {
    const registration = await registerServiceWorker();
    const subscription = await getExistingSubscription(registration);
    if (!subscription) {
      return { enabled: false, time: FIXED_DAILY_TIME, hasSubscription: false };
    }

    const data = await postJson(`${API_BASE}/api/push/settings/read`, {
      endpoint: subscription.endpoint
    });

    const hour = String(data.settings?.preferred_hour ?? 6).padStart(2, '0');
    const minute = String(data.settings?.preferred_minute ?? 0).padStart(2, '0');
    return {
      enabled: data.settings?.is_active !== false,
      time: `${hour}:${minute}`,
      hasSubscription: true
    };
  }

  function closeNotificationPrompt(modal) {
    modal?.remove();
  }

  function showNotificationPrompt(onAllow) {
    if (localStorage.getItem(STORAGE_KEY) === '1') return;

    const modal = document.createElement('div');
    modal.className = 'popup-modal show';
    modal.innerHTML = `
      <div class="popup-content" style="max-width: 520px;">
        <button class="close-popup" aria-label="Cerrar">×</button>
        <h2 style="margin-bottom:8px;">Activa los mensajitos diarios 🔔</h2>
        <p style="margin:0 0 18px;">Si aceptas, te llegará cada mañana alrededor de las ${FIXED_DAILY_TIME_LABEL} el mensaje del calendario, incluso cuando no tengas la página abierta.</p>
        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          <button type="button" class="btn small outline" id="btn-push-later">Más tarde</button>
          <button type="button" class="btn small" id="btn-push-allow">Activar notificaciones</button>
        </div>
      </div>
    `;

    const close = () => closeNotificationPrompt(modal);
    modal.querySelector('.close-popup')?.addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, '1');
      close();
    });
    modal.querySelector('#btn-push-later')?.addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, '1');
      close();
    });
    modal.querySelector('#btn-push-allow')?.addEventListener('click', async () => {
      try {
        const ok = await onAllow();
        if (ok) close();
      } catch (_error) {
        close();
      }
    });
    modal.addEventListener('click', (event) => {
      if (event.target === modal) close();
    });
    document.body.appendChild(modal);
  }

  async function subscribeToDailyNotifications({ showSuccess = true, time = '06:00' } = {}) {
    try {
      await ensureSubscription({ enabled: true, time: FIXED_DAILY_TIME });
      localStorage.setItem(STORAGE_KEY, '1');
      if (showSuccess) {
        window.showPopup?.(`Listo 💌 Quedaste suscrita para recibir tu mensajito diario cada mañana alrededor de las ${FIXED_DAILY_TIME_LABEL}.`);
      }
      return true;
    } catch (error) {
      console.warn('No se pudieron activar las notificaciones:', error);
      window.showPopup?.(error.message || 'No se pudieron activar las notificaciones.');
      return false;
    }
  }

  async function openPushSettingsModal() {
    const els = getSettingsElements();
    if (!els.modal) return;

    els.status.textContent = '';
    populateTimeSelects();
    await checkBackendAvailability();
    renderBackendState();
    syncBackendDependentUi();

    if (!backendStatus.available) {
      renderLiveState();
      els.status.textContent = backendStatus.message;
      els.modal.classList.remove('hidden');
      els.modal.setAttribute('aria-hidden', 'false');
      return;
    }

    try {
      const settings = await readCurrentSettings();
      els.enabled.checked = settings.enabled;
      writeSelectedTime(FIXED_DAILY_TIME);
      renderLiveState();
      if (!settings.hasSubscription && Notification.permission !== 'granted') {
        els.status.textContent = 'Actívalos cuando quieras. Al guardar, el navegador te pedirá permiso para enviarte el mensajito diario.';
      }
    } catch (error) {
      els.status.textContent = error.message || 'No se pudieron cargar los ajustes.';
    }

    els.modal.classList.remove('hidden');
    els.modal.setAttribute('aria-hidden', 'false');
  }

  function closePushSettingsModal() {
    const els = getSettingsElements();
    if (!els.modal) return;
    if (document.activeElement && els.modal.contains(document.activeElement) && document.activeElement.blur) {
      document.activeElement.blur();
    }
    els.modal.classList.add('hidden');
    els.modal.setAttribute('aria-hidden', 'true');
    els.status.textContent = '';
  }

  async function savePushSettings() {
    const els = getSettingsElements();
    els.status.textContent = '';
    if (!backendStatus.available) {
      els.status.textContent = backendStatus.message;
      return;
    }
    const selectedTime = FIXED_DAILY_TIME;

    try {
      if (els.enabled.checked) {
        const ok = await subscribeToDailyNotifications({ showSuccess: false, time: selectedTime });
        if (!ok) return;
      } else {
        const registration = await registerServiceWorker();
        const subscription = await getExistingSubscription(registration);
        if (subscription) {
          await saveSubscriptionSettings({ enabled: false, time: selectedTime });
        }
      }

      if (els.enabled.checked) {
        await saveSubscriptionSettings({ enabled: true, time: selectedTime });
        window.showPopup?.(`Mensajitos diarios activados 💌 Llegarán cada mañana alrededor de las ${FIXED_DAILY_TIME_LABEL}.`);
      } else {
        await saveSubscriptionSettings({ enabled: false, time: selectedTime });
        window.showPopup?.('Mensajitos diarios desactivados por ahora.');
      }

      closePushSettingsModal();
    } catch (error) {
      els.status.textContent = error.message || 'No se pudieron guardar los ajustes.';
    }
  }

  async function sendTestNotificationNow() {
    const els = getSettingsElements();
    els.status.textContent = '';
    await checkBackendAvailability();
    renderBackendState();
    syncBackendDependentUi();

    if (!backendStatus.available) {
      els.status.textContent = backendStatus.message;
      return;
    }

    const selectedTime = FIXED_DAILY_TIME;
    if (!els.enabled?.checked) {
      els.status.textContent = 'Activa los mensajitos diarios y guárdalos para poder mandarte una prueba en este dispositivo.';
      return;
    }

    try {
      const ok = await subscribeToDailyNotifications({ showSuccess: false, time: selectedTime });
      if (!ok) return;

      await saveSubscriptionSettings({ enabled: true, time: selectedTime });
      const data = await postJson(`${API_BASE}/api/push/send-test`, {});
      const results = Array.isArray(data.result?.sent) ? data.result.sent : [];
      const sentCount = results.filter((item) => item.status === 'sent').length;

      if (sentCount > 0) {
        window.showPopup?.(`Prueba enviada 💌 Revisa tus notificaciones. El backend reportó ${sentCount} envío${sentCount === 1 ? '' : 's'} correcto${sentCount === 1 ? '' : 's'}.`);
        return;
      }

      els.status.textContent = 'No encontré suscripciones activas para mandar la prueba.';
    } catch (error) {
      els.status.textContent = error.message || 'No se pudo enviar la notificación de prueba.';
    }
  }

  function bindSettingsUi() {
    if (settingsUiBound) return;
    settingsUiBound = true;
    const els = getSettingsElements();
    populateTimeSelects();
    els.openBtn?.addEventListener('click', openPushSettingsModal);
    els.cancelBtn?.addEventListener('click', closePushSettingsModal);
    els.closeBtn?.addEventListener('click', closePushSettingsModal);
    els.saveBtn?.addEventListener('click', savePushSettings);
    els.testBtn?.addEventListener('click', sendTestNotificationNow);
    els.enabled?.addEventListener('change', renderLiveState);
    bindOverwriteNumericInput(els.hour, normalizeHourInput, renderLiveState, () => {
      els.minute?.focus();
      els.minute?.setSelectionRange?.(0, 0);
    });
    bindOverwriteNumericInput(els.minute, normalizeMinuteInput, renderLiveState, () => {
      const activeMeridiemButton = els.meridiemButtons?.find((button) => button.dataset.value === els.meridiem?.value);
      activeMeridiemButton?.focus();
    });
    els.meridiemButtons?.forEach((button) => {
      button.addEventListener('click', () => {
        if (!els.meridiem) return;
        els.meridiem.value = button.dataset.value || 'AM';
        writeSelectedTime(from12HourParts(els.hour?.value, els.minute?.value, els.meridiem.value));
        renderLiveState();
      });
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          els.saveBtn?.focus();
        }
      });
    });
    els.modal?.addEventListener('click', (event) => {
      if (event.target === els.modal) closePushSettingsModal();
    });
  }

  async function initNotifications() {
    bindSettingsUi();
    await checkBackendAvailability();
    renderBackendState();
    syncBackendDependentUi();
    renderLiveState();

    if (!window.isSecureContext) return;
    if (!('serviceWorker' in navigator) || !('Notification' in window) || !('PushManager' in window)) return;
  }

  window.pushNotificationsModule = {
    initNotifications,
    subscribeToDailyNotifications,
    openPushSettingsModal
  };
})();
