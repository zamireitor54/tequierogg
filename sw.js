self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

function resolveScopedUrl(path = '') {
  return new URL(path, self.registration.scope).href;
}

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (_error) {
    payload = { title: 'Tienes un mensaje nuevo 💌', body: event.data.text() };
  }

  const title = payload.title || 'Mensajito diario';
  const preferTextOnly = Boolean(payload.data?.preferTextOnly);
  const options = {
    body: payload.body || 'Abre la página para verlo.',
    icon: payload.icon || resolveScopedUrl('img/zg-chrome-logo.png'),
    badge: payload.badge || resolveScopedUrl('img/zg-chrome-logo.png'),
    image: preferTextOnly ? undefined : (payload.image || undefined),
    tag: payload.tag || 'zamge-daily-message',
    renotify: true,
    lang: 'es-CO',
    dir: 'auto',
    timestamp: Date.now(),
    data: payload.data || {}
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url
    ? resolveScopedUrl(event.notification.data.url)
    : self.registration.scope;

  event.waitUntil((async () => {
    const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windowClients) {
      if ('focus' in client) {
        client.navigate(targetUrl);
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow(targetUrl);
    }
    return null;
  })());
});
