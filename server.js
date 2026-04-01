require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const cron = require('node-cron');
const webPush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const FIXED_PUSH_HOUR = 6;
const FIXED_PUSH_MINUTE = 0;

function normalizeBaseUrl(value, fallback) {
  const rawValue = String(value || fallback || '').trim();
  if (!rawValue) return '';
  return rawValue.replace(/\/+$/, '');
}

function normalizeOrigin(value) {
  const rawValue = String(value || '').trim();
  if (!rawValue) return '';
  try {
    return new URL(rawValue).origin;
  } catch {
    return rawValue.replace(/\/+$/, '');
  }
}

const APP_URL = normalizeBaseUrl(process.env.PUBLIC_APP_URL, `http://localhost:${PORT}`);
const SITE_URL = normalizeBaseUrl(process.env.PUSH_SITE_URL || process.env.PUBLIC_SITE_URL, APP_URL);
const ASSET_URL = normalizeBaseUrl(process.env.PUBLIC_ASSET_URL, SITE_URL);
const TIMEZONE = 'America/Bogota';
const cronSecret = String(process.env.CRON_SECRET || '').trim();
const defaultAllowedOrigins = [
  APP_URL,
  SITE_URL,
  'http://localhost:3010',
  'http://localhost:5503',
  'http://127.0.0.1:5503'
];
const allowedOrigins = String(process.env.PUSH_ALLOWED_ORIGINS || defaultAllowedOrigins.join(','))
  .split(',')
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:no-reply@example.com';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } })
  : null;
const dataDir = path.join(__dirname, 'data');
const pushStorePath = path.join(dataDir, 'push-subscriptions.json');

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} else {
  console.warn('Web Push no configurado: faltan VAPID_PUBLIC_KEY y/o VAPID_PRIVATE_KEY.');
}

app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  return next();
});
app.use(express.static(__dirname));

function ensurePushStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(pushStorePath)) {
    fs.writeFileSync(pushStorePath, '[]', 'utf8');
  }
}

function readPushStore() {
  ensurePushStore();
  try {
    return JSON.parse(fs.readFileSync(pushStorePath, 'utf8'));
  } catch (_error) {
    return [];
  }
}

function writePushStore(records) {
  ensurePushStore();
  fs.writeFileSync(pushStorePath, JSON.stringify(records, null, 2), 'utf8');
}

async function upsertSubscriptionRecord(record) {
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert(record, { onConflict: 'endpoint' });
    if (error) throw error;
    return;
  }

  const records = readPushStore();
  const index = records.findIndex((item) => item.endpoint === record.endpoint);
  if (index >= 0) {
    records[index] = { ...records[index], ...record };
  } else {
    records.push(record);
  }
  writePushStore(records);
}

async function updateSubscriptionRecord(endpoint, patch) {
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .update(patch)
      .eq('endpoint', endpoint);
    if (error) throw error;
    return;
  }

  const records = readPushStore();
  const index = records.findIndex((item) => item.endpoint === endpoint);
  if (index >= 0) {
    records[index] = { ...records[index], ...patch };
    writePushStore(records);
  }
}

async function getSubscriptionRecord(endpoint) {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('endpoint, is_active, preferred_hour, preferred_minute')
      .eq('endpoint', endpoint)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  const records = readPushStore();
  return records.find((item) => item.endpoint === endpoint) || null;
}

app.get('/sw.js', (_req, res) => {
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.join(__dirname, 'sw.js'));
});

app.get('/api/push/public-key', (_req, res) => {
  if (!vapidPublicKey) {
    return res.status(503).json({ error: 'VAPID_PUBLIC_KEY no configurada.' });
  }
  res.json({ publicKey: vapidPublicKey });
});

app.post('/api/push/subscribe', async (req, res) => {
  try {
    const subscription = req.body?.subscription;
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ error: 'Suscripción push inválida.' });
    }

    const userAgent = String(req.headers['user-agent'] || '').slice(0, 500);
    const enabled = req.body?.enabled !== false;
    await upsertSubscriptionRecord({
      endpoint: subscription.endpoint,
      subscription,
      keys: subscription.keys,
      user_agent: userAgent || null,
      is_active: enabled,
      preferred_hour: FIXED_PUSH_HOUR,
      preferred_minute: FIXED_PUSH_MINUTE,
      updated_at: new Date().toISOString()
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('No se pudo guardar la suscripción push:', error);
    res.status(500).json({ error: 'No se pudo guardar la suscripción.' });
  }
});

app.post('/api/push/settings/read', async (req, res) => {
  try {
    const endpoint = String(req.body?.endpoint || '').trim();
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint inválido.' });
    }

    const data = await getSubscriptionRecord(endpoint);

    res.json({
      ok: true,
      settings: data || {
        endpoint,
        is_active: true,
        preferred_hour: FIXED_PUSH_HOUR,
        preferred_minute: FIXED_PUSH_MINUTE
      }
    });
  } catch (error) {
    console.error('No se pudieron leer ajustes push:', error);
    res.status(500).json({ error: 'No se pudieron leer los ajustes.' });
  }
});

app.post('/api/push/settings', async (req, res) => {
  try {
    const endpoint = String(req.body?.endpoint || '').trim();
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint inválido.' });
    }

    const enabled = req.body?.enabled !== false;

    await updateSubscriptionRecord(endpoint, {
      is_active: enabled,
      preferred_hour: FIXED_PUSH_HOUR,
      preferred_minute: FIXED_PUSH_MINUTE,
      updated_at: new Date().toISOString()
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('No se pudieron guardar ajustes push:', error);
    res.status(500).json({ error: 'No se pudieron guardar los ajustes.' });
  }
});

app.post('/api/push/unsubscribe', async (req, res) => {
  try {
    const endpoint = String(req.body?.endpoint || '').trim();
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint inválido.' });
    }

    await updateSubscriptionRecord(endpoint, {
      is_active: false,
      updated_at: new Date().toISOString()
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('No se pudo desactivar la suscripción push:', error);
    res.status(500).json({ error: 'No se pudo desactivar la suscripción.' });
  }
});

app.post('/api/push/send-test', async (req, res) => {
  try {
    const endpoint = String(req.body?.endpoint || '').trim();
    const result = await sendDailyCalendarNotification({ force: true, isTest: true, targetEndpoint: endpoint || null });
    res.json({ ok: true, result });
  } catch (error) {
    console.error('Error enviando push de prueba:', error);
    res.status(500).json({ error: 'No se pudo enviar el push de prueba.' });
  }
});

app.get('/api/cron/send-daily', async (req, res) => {
  try {
    if (cronSecret) {
      const authorization = String(req.headers.authorization || '').trim();
      if (authorization !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'No autorizado.' });
      }
    }

    const result = await sendDailyCalendarNotification({ ignorePreferredTime: true });
    res.json({ ok: true, result });
  } catch (error) {
    console.error('Error en cron diario push:', error);
    res.status(500).json({ error: 'No se pudo ejecutar el cron diario.' });
  }
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'index.html'));
});

function loadDailyMessages() {
  const source = fs.readFileSync(path.join(__dirname, 'js', 'messages.js'), 'utf8');
  const match = source.match(/const dailyMessages = \[(.*?)\];/s);
  if (!match) {
    throw new Error('No se pudo encontrar dailyMessages en js/messages.js');
  }
  return vm.runInNewContext(`[${match[1]}]`);
}

function clampHour(value) {
  const hour = Number(value);
  if (!Number.isFinite(hour)) return 6;
  return Math.min(23, Math.max(0, Math.floor(hour)));
}

function clampMinute(value) {
  const minute = Number(value);
  if (!Number.isFinite(minute)) return 0;
  return Math.min(59, Math.max(0, Math.floor(minute)));
}

function getCalendarDayNumber(date = new Date(), timeZone = TIMEZONE) {
  const targetParts = getTimePartsInTimezone(date, timeZone);
  const startUtc = Date.UTC(2025, 10, 17);
  const targetUtc = Date.UTC(targetParts.year, targetParts.month - 1, targetParts.day);
  const diffMs = targetUtc - startUtc;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? Math.min(diffDays, 364) : -1;
}

function getTimePartsInTimezone(date = new Date(), timeZone = TIMEZONE) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value || '';
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
    dateKey: `${get('year')}-${get('month')}-${get('day')}`
  };
}

function normalizePhotoUrl(value) {
  const rawValue = String(value || '').trim();
  if (!rawValue) return '';
  try {
    return new URL(rawValue, SITE_URL).href;
  } catch {
    return rawValue;
  }
}

async function getNotificationGalleryImageUrl() {
  const fallbackImage = `${ASSET_URL}/img/mini_nina.jpg`;
  if (!supabaseAdmin) return fallbackImage;

  try {
    const { data, error } = await supabaseAdmin
      .from('photos')
      .select('url')
      .not('url', 'is', null)
      .limit(200);

    if (error) throw error;

    const candidates = (Array.isArray(data) ? data : [])
      .map((item) => normalizePhotoUrl(item?.url))
      .filter(Boolean);

    if (!candidates.length) return fallbackImage;
    return candidates[Math.floor(Math.random() * candidates.length)] || fallbackImage;
  } catch (error) {
    console.warn('No pude sacar una foto de la galeria para la notificacion:', error?.message || error);
    return fallbackImage;
  }
}

function isMobileUserAgent(userAgent = '') {
  return /(android|iphone|ipad|ipod|mobile)/i.test(String(userAgent || '').toLowerCase());
}

function shouldAttachNotificationImage(userAgent = '') {
  return !isMobileUserAgent(userAgent);
}

async function buildNotificationPayload(dayNum, { isTest = false, userAgent = '' } = {}) {
  const dailyMessages = loadDailyMessages();
  const rawMessage = String(dailyMessages[dayNum] || '').trim();
  const body = rawMessage
    .replace(/^Día\s+\d+:\s*/i, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const safeDayNum = Number.isFinite(dayNum) ? dayNum : 0;
  const isMobile = isMobileUserAgent(userAgent);
  const title = isTest
    ? 'Mensajito de prueba'
    : (isMobile ? 'Mensajito de hoy' : `Mensajito del dia ${safeDayNum + 1}`);
  const appIconUrl = `${ASSET_URL}/img/mini_nina.jpg`;
  const cleanIconUrl = `${ASSET_URL}/img/tab-love.svg`;
  const includeImage = shouldAttachNotificationImage(userAgent);
  const galleryImageUrl = includeImage ? await getNotificationGalleryImageUrl() : '';

  return {
    title,
    body: body || 'Ya está listo tu mensaje de hoy.',
    tag: `zamge-day-${safeDayNum}`,
    icon: isMobile ? cleanIconUrl : appIconUrl,
    badge: cleanIconUrl,
    image: galleryImageUrl || undefined,
    data: {
      url: `${SITE_URL}/?calendarDay=${safeDayNum}&openCalendar=1`,
      dayNum: safeDayNum,
      preferTextOnly: isMobile
    }
  };
}

async function getActiveSubscriptions() {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('endpoint, subscription, user_agent, is_active, preferred_hour, preferred_minute, last_sent_at')
      .eq('is_active', true);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }

  return readPushStore().filter((item) => item.is_active !== false);
}

async function deactivateSubscription(endpoint) {
  if (!endpoint) return;
  await updateSubscriptionRecord(endpoint, {
    is_active: false,
    updated_at: new Date().toISOString()
  });
}

async function sendNotificationToSubscription(record, payload) {
  try {
    await webPush.sendNotification(record.subscription, JSON.stringify(payload));
    await updateSubscriptionRecord(record.endpoint, {
      last_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return { endpoint: record.endpoint, status: 'sent' };
  } catch (error) {
    const statusCode = error?.statusCode || 0;
    if (statusCode === 404 || statusCode === 410) {
      await deactivateSubscription(record.endpoint);
      return { endpoint: record.endpoint, status: 'deactivated' };
    }
    console.error('Falló envío push:', record.endpoint, error);
    return { endpoint: record.endpoint, status: 'failed' };
  }
}

async function sendDailyCalendarNotification({ force = false, isTest = false, ignorePreferredTime = false, targetEndpoint = null } = {}) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    throw new Error('Faltan variables de entorno VAPID para notificaciones push.');
  }

  const now = new Date();
  const dayNum = force ? Math.max(0, getCalendarDayNumber(now)) : getCalendarDayNumber(now);
  if (dayNum < 0 || dayNum > 364) {
    return { skipped: true, reason: 'Fuera del rango del calendario.' };
  }

  const subscriptions = await getActiveSubscriptions();
  if (!subscriptions.length) {
    return { skipped: true, reason: 'No hay suscripciones activas.' };
  }

  const normalizedTargetEndpoint = String(targetEndpoint || '').trim();
  const scopedSubscriptions = normalizedTargetEndpoint
    ? subscriptions.filter((record) => String(record.endpoint || '').trim() === normalizedTargetEndpoint)
    : subscriptions;

  if (!scopedSubscriptions.length) {
    return {
      skipped: true,
      reason: normalizedTargetEndpoint
        ? 'No existe una suscripción activa para este dispositivo.'
        : 'No hay suscripciones activas.'
    };
  }

  const nowParts = getTimePartsInTimezone(now);
  const results = [];
  for (const record of scopedSubscriptions) {
    if (!force) {
      if (!ignorePreferredTime) {
        const preferredHour = clampHour(record.preferred_hour);
        const preferredMinute = clampMinute(record.preferred_minute);
        if (preferredHour !== nowParts.hour || preferredMinute !== nowParts.minute) {
          results.push({ endpoint: record.endpoint, status: 'skipped-time' });
          continue;
        }
      }

      const lastSentDateKey = record.last_sent_at
        ? getTimePartsInTimezone(new Date(record.last_sent_at)).dateKey
        : '';
      if (lastSentDateKey === nowParts.dateKey) {
        results.push({ endpoint: record.endpoint, status: 'already-sent-today' });
        continue;
      }
    }

    const payload = await buildNotificationPayload(dayNum, {
      isTest,
      userAgent: record.user_agent || ''
    });
    results.push(await sendNotificationToSubscription(record, payload));
  }
  return { dayNum, sent: results };
}

cron.schedule('* * * * *', async () => {
  try {
    const result = await sendDailyCalendarNotification();
    console.log('Cron push diario:', result);
  } catch (error) {
    console.error('Error en cron push diario:', error);
  }
}, { timezone: TIMEZONE });

app.listen(PORT, () => {
  console.log(`Zamge backend corriendo en ${APP_URL}`);
  console.log(`Sitio configurado para notificaciones en ${SITE_URL}`);
});
