(function () {
  const STORAGE_KEY = 'zamge_push_prompt_dismissed';
  const API_BASE = (() => {
    const metaValue = document.querySelector('meta[name="push-api-base"]')?.getAttribute('content')?.trim();
    const globalValue = String(window.ZAMGE_PUSH_API_BASE || '').trim();
    const storedValue = String(localStorage.getItem('zamge_push_api_base') || '').trim();
    return metaValue || globalValue || storedValue || window.location.origin;
  })();

  let serviceWorkerRegistration = null;
  let currentSubscription = null;
  let settingsUiBound = false;

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
      hour: document.getElementById('push-hour'),
      minute: document.getElementById('push-minute'),
      meridiem: document.getElementById('push-meridiem'),
      status: document.getElementById('push-settings-status'),
      liveState: document.getElementById('push-live-state'),
      openBtn: document.getElementById('btn-push-settings'),
      saveBtn: document.getElementById('btn-save-push-settings'),
      cancelBtn: document.getElementById('btn-cancel-push-settings'),
      closeBtn: document.getElementById('btn-close-push-settings-x')
    };
  }

  async function getPublicKey() {
    const res = await fetch(`${API_BASE}/api/push/public-key`);
    if (res.status === 404) {
      throw new Error('El backend push no está disponible en esta URL. Si subes el frontend a GitHub, configura un backend aparte y pon su URL en push-api-base.');
    }
    if (!res.ok) throw new Error('No se pudo obtener la clave pública push.');
    const data = await res.json();
    return data.publicKey;
  }

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return null;
    if (serviceWorkerRegistration) return serviceWorkerRegistration;
    serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
    return serviceWorkerRegistration;
  }

  function getTimeParts(value) {
    const [hourText = '06', minuteText = '00'] = String(value || '06:00').split(':');
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
    if (!els.hour || !els.minute) return;
    if (!els.hour.options.length) {
      els.hour.innerHTML = Array.from({ length: 12 }, (_, index) => {
        const value = String(index + 1).padStart(2, '0');
        return `<option value="${value}">${value}</option>`;
      }).join('');
    }
    if (!els.minute.options.length) {
      els.minute.innerHTML = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
        .map((value) => `<option value="${value}">${value}</option>`)
        .join('');
    }
  }

  function readSelectedTime() {
    const els = getSettingsElements();
    return from12HourParts(els.hour?.value, els.minute?.value, els.meridiem?.value);
  }

  function writeSelectedTime(value) {
    const els = getSettingsElements();
    const parts = to12HourParts(value);
    if (els.hour) els.hour.value = parts.hour;
    if (els.minute) els.minute.value = parts.minute;
    if (els.meridiem) els.meridiem.value = parts.meridiem;
  }

  function formatFriendlyTime(value) {
    const parts = to12HourParts(value);
    return `${Number(parts.hour)}:${parts.minute} ${parts.meridiem === 'AM' ? 'a. m.' : 'p. m.'}`;
  }

  function renderLiveState() {
    const els = getSettingsElements();
    if (!els.liveState) return;
    const time = readSelectedTime();
    if (els.enabled?.checked) {
      els.liveState.textContent = `✅ Mensajes activos — recibirás tu mensaje cada día a las ${formatFriendlyTime(time)}.`;
      els.liveState.classList.add('is-active');
      els.liveState.classList.remove('is-paused');
    } else {
      els.liveState.textContent = '💤 Notificaciones pausadas.';
      els.liveState.classList.add('is-paused');
      els.liveState.classList.remove('is-active');
    }
  }

  async function postJson(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'No se pudo completar la acción.');
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
      return { enabled: false, time: '06:00', hasSubscription: false };
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
        <p style="margin:0 0 18px;">Si aceptas, te llegará cada día a la hora que elijas el mensaje del calendario, incluso cuando no tengas la página abierta.</p>
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
      await ensureSubscription({ enabled: true, time });
      localStorage.setItem(STORAGE_KEY, '1');
      if (showSuccess) {
        window.showPopup?.(`Listo 💌 Quedaste suscrita para recibir tu mensajito diario a las ${time}.`);
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
    try {
      const settings = await readCurrentSettings();
      els.enabled.checked = settings.enabled;
      writeSelectedTime(settings.time);
      renderLiveState();
      if (!settings.hasSubscription && Notification.permission !== 'granted') {
        els.status.textContent = 'Primero acepta el permiso del navegador para poder activarlos.';
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
    els.modal.classList.add('hidden');
    els.modal.setAttribute('aria-hidden', 'true');
    els.status.textContent = '';
  }

  async function savePushSettings() {
    const els = getSettingsElements();
    els.status.textContent = '';
    const selectedTime = readSelectedTime();

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
        window.showPopup?.(`Mensajitos diarios activados 💌 Llegarán a las ${formatFriendlyTime(selectedTime)}.`);
      } else {
        await saveSubscriptionSettings({ enabled: false, time: selectedTime });
        window.showPopup?.('Mensajitos diarios desactivados por ahora.');
      }

      closePushSettingsModal();
    } catch (error) {
      els.status.textContent = error.message || 'No se pudieron guardar los ajustes.';
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
    els.enabled?.addEventListener('change', renderLiveState);
    els.hour?.addEventListener('change', renderLiveState);
    els.minute?.addEventListener('change', renderLiveState);
    els.meridiem?.addEventListener('change', renderLiveState);
    els.modal?.addEventListener('click', (event) => {
      if (event.target === els.modal) closePushSettingsModal();
    });
  }

  async function initNotifications() {
    bindSettingsUi();
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
