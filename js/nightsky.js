/**
 * nightsky.js — V3
 * Cielo nocturno con luna del día, estrellas-evento (Halton distribution),
 * y photo-slot rotatorio AFUERA del stage (no tapa estrellas).
 *
 * Mejoras V3:
 *   - Photo slot vive en .ns-photo-slot-anchor (fuera del stage)
 *   - Crossfade SUAVE de luna: dos SVGs apilados con fade 1.2s
 *   - Estrella activa BRILLA cuando su foto está mostrándose
 *   - Línea conectora SVG desde estrella activa al slot
 *   - Optimizaciones: stars tracked by key, partial updates, no full re-render
 *   - Timeout 4.5s para imágenes lentas → auto-skip si falla
 */
(function () {
  'use strict';

  const CALENDAR_START = new Date('2025-11-17T00:00:00');
  const SYNODIC_DAYS = 29.530588853;
  const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z');
  const SLOT_INTERVAL_MS = 10000;
  const IMAGE_TIMEOUT_MS = 12000; // 12s para conexiones lentas (Supabase storage puede ser lento)
  const MOON_FADE_MS = 2000; // crossfade más lento y cinematográfico

  // localStorage helper — sobrevive al cerrar/abrir pestañas para que la foto no se repita
  const Storage = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
  };

  // ====================================================
  // FASE LUNAR
  // ====================================================
  function getMoonPhase(date = new Date()) {
    const diffDays = (date.getTime() - KNOWN_NEW_MOON.getTime()) / 86400000;
    return (((diffDays % SYNODIC_DAYS) + SYNODIC_DAYS) % SYNODIC_DAYS) / SYNODIC_DAYS;
  }

  function getMoonIllumination(phase) {
    return (1 - Math.cos(2 * Math.PI * phase)) / 2;
  }

  function getMoonPhaseName(phase) {
    if (phase < 0.03 || phase > 0.97) return 'Luna nueva';
    if (phase < 0.22) return 'Luna creciente';
    if (phase < 0.28) return 'Cuarto creciente';
    if (phase < 0.47) return 'Luna gibosa';
    if (phase < 0.53) return 'Luna llena';
    if (phase < 0.72) return 'Gibosa menguante';
    if (phase < 0.78) return 'Cuarto menguante';
    return 'Menguante final';
  }

  function getMoonPoetry(phase) {
    if (phase < 0.03 || phase > 0.97) return 'Una noche oscura para soñar contigo';
    if (phase < 0.22) return 'Como nuestro amor: apenas empieza pero ya brilla';
    if (phase < 0.28) return 'Mitad luz, mitad ternura';
    if (phase < 0.47) return 'Casi llena, como mi corazón cuando pienso en ti';
    if (phase < 0.53) return 'Llena, como mi amor por ti';
    if (phase < 0.72) return 'Sigue brillando, mi niña';
    if (phase < 0.78) return 'Mitad sueño, mitad despedida';
    return 'Tímida pero hermosa';
  }

  // ====================================================
  // SVG DE LA LUNA · región BRILLANTE como path sobre disco oscuro
  // Más cráteres, halo, mejor textura
  // ====================================================
  function buildMoonSVG(phase, opts = {}) {
    const size = opts.size || 100;
    const R = 47;
    const cx = 50, cy = 50;
    const idSuffix = opts.idSuffix || `-${Math.floor(Math.random() * 99999)}`;

    let brightPath = null;
    let isFullMoon = false;
    let isNewMoon = false;

    if (phase < 0.005 || phase > 0.995) {
      isNewMoon = true;
    } else if (phase > 0.495 && phase < 0.505) {
      isFullMoon = true;
    } else {
      const beta = Math.PI * Math.abs(2 * phase - 1);
      const cosBeta = Math.cos(beta);
      const rx = Math.abs(cosBeta) * R;
      const isWaxing = phase < 0.5;
      const isCrescent = (isWaxing && phase < 0.25) || (!isWaxing && phase > 0.75);
      // FIX V4: termSweep estaba invertido.
      // Para arc bottom→top en SVG con Y-down:
      //   sweep=0 (decreasing angle) pasa por la DERECHA
      //   sweep=1 (increasing angle) pasa por la IZQUIERDA
      let outerSweep, termSweep;
      if (isWaxing) {
        outerSweep = 1; // top→bottom via right
        // Waxing crescent: terminator on right (sliver bright). Bottom→top via RIGHT = sweep 0
        // Waxing gibbous: terminator on left (dark sliver). Bottom→top via LEFT = sweep 1
        termSweep = isCrescent ? 0 : 1;
      } else {
        outerSweep = 0; // top→bottom via left
        // Waning gibbous: terminator on right (dark sliver). Bottom→top via RIGHT = sweep 0
        // Waning crescent: terminator on left (sliver bright). Bottom→top via LEFT = sweep 1
        termSweep = isCrescent ? 1 : 0;
      }
      brightPath = `M ${cx},${cy - R} A ${R},${R} 0 0 ${outerSweep} ${cx},${cy + R} A ${rx},${R} 0 0 ${termSweep} ${cx},${cy - R} Z`;
    }

    const craters = `
      <g clip-path="url(#ns-moon-clip${idSuffix})" opacity="0.4">
        <circle cx="35" cy="37" r="4.2" fill="#b8a06c"/>
        <circle cx="61" cy="55" r="6"   fill="#c4a878"/>
        <circle cx="41" cy="66" r="2.6" fill="#b8a06c"/>
        <circle cx="68" cy="31" r="2"   fill="#a89866"/>
        <circle cx="30" cy="58" r="1.6" fill="#b8a06c"/>
        <circle cx="55" cy="40" r="1.4" fill="#a89866"/>
        <circle cx="48" cy="72" r="3"   fill="#b8a06c" opacity="0.6"/>
        <circle cx="72" cy="48" r="1.2" fill="#a89866"/>
        <circle cx="24" cy="46" r="2"   fill="#b8a06c"/>
        <circle cx="58" cy="68" r="1.8" fill="#a89866"/>
      </g>
    `;

    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" aria-hidden="true">
        <defs>
          <!-- Brillante: blanco-cremoso uniforme, no se oscurece tanto en los bordes -->
          <radialGradient id="ns-moon-bright${idSuffix}" cx="42%" cy="38%" r="80%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="55%" stop-color="#fff5d8"/>
            <stop offset="90%" stop-color="#f4e2b2"/>
            <stop offset="100%" stop-color="#e8cd92"/>
          </radialGradient>
          <radialGradient id="ns-moon-dark${idSuffix}" cx="45%" cy="45%" r="70%">
            <stop offset="0%" stop-color="#3a2470" stop-opacity="0.94"/>
            <stop offset="60%" stop-color="#1c0e44" stop-opacity="0.97"/>
            <stop offset="100%" stop-color="#0a0420" stop-opacity="0.99"/>
          </radialGradient>
          <radialGradient id="ns-moon-halo${idSuffix}" cx="50%" cy="50%" r="50%">
            <stop offset="48%" stop-color="rgba(255,230,200,0)"/>
            <stop offset="72%" stop-color="rgba(255,230,200,0.22)"/>
            <stop offset="100%" stop-color="rgba(255,230,200,0)"/>
          </radialGradient>
          <clipPath id="ns-moon-clip${idSuffix}">
            <circle cx="${cx}" cy="${cy}" r="${R}"/>
          </clipPath>
        </defs>

        <!-- Halo exterior (aura) -->
        <circle cx="${cx}" cy="${cy}" r="49" fill="url(#ns-moon-halo${idSuffix})"/>

        ${isFullMoon
          ? `<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#ns-moon-bright${idSuffix})"/>${craters}`
          : isNewMoon
            ? `<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#ns-moon-dark${idSuffix})"/>`
            : `<g clip-path="url(#ns-moon-clip${idSuffix})">
                 <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#ns-moon-dark${idSuffix})"/>
                 <path d="${brightPath}" fill="url(#ns-moon-bright${idSuffix})"/>
               </g>
               ${craters}`
        }

        <!-- Aro tenue -->
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="rgba(255,230,200,0.28)" stroke-width="0.7"/>
      </svg>
    `;
  }

  // ====================================================
  // HALTON SEQUENCE — distribución uniforme
  // ====================================================
  function halton(index, base) {
    let f = 1, r = 0, i = index + 1;
    while (i > 0) {
      f = f / base;
      r += f * (i % base);
      i = Math.floor(i / base);
    }
    return r;
  }

  function positionForIndex(idx, w, h, moonC, moonR) {
    let tries = 0;
    let seqIdx = idx;
    const marginX = 0.04 * w;
    const marginY = 0.05 * h;
    const usableW = 0.92 * w;
    const usableH = 0.90 * h;
    while (tries < 20) {
      const hx = halton(seqIdx, 2);
      const hy = halton(seqIdx, 3);
      const x = marginX + hx * usableW;
      const y = marginY + hy * usableH;
      const dist = Math.hypot(x - moonC.x, y - moonC.y);
      if (dist > moonR + 16) return { x, y };
      tries++;
      seqIdx += 491;
    }
    return { x: marginX, y: marginY };
  }

  function positionForEvent(evt, idx, w, h, moonC, moonR) {
    const typeOffset = evt.type === 'msg' ? 0 : evt.type === 'photo' ? 11_000 : 23_000;
    return positionForIndex(typeOffset + idx, w, h, moonC, moonR);
  }

  // ====================================================
  // CLUSTERING · distribución NO uniforme de estrellas
  // (zonas densas + vacíos = parece cielo real, no grid)
  // ====================================================

  // Box-Muller transform → muestra de distribución normal estándar
  function gaussianSample() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  // Genera 3-5 centros de cluster aleatorios + sus "pesos" de densidad
  function makeClusterCenters(num, w, h, padding = 0.05) {
    const centers = [];
    const minX = w * padding, maxX = w * (1 - padding);
    const minY = h * padding, maxY = h * (1 - padding);
    for (let i = 0; i < num; i++) {
      centers.push({
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY),
        weight: 0.6 + Math.random() * 1.4,
      });
    }
    return centers;
  }

  // Devuelve posición clusterizada:
  //  - 75% probabilidad: cerca de un cluster (Gaussian falloff)
  //  - 25% probabilidad: aleatoria (estrellas "sueltas" en zonas vacías)
  function clusteredPosition(centers, w, h, spread, looseProb = 0.25) {
    if (Math.random() < looseProb || centers.length === 0) {
      return { x: Math.random() * w, y: Math.random() * h };
    }
    let totalW = 0;
    for (const c of centers) totalW += c.weight;
    let r = Math.random() * totalW;
    let chosen = centers[0];
    for (const c of centers) {
      r -= c.weight;
      if (r <= 0) { chosen = c; break; }
    }
    let x = chosen.x + gaussianSample() * spread;
    let y = chosen.y + gaussianSample() * spread;
    x = Math.max(0, Math.min(w, x));
    y = Math.max(0, Math.min(h, y));
    return { x, y };
  }

  // Fisher-Yates in-place shuffle (random order each load)
  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const SHUFFLE_KEY = 'ns_photo_shuffle_v1';
  const CURSOR_KEY = 'ns_photo_cursor_v1';

  // ====================================================
  // FORMATEO
  // ====================================================
  function formatDate(date) {
    return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }

  function escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ====================================================
  // EVENTOS
  // ====================================================
  function buildMessageEvents() {
    const today = new Date();
    const daysDone = Math.max(0, Math.floor((today - CALENDAR_START) / 86400000)) + 1;
    const cap = Math.min(daysDone, 365);
    const events = [];
    const dailyMessages = window.messagesModule?.dailyMessages || [];
    for (let i = 0; i < cap; i++) {
      const date = new Date(CALENDAR_START.getTime() + i * 86400000);
      const msg = dailyMessages[i] || '';
      events.push({
        type: 'msg',
        key: `msg_day${i + 1}_${date.toISOString().slice(0, 10)}`,
        date,
        title: `Día ${i + 1}`,
        text: msg ? msg.slice(0, 200) + (msg.length > 200 ? '…' : '') : 'Un mensajito del día.',
        isToday: i === cap - 1,
      });
    }
    return events;
  }

  function buildPhotoEvents() {
    const photos = window.galleryModule?.allItems?.() || [];
    return photos.map((p, idx) => ({
      type: 'photo',
      key: `photo_${p.id || idx}`,
      date: p.date ? new Date(p.date) : (p.created_at ? new Date(p.created_at) : new Date()),
      title: p.place || 'Recuerdo',
      text: p.caption || '',
      image: p.url || p.image || null,
      album: p.album || null,
    }));
  }

  async function buildNoteEvents() {
    const client = window.supabaseClient;
    if (!client) return [];
    try {
      const { data, error } = await client
        .from('notes')
        .select('id, content, category, created_at')
        .order('created_at', { ascending: true });
      if (error) {
        console.warn('[nightsky] error cargando notas:', error.message);
        return [];
      }
      if (!data) return [];
      const labels = { general: '🌸 General', geral: '💗 Geral', zamir: '🖤 Zamir' };
      return data.map((n) => ({
        type: 'note',
        key: `note_${n.id}`,
        date: new Date(n.created_at),
        title: labels[n.category] || 'Notita',
        text: n.content ? n.content.slice(0, 220) + (n.content.length > 220 ? '…' : '') : '',
        category: n.category || 'general',
      }));
    } catch (err) {
      console.warn('[nightsky] notas excepción:', err);
      return [];
    }
  }

  // ====================================================
  // STARS · render + tracking por key para updates parciales
  // ====================================================
  const starByKey = new Map();

  function spawnDecorativeStars(stage, count) {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const fragment = document.createDocumentFragment();

    // 3-5 clusters → zonas densas + espacios vacíos = cielo real, no grid
    const numClusters = 3 + Math.floor(Math.random() * 3);
    const centers = makeClusterCenters(numClusters, w, h, 0.12);
    const spread = Math.min(w, h) * 0.18; // dispersión gaussiana ~18% del lado menor

    // Centro de la luna (para "gravedad lumínica": estrellas cercanas más brillantes)
    const moonX = w / 2, moonY = h / 2;
    const maxDist = Math.sqrt(moonX * moonX + moonY * moonY);

    for (let i = 0; i < count; i++) {
      const star = document.createElement('span');
      star.className = 'ns-star ns-decor';
      // 20% de las decorativas usan forma sparkle (4 puntas) para variedad
      if (Math.random() < 0.2) star.classList.add('ns-sparkle');
      const pos = clusteredPosition(centers, w, h, spread, 0.22);
      star.style.left = `${pos.x}px`;
      star.style.top = `${pos.y}px`;

      // 4 capas de profundidad: micro distantes → grandes cercanas brillantes
      const r = Math.random();
      let size, glow, op, isBlurred = false, isBright = false;
      if (r < 0.55) {
        // Micro lejanas — el "polvo" del cielo
        size = 1.5 + Math.random() * 1.6;
        glow = 1.4;
        op = 0.42 + Math.random() * 0.25;
      } else if (r < 0.82) {
        // Pequeñas — clase media
        size = 3 + Math.random() * 2;
        glow = 2.4;
        op = 0.7 + Math.random() * 0.18;
      } else if (r < 0.95) {
        // Medianas — algunas desenfocadas para sensación de profundidad
        size = 5 + Math.random() * 3;
        glow = 4;
        op = 0.9;
        isBlurred = Math.random() < 0.4;
      } else {
        // Grandes brillantes — muy pocas, como joyas
        size = 8 + Math.random() * 4.5;
        glow = 6.5;
        op = 1;
        isBright = true;
      }

      // GRAVEDAD LUMÍNICA: estrellas más cercanas a la luna brillan un poco más
      const dist = Math.hypot(pos.x - moonX, pos.y - moonY);
      const proximity = Math.max(0, 1 - dist / maxDist); // 1 cerca de luna, 0 en esquinas
      const boost = 0.75 + proximity * 0.45; // 0.75 lejanas, 1.20 muy cercanas
      op = Math.min(1, op * boost);
      glow = glow * (0.85 + proximity * 0.5);

      star.style.setProperty('--ns-size', `${size}px`);
      star.style.setProperty('--ns-glow', `${glow}px`);
      star.style.setProperty('--ns-opacity', `${op}`);
      star.style.setProperty('--ns-rot', `${Math.random() * 360}deg`);
      star.style.setProperty('--ns-delay', `${Math.random() * 1.5}s`);
      star.style.setProperty('--ns-twinkle-dur', `${2.5 + Math.random() * 5}s`);
      star.style.setProperty('--ns-twinkle-delay', `${Math.random() * 3}s`);
      // PERSONALIDAD: cada estrella titila con intensidad propia
      // (algunas casi imperceptibles, otras dramáticas) → cero patrón
      star.style.setProperty('--ns-twinkle-low', `${0.30 + Math.random() * 0.50}`);
      if (isBlurred) star.classList.add('is-blurred');
      if (isBright) star.classList.add('is-bright');
      fragment.appendChild(star);
    }
    stage.appendChild(fragment);
  }

  // ====================================================
  // TINY DOTS · cientos de punticos micro (no clip-path, no animación)
  // Son la mayoría del cielo real. Casi invisibles individualmente, pero
  // en conjunto dan la sensación de "el universo es inmenso y profundo".
  // ====================================================
  function spawnTinyDots(stage, count) {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const moonX = w / 2, moonY = h / 2;
    const maxDist = Math.sqrt(moonX * moonX + moonY * moonY);

    // Mismos clusters que decorativas → coherencia (estrellas grandes y micro
    // comparten zonas densas/vacías).
    const numClusters = 4 + Math.floor(Math.random() * 3);
    const centers = makeClusterCenters(numClusters, w, h, 0.05);
    const spread = Math.min(w, h) * 0.22;

    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.className = 'ns-tiny-dot';
      const pos = clusteredPosition(centers, w, h, spread, 0.35);
      dot.style.left = `${pos.x}px`;
      dot.style.top = `${pos.y}px`;
      const size = 0.6 + Math.random() * 1.3;

      // Proximidad lunar también afecta brillo de los micro dots
      const dist = Math.hypot(pos.x - moonX, pos.y - moonY);
      const proximity = Math.max(0, 1 - dist / maxDist);
      const op = (0.22 + Math.random() * 0.45) * (0.7 + proximity * 0.55);

      dot.style.setProperty('--td-size', `${size}px`);
      dot.style.setProperty('--td-op', `${Math.min(0.95, op)}`);
      frag.appendChild(dot);
    }
    stage.appendChild(frag);
  }

  // ====================================================
  // MILKY WAY PROCEDURAL · banda diagonal de micro estrellas
  // Construida con ~120 punticos distribuidos en una banda con falloff
  // gaussiano perpendicular al eje. Sin imagen, sin texturas.
  // ====================================================
  function spawnMilkyWay(stage, count) {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    // Banda diagonal: de (0, h*0.82) a (w, h*0.18) → ángulo ≈ -34°
    const startX = 0, startY = h * 0.82;
    const endX = w,  endY = h * 0.18;
    const dx = endX - startX, dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const perpX = -dy / length, perpY = dx / length; // perpendicular unitario
    const bandSpread = h * 0.16; // grosor gaussiano de la banda

    const frag = document.createDocumentFragment();
    let made = 0, tries = 0;
    while (made < count && tries < count * 3) {
      tries++;
      const t = Math.random();
      const cx = startX + dx * t;
      const cy = startY + dy * t;
      const offset = gaussianSample() * bandSpread;
      const x = cx + perpX * offset;
      const y = cy + perpY * offset;
      if (x < -2 || x > w + 2 || y < -2 || y > h + 2) continue;
      const dot = document.createElement('span');
      dot.className = 'ns-tiny-dot ns-mw';
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      const size = 0.5 + Math.random() * 1.1;
      const op = 0.26 + Math.random() * 0.42;
      dot.style.setProperty('--td-size', `${size}px`);
      dot.style.setProperty('--td-op', `${op}`);
      frag.appendChild(dot);
      made++;
    }
    stage.appendChild(frag);
  }

  // Starfield de FONDO DE SECCIÓN — el cielo se extiende más allá del stage.
  // Estrellas más pequeñas y dispersas que las del stage, dan sensación de
  // "el universo continúa fuera del recuadro".
  function spawnBackgroundStars(section) {
    // Evita duplicados si re-render
    const existing = section.querySelector('.ns-bg-stars');
    if (existing) existing.remove();

    const layer = document.createElement('div');
    layer.className = 'ns-bg-stars';
    layer.setAttribute('aria-hidden', 'true');

    const isMobile = window.innerWidth < 760;
    const count = isMobile ? 20 : 50;
    const frag = document.createDocumentFragment();

    // Clusters EN PORCENTAJES sobre la sección entera (no necesitamos px reales)
    const numClusters = 4 + Math.floor(Math.random() * 3);
    const centers = makeClusterCenters(numClusters, 100, 100, 0.05);
    const spread = 14; // ~14% del ancho/alto de la sección

    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'ns-bg-star';
      const pos = clusteredPosition(centers, 100, 100, spread, 0.28);
      s.style.left = `${pos.x}%`;
      s.style.top = `${pos.y}%`;

      const r = Math.random();
      if (r < 0.7) {
        // Distantes (la mayoría) — micro puntos casi invisibles
        s.style.setProperty('--bs-size', `${0.7 + Math.random() * 1.1}px`);
        s.style.setProperty('--bs-op', `${0.32 + Math.random() * 0.32}`);
      } else if (r < 0.94) {
        // Intermedias — visibles pero discretas
        s.style.setProperty('--bs-size', `${1.4 + Math.random() * 1.2}px`);
        s.style.setProperty('--bs-op', `${0.55 + Math.random() * 0.3}`);
      } else {
        // Joyas raras del fondo
        s.style.setProperty('--bs-size', `${2.4 + Math.random() * 1.6}px`);
        s.style.setProperty('--bs-op', `0.92`);
        s.classList.add('is-bright');
      }
      s.style.setProperty('--bs-twinkle-dur', `${3 + Math.random() * 5}s`);
      s.style.setProperty('--bs-twinkle-delay', `${Math.random() * 4}s`);
      frag.appendChild(s);
    }
    layer.appendChild(frag);
    section.appendChild(layer);
  }

  // Estrellas fugaces — RARAS y mágicas. Antes cada 18-40s (predecible).
  // Ahora cada 1.5-4 min, con 30% probabilidad de NO aparecer en ese ciclo →
  // jamás predecible, cuando ocurre realmente sorprende.
  let shootingStarTimer = null;
  function scheduleShootingStar(stage) {
    if (shootingStarTimer) clearTimeout(shootingStarTimer);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const delay = 90000 + Math.random() * 150000; // 1.5 - 4 min
    shootingStarTimer = setTimeout(() => {
      if (document.contains(stage) && Math.random() < 0.7) spawnShootingStar(stage);
      scheduleShootingStar(stage);
    }, delay);
  }

  // HISTORIAS ESTELARES · cada ~30-50s, 50% probabilidad, 3 estrellas
  // decorativas cercanas hacen un destello en cascada (200ms entre cada una).
  // No son animaciones permanentes — son momentos.
  let starStoryTimer = null;
  function scheduleStarStory(section, stage) {
    if (starStoryTimer) clearTimeout(starStoryTimer);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const delay = 30000 + Math.random() * 20000; // 30 - 50s
    starStoryTimer = setTimeout(() => {
      if (Math.random() < 0.5 && document.contains(stage)) {
        triggerStarStory(stage);
      }
      scheduleStarStory(section, stage);
    }, delay);
  }

  function triggerStarStory(stage) {
    const decor = Array.from(stage.querySelectorAll('.ns-star.ns-decor:not(.is-blurred)'));
    if (decor.length < 3) return;
    const start = decor[Math.floor(Math.random() * decor.length)];
    const sx = parseFloat(start.style.left), sy = parseFloat(start.style.top);
    if (isNaN(sx) || isNaN(sy)) return;
    const neighbors = decor
      .filter(s => s !== start)
      .map(s => {
        const x = parseFloat(s.style.left), y = parseFloat(s.style.top);
        return { el: s, d: Math.hypot(x - sx, y - sy) };
      })
      .filter(n => !isNaN(n.d))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    const chain = [start, ...neighbors.map(n => n.el)];
    chain.forEach((el, idx) => {
      setTimeout(() => {
        el.classList.add('is-story-flash');
        setTimeout(() => el.classList.remove('is-story-flash'), 1100);
      }, idx * 230);
    });
  }

  // ORBES DE PROFUNDIDAD · 3 esferas enormes desenfocadas en primer plano.
  // Casi invisibles. Dan sensación de que hay luces muy cercanas al observador.
  function spawnDepthOrbs(stage, count) {
    for (let i = 0; i < count; i++) {
      const orb = document.createElement('div');
      orb.className = 'ns-depth-orb';
      orb.style.left = `${18 + Math.random() * 64}%`;
      orb.style.top = `${18 + Math.random() * 64}%`;
      const size = 70 + Math.random() * 90;
      orb.style.setProperty('--or-size', `${size}px`);
      orb.style.setProperty('--or-op', `${0.03 + Math.random() * 0.05}`);
      // Tinte aleatorio: 50% cremoso, 30% lila, 20% azul
      const r = Math.random();
      if (r < 0.3) orb.classList.add('tint-lila');
      else if (r < 0.5) orb.classList.add('tint-azul');
      stage.appendChild(orb);
    }
  }

  // MODO CONTEMPLACIÓN · después de N segundos sin actividad, la UI baja
  // opacidad y el universo queda como protagonista absoluto.
  // Cualquier interacción la restaura suavemente.
  const CONTEMPLATION_IDLE_MS = 22000;
  let contemplationTimer = null;
  let contemplationBound = false;
  function setupContemplationMode(section) {
    if (contemplationBound) return; // solo una vez por sesión
    contemplationBound = true;
    const reset = () => {
      section.classList.remove('is-contemplating');
      clearTimeout(contemplationTimer);
      contemplationTimer = setTimeout(() => {
        section.classList.add('is-contemplating');
      }, CONTEMPLATION_IDLE_MS);
    };
    ['mousemove', 'mousedown', 'touchstart', 'keydown', 'wheel'].forEach((evt) => {
      window.addEventListener(evt, reset, { passive: true });
    });
    reset();
  }

  function spawnShootingStar(stage) {
    if (document.hidden) return; // no animar si la pestaña está oculta
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const star = document.createElement('div');
    star.className = 'ns-shooting-star';
    // Arranca en zona top-left → cruza hacia bottom-right (ángulo 25-45°)
    const startX = Math.random() * w * 0.35;
    const startY = Math.random() * h * 0.35;
    const angleDeg = 25 + Math.random() * 25;
    const angleRad = angleDeg * Math.PI / 180;
    const distance = Math.min(w, h) * (0.75 + Math.random() * 0.3);
    const endDx = Math.cos(angleRad) * distance;
    const endDy = Math.sin(angleRad) * distance;
    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;
    star.style.setProperty('--ss-end-x', `${endDx}px`);
    star.style.setProperty('--ss-end-y', `${endDy}px`);
    star.style.setProperty('--ss-rot', `${angleDeg}deg`);
    stage.appendChild(star);
    setTimeout(() => { try { star.remove(); } catch (_) {} }, 2200);
  }

  // Partículas de polvo cósmico — siempre derivando, casi imperceptibles
  function spawnParticles(stage, count) {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'ns-particle';
      p.style.left = `${Math.random() * w}px`;
      p.style.top = `${Math.random() * h}px`;
      const size = 1 + Math.random() * 2.4;
      p.style.setProperty('--p-size', `${size}px`);
      p.style.setProperty('--p-opacity', `${0.14 + Math.random() * 0.32}`);
      p.style.setProperty('--p-duration', `${28 + Math.random() * 32}s`);
      p.style.setProperty('--p-delay', `${-Math.random() * 30}s`); // negativo: arranca en distintos puntos del loop
      p.style.setProperty('--p-drift-x', `${(Math.random() - 0.5) * 50}px`);
      p.style.setProperty('--p-drift-y', `${-30 - Math.random() * 80}px`);
      fragment.appendChild(p);
    }
    stage.appendChild(fragment);
  }

  function renderEventStars(stage, events, moonCenter, moonR, tooltip) {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const fragment = document.createDocumentFragment();
    starByKey.clear();

    events.forEach((evt, idx) => {
      const { x, y } = positionForEvent(evt, idx, w, h, moonCenter, moonR);
      const star = document.createElement('button');
      star.type = 'button';
      star.className = `ns-star ns-star-${evt.type}`;
      if (evt.isToday) star.classList.add('is-today');
      star.style.left = `${x}px`;
      star.style.top = `${y}px`;
      star.dataset.key = evt.key;
      star.dataset.x = x;
      star.dataset.y = y;

      const rotSeed = Math.floor(halton(idx, 5) * 360);
      star.style.setProperty('--ns-rot', `${rotSeed}deg`);

      const jitter = 0.85 + halton(idx, 7) * 0.3;
      const sizeBase = evt.type === 'msg' ? 11 : evt.type === 'photo' ? 26 : 15;
      star.style.setProperty('--ns-size', `${sizeBase * jitter}px`);

      if (evt.type === 'photo' && evt.image) {
        star.classList.add('has-image');
        star.style.setProperty('--ns-photo-url', `url("${evt.image}")`);
      }

      star.style.setProperty('--ns-delay', `${0.25 + Math.min(idx * 0.006, 1.8)}s`);
      star.style.setProperty('--ns-twinkle-dur', `${2.8 + halton(idx, 11) * 4}s`);
      star.style.setProperty('--ns-twinkle-delay', `${halton(idx, 13) * 3}s`);

      star.setAttribute('aria-label',
        `${evt.type === 'msg' ? 'Mensajito' : evt.type === 'photo' ? 'Foto' : 'Nota'}: ${evt.title}`);
      star.addEventListener('click', (e) => {
        e.stopPropagation();
        // Secuencia mágica: estrella → rayo → luna → recuerdo
        const stageEl = star.closest('.night-sky-stage');
        if (stageEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          playStarToMoonRay(stageEl, star).then(() => openTooltip(tooltip, evt, star));
        } else {
          openTooltip(tooltip, evt, star);
        }
      });
      fragment.appendChild(star);
      starByKey.set(evt.key, star);
    });
    stage.appendChild(fragment);
  }

  let currentActiveStar = null;
  let activeHaloEl = null;
  let activeConstellationLines = [];
  let activeOrbitParticles = [];

  function clearActiveOrbitParticles() {
    activeOrbitParticles.forEach((p) => {
      p.classList.add('is-fading');
      setTimeout(() => { try { p.remove(); } catch (_) {} }, 600);
    });
    activeOrbitParticles = [];
  }

  function spawnActiveOrbitParticles(stage, x, y) {
    const count = 3;
    for (let i = 0; i < count; i++) {
      const wrap = document.createElement('span');
      wrap.className = 'ns-active-particle';
      wrap.style.left = `${x}px`;
      wrap.style.top = `${y}px`;
      // Cada partícula orbita con radio, duración y delay diferentes
      const radius = 26 + Math.random() * 22;
      const duration = 5.5 + Math.random() * 3.5;
      const delay = -Math.random() * duration; // negativo: arranca dispersas
      const direction = Math.random() < 0.5 ? 'normal' : 'reverse';
      wrap.style.setProperty('--ap-radius', `${radius}px`);
      wrap.style.setProperty('--ap-duration', `${duration}s`);
      wrap.style.setProperty('--ap-delay', `${delay}s`);
      wrap.style.setProperty('--ap-direction', direction);
      wrap.style.animationDirection = direction;
      stage.appendChild(wrap);
      activeOrbitParticles.push(wrap);
    }
  }

  function clearConstellation() {
    activeConstellationLines.forEach((line) => {
      line.classList.add('is-fading');
      setTimeout(() => { try { line.remove(); } catch (_) {} }, 600);
    });
    activeConstellationLines = [];
  }

  function drawConstellationFor(activeStar, stage) {
    const ax = parseFloat(activeStar.dataset.x);
    const ay = parseFloat(activeStar.dataset.y);
    if (isNaN(ax) || isNaN(ay)) return;
    // Recolecta estrellas de evento (no decorativas) más cercanas
    const candidates = [];
    starByKey.forEach((star) => {
      if (star === activeStar) return;
      const sx = parseFloat(star.dataset.x);
      const sy = parseFloat(star.dataset.y);
      if (isNaN(sx) || isNaN(sy)) return;
      const d = Math.hypot(sx - ax, sy - ay);
      candidates.push({ sx, sy, d });
    });
    candidates.sort((a, b) => a.d - b.d);
    const linksCount = Math.min(3, candidates.length);
    for (let i = 0; i < linksCount; i++) {
      const { sx, sy } = candidates[i];
      const length = Math.hypot(sx - ax, sy - ay);
      const angle = Math.atan2(sy - ay, sx - ax) * 180 / Math.PI;
      const line = document.createElement('div');
      line.className = 'ns-constellation-line';
      line.style.left = `${ax}px`;
      line.style.top = `${ay}px`;
      line.style.width = `${length}px`;
      line.style.setProperty('--ns-line-angle', `${angle}deg`);
      line.style.animationDelay = `${i * 0.15}s`;
      stage.appendChild(line);
      activeConstellationLines.push(line);
    }
  }

  function setActiveStar(key) {
    // Fade-out de la estrella anterior
    if (currentActiveStar) {
      currentActiveStar.classList.remove('is-active-now');
      currentActiveStar = null;
    }
    if (activeHaloEl) {
      const old = activeHaloEl;
      old.classList.add('is-fading');
      setTimeout(() => { try { old.remove(); } catch (_) {} }, 800);
      activeHaloEl = null;
    }
    clearConstellation();
    clearActiveOrbitParticles();

    if (!key) return;
    const star = starByKey.get(key);
    if (!star) return;
    star.classList.add('is-active-now');
    currentActiveStar = star;

    const stage = star.closest('.night-sky-stage');
    if (stage) {
      // ORQUESTACIÓN DEL UNIVERSO: cuando aparece una foto, el cielo entero
      // responde. Otras estrellas-evento bajan brillo, la luna sube un poco,
      // y SOLO ENTONCES la estrella activa toma el centro emocional.
      stage.classList.add('is-orchestrating');
      starByKey.forEach((other) => {
        if (other !== star) other.classList.add('is-dimmed');
      });
      const moonEl = stage.querySelector('.ns-moon');
      if (moonEl) moonEl.classList.add('is-boosted');
      setTimeout(() => {
        stage.classList.remove('is-orchestrating');
        starByKey.forEach((other) => other.classList.remove('is-dimmed'));
        if (moonEl) moonEl.classList.remove('is-boosted');
      }, 1600);

      // Halo de luz emanante
      const x = parseFloat(star.dataset.x);
      const y = parseFloat(star.dataset.y);
      if (!isNaN(x) && !isNaN(y)) {
        const halo = document.createElement('div');
        halo.className = 'ns-active-halo';
        halo.style.left = `${x}px`;
        halo.style.top = `${y}px`;
        stage.appendChild(halo);
        activeHaloEl = halo;
        // Partículas orbitando — chispas que giran lento alrededor del recuerdo
        spawnActiveOrbitParticles(stage, x, y);
        setTimeout(() => {
          if (currentActiveStar === star) drawConstellationFor(star, stage);
        }, 250);
      }
    }
  }

  // ====================================================
  // TOOLTIP
  // ====================================================
  function openTooltip(tooltip, evt, anchor) {
    const body = tooltip.querySelector('.ns-tooltip-body');
    const typeLabel = evt.type === 'msg' ? 'Mensajito del día'
                    : evt.type === 'photo' ? 'Foto del recuerdo'
                    : 'Nota guardada';
    let html = `<div class="ns-tooltip-eyebrow">${typeLabel}</div>`;
    if (evt.type === 'photo' && evt.image) {
      const moonOnThatDay = getMoonPhase(evt.date);
      const moonName = getMoonPhaseName(moonOnThatDay);
      html += `
        <div class="ns-tt-photo-frame">
          <img class="ns-tt-photo" src="${evt.image}" alt="${escapeHTML(evt.title)}" loading="lazy" />
          <div class="ns-tt-mini-moon" aria-label="Luna del ${formatDate(evt.date)}: ${moonName}">
            ${buildMoonSVG(moonOnThatDay, { size: 56, idSuffix: '-tt' })}
            <span class="ns-tt-mini-moon-label">${moonName}</span>
          </div>
        </div>
      `;
    }
    html += `<h3 class="ns-tooltip-title">${escapeHTML(evt.title)}</h3>`;
    html += `<p class="ns-tooltip-meta">${formatDate(evt.date)}${evt.isToday ? ' · hoy' : ''}</p>`;
    if (evt.type === 'photo') {
      const moonName = getMoonPhaseName(getMoonPhase(evt.date));
      html += `<p class="ns-tt-moon-note">Esa noche había <strong>${moonName.toLowerCase()}</strong> en el cielo 🌙</p>`;
    }
    if (evt.text) html += `<p class="ns-tooltip-text">${escapeHTML(evt.text)}</p>`;
    body.innerHTML = html;
    const rect = anchor.getBoundingClientRect();
    tooltip.classList.remove('hidden');
    tooltip.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      const ttRect = tooltip.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      let left = rect.left + rect.width / 2 - ttRect.width / 2;
      let top = rect.top - ttRect.height - 14;
      if (top < 12) top = rect.bottom + 14;
      if (top + ttRect.height > vh - 12) top = Math.max(12, vh - ttRect.height - 12);
      if (left < 12) left = 12;
      if (left + ttRect.width > vw - 12) left = vw - ttRect.width - 12;
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    });
  }

  function closeTooltip(tooltip) {
    tooltip.classList.add('hidden');
    tooltip.setAttribute('aria-hidden', 'true');
  }

  // ====================================================
  // STATS · ahora son TAMBIÉN filtros (clickables)
  // ====================================================
  function renderStats(container, counts, phase, stage) {
    container.innerHTML = `
      <button type="button" class="ns-stat ns-stat-filter is-active" data-filter="all" aria-pressed="true" aria-label="Mostrar todo">
        <span class="ns-stat-icon" aria-hidden="true">✨</span><span class="ns-stat-count">${counts.msg + counts.photo + counts.note}</span><span>todo</span>
      </button>
      <button type="button" class="ns-stat ns-stat-filter" data-filter="msg" aria-pressed="false" aria-label="Mostrar solo mensajitos">
        <span class="ns-stat-dot msg"></span><span class="ns-stat-count">${counts.msg}</span><span>mensajitos</span>
      </button>
      <button type="button" class="ns-stat ns-stat-filter" data-filter="photo" aria-pressed="false" aria-label="Mostrar solo fotos">
        <span class="ns-stat-dot photo"></span><span class="ns-stat-count">${counts.photo}</span><span>fotos</span>
      </button>
      <button type="button" class="ns-stat ns-stat-filter" data-filter="note" aria-pressed="false" aria-label="Mostrar solo notas">
        <span class="ns-stat-dot note"></span><span class="ns-stat-count">${counts.note}</span><span>notas</span>
      </button>
    `;

    // Bind de filtros
    container.querySelectorAll('.ns-stat-filter').forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        container.querySelectorAll('.ns-stat-filter').forEach((b) => {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        applyStarFilter(stage, filter);
      });
    });
  }

  // Aplica el filtro a las estrellas: anima las que se quedan, desvanece las otras
  function applyStarFilter(stage, filter) {
    if (!stage) return;
    stage.dataset.filter = filter;
    const stars = stage.querySelectorAll('.ns-star');
    stars.forEach((star) => {
      const isEvent = !star.classList.contains('ns-decor');
      if (!isEvent) return; // decorativas siempre visibles
      const matchesFilter = filter === 'all'
        || (filter === 'msg' && star.classList.contains('ns-star-msg'))
        || (filter === 'photo' && star.classList.contains('ns-star-photo'))
        || (filter === 'note' && star.classList.contains('ns-star-note'));
      star.classList.toggle('is-filtered-out', !matchesFilter);
      star.classList.toggle('is-filter-highlight', filter !== 'all' && matchesFilter);
    });
  }

  // Actualiza el chip lunar que vive DENTRO del slot (no en stats)
  function updatePhaseChip(slot, phase, isFromPhoto) {
    if (!slot) return;
    const chip = slot.querySelector('[data-role="phase-chip"]');
    if (!chip) return;
    const illum = Math.round(getMoonIllumination(phase) * 100);
    const icon = chip.querySelector('.ns-stat-moon-icon');
    const text = chip.querySelector('.ns-stat-moon-text');
    if (icon) icon.innerHTML = buildMoonSVG(phase, { size: 20, idSuffix: '-ps' });
    if (text) text.textContent = `${getMoonPhaseName(phase)} · ${illum}%${isFromPhoto ? ' · ese día' : ''}`;
    chip.dataset.fromPhoto = isFromPhoto ? 'true' : 'false';
  }

  // ====================================================
  // LUNA CROSSFADE · dos SVGs apilados, transición suave
  // ====================================================
  function createMoonStack(stage, initialPhase) {
    // Genera dos divs apilados con la luna; el "front" es el visible, el "back" se prepara y luego hace fade
    const wrap = document.createElement('div');
    wrap.className = 'ns-moon';
    wrap.dataset.phase = initialPhase.toFixed(4);
    wrap.innerHTML = `
      <div class="ns-moon-layer is-front">${buildMoonSVG(initialPhase, { idSuffix: '-l1' })}</div>
      <div class="ns-moon-layer"          >${buildMoonSVG(initialPhase, { idSuffix: '-l2' })}</div>
    `;
    stage.appendChild(wrap);

    // El label poético VIVE EN EL SLOT, no debajo de la luna (era duplicado).
    // Mantenemos un label nulo por compatibilidad.
    const labelEl = null;

    return {
      wrap,
      label: labelEl,
      currentLayer: 0,
      currentPhase: initialPhase,
      currentDisplayPhase: initialPhase, // fase que realmente está pintada
      morphRaf: null,
    };
  }

  // MORPH real: en lugar de crossfade entre 2 lunas estáticas, redibujamos
  // el SVG por frames intermedios → el terminador se ve "rellenando" la luna
  // como en time-lapse. ~14fps × 1.8s = ~25 frames, suficiente para fluido.
  function transitionMoonTo(moonStack, newPhase) {
    if (Math.abs(newPhase - moonStack.currentPhase) < 0.00001) return;

    // Cancela cualquier morph anterior en curso
    if (moonStack.morphRaf) {
      cancelAnimationFrame(moonStack.morphRaf);
      moonStack.morphRaf = null;
    }

    // Reduce-motion: cambio instantáneo
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const layers0 = moonStack.wrap.querySelectorAll('.ns-moon-layer');
      const a0 = layers0[moonStack.currentLayer];
      a0.innerHTML = buildMoonSVG(newPhase, { idSuffix: `-i${Date.now()}` });
      moonStack.currentPhase = newPhase;
      moonStack.currentDisplayPhase = newPhase;
      moonStack.wrap.dataset.phase = newPhase.toFixed(4);
      return;
    }

    // Punto de partida: la fase mostrada actualmente (que puede ser intermedia
    // si un morph anterior fue cancelado a la mitad)
    const oldPhase = (typeof moonStack.currentDisplayPhase === 'number')
      ? moonStack.currentDisplayPhase
      : moonStack.currentPhase;

    // Ruta más corta del ciclo (no atravesar la luna nueva al revés)
    let delta = newPhase - oldPhase;
    if (delta > 0.5) delta -= 1;
    else if (delta < -0.5) delta += 1;

    const TOTAL_MS = 1800;
    const FRAME_MS = 70; // ~14fps · SVG morph no necesita 60fps
    const startTime = performance.now();
    const layers = moonStack.wrap.querySelectorAll('.ns-moon-layer');
    const active = layers[moonStack.currentLayer];
    const other = layers[1 - moonStack.currentLayer];

    // Aseguramos que SOLO el active esté visible. Sin transition CSS porque
    // ahora controlamos el morph nosotros — no queremos opacity crossfade.
    active.style.transition = 'none';
    other.style.transition = 'none';
    other.classList.remove('is-front');
    active.classList.add('is-front');
    void active.offsetWidth;

    let lastUpdate = 0;
    function frame(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / TOTAL_MS, 1);
      if (now - lastUpdate >= FRAME_MS || t === 1) {
        lastUpdate = now;
        // Easing sigmoidal (smooth in-out)
        const eased = 0.5 - Math.cos(Math.PI * t) / 2;
        let p = oldPhase + delta * eased;
        if (p < 0) p += 1;
        if (p > 1) p -= 1;
        active.innerHTML = buildMoonSVG(p, { idSuffix: `-m${Math.floor(now)}` });
        moonStack.currentDisplayPhase = p;
      }
      if (t < 1) {
        moonStack.morphRaf = requestAnimationFrame(frame);
      } else {
        moonStack.morphRaf = null;
        moonStack.currentDisplayPhase = newPhase;
        // Restaurar transiciones para hover/otros efectos
        setTimeout(() => {
          active.style.transition = '';
          other.style.transition = '';
        }, 120);
      }
    }

    moonStack.morphRaf = requestAnimationFrame(frame);
    moonStack.currentPhase = newPhase;
    moonStack.wrap.dataset.phase = newPhase.toFixed(4);
  }

  // ====================================================
  // RAY · cuando tocas una estrella, sale un rayo hacia la luna
  // ====================================================
  function playStarToMoonRay(stage, star) {
    return new Promise((resolve) => {
      const moonEl = stage.querySelector('.ns-moon');
      if (!moonEl) { resolve(); return; }
      const stageRect = stage.getBoundingClientRect();
      const sr = star.getBoundingClientRect();
      const mr = moonEl.getBoundingClientRect();
      const sx = sr.left + sr.width / 2 - stageRect.left;
      const sy = sr.top + sr.height / 2 - stageRect.top;
      const mx = mr.left + mr.width / 2 - stageRect.left;
      const my = mr.top + mr.height / 2 - stageRect.top;
      const dx = mx - sx, dy = my - sy;
      const length = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;

      const ray = document.createElement('div');
      ray.className = 'ns-star-ray';
      ray.style.left = `${sx}px`;
      ray.style.top = `${sy}px`;
      ray.style.width = `${length}px`;
      ray.style.transform = `translateY(-50%) rotate(${angle}deg)`;
      stage.appendChild(ray);

      // pequeño "respiro" inicial para que el ojo registre la salida
      star.classList.add('is-tap-burst');

      // El rayo viaja ~520ms → cuando llega, pulso lunar
      setTimeout(() => {
        moonEl.classList.add('is-pulse');
        ray.classList.add('is-arrived');
      }, 520);

      setTimeout(() => {
        ray.remove();
        moonEl.classList.remove('is-pulse');
        star.classList.remove('is-tap-burst');
        resolve();
      }, 900);
    });
  }

  // ====================================================
  // PHOTO SLOT · vive fuera del stage, en .ns-photo-slot-anchor
  // ====================================================
  function createPhotoSlot(anchor, stage, statsBox, moonStack) {
    if (!anchor) return null;
    // Limpia anchor
    anchor.innerHTML = '';

    const slot = document.createElement('div');
    slot.className = 'ns-photo-slot';
    slot.setAttribute('role', 'region');
    slot.setAttribute('aria-label', 'Recuerdo del momento');
    slot.setAttribute('aria-live', 'polite');
    slot.dataset.state = 'idle';
    slot.innerHTML = `
      <div class="ns-photo-slot-frame">
        <img class="ns-photo-slot-img is-active" alt="" loading="lazy" decoding="async" />
        <img class="ns-photo-slot-img" alt="" loading="lazy" decoding="async" />
        <div class="ns-photo-slot-fallback" hidden>
          <span class="ns-photo-slot-fallback-emoji">💔</span>
          <span class="ns-photo-slot-fallback-text">Foto no disponible</span>
        </div>
        <div class="ns-photo-slot-progress"><span></span></div>
      </div>
      <figcaption class="ns-photo-slot-meta">
        <span class="ns-photo-slot-date">—</span>
        <span class="ns-photo-slot-poetry">—</span>
      </figcaption>
      <div class="ns-photo-slot-controls">
        <button type="button" class="ns-ps-btn" data-action="prev" aria-label="Foto anterior" title="Anterior">‹</button>
        <button type="button" class="ns-ps-btn" data-action="pause" aria-label="Pausar" aria-pressed="false" title="Pausar">⏸</button>
        <button type="button" class="ns-ps-btn" data-action="next" aria-label="Foto siguiente" title="Siguiente">›</button>
      </div>
      <div class="ns-photo-slot-moon" data-role="phase-chip" aria-hidden="false">
        <span class="ns-stat-moon-icon"></span>
        <span class="ns-stat-moon-text">—</span>
      </div>
    `;
    anchor.appendChild(slot);

    // Inicializa el chip con la fase del día actual (no de la primera foto)
    updatePhaseChip(slot, getMoonPhase(new Date()), false);

    const imgs = slot.querySelectorAll('.ns-photo-slot-img');
    const dateEl = slot.querySelector('.ns-photo-slot-date');
    const poetEl = slot.querySelector('.ns-photo-slot-poetry');
    const fallbk = slot.querySelector('.ns-photo-slot-fallback');
    const prog = slot.querySelector('.ns-photo-slot-progress > span');

    let photos = sanitizePhotos(buildPhotoEvents());
    let idx = 0;
    // Avanzar al siguiente de la última visita (cursor persistente entre pestañas)
    const c = parseInt(Storage.get(CURSOR_KEY) || '-1', 10);
    if (!isNaN(c) && c >= 0 && photos.length > 0) {
      idx = (c + 1) % photos.length;
    }
    let activeLayer = 0;
    let timer = null;
    let loadTimer = null;
    let paused = false;
    let userPaused = false;
    let brokenKeys = new Set();

    function sanitizePhotos(list) {
      const clean = list.filter(p => p && p.image && typeof p.image === 'string'
        && p.image.length > 4 && p.date instanceof Date && !isNaN(p.date));

      // Intentar reusar orden previo (localStorage → sobrevive entre pestañas)
      const saved = Storage.get(SHUFFLE_KEY);
      if (saved) {
        try {
          const keys = JSON.parse(saved);
          const cleanKeySet = new Set(clean.map(p => p.key));
          if (Array.isArray(keys) && keys.length === clean.length
              && keys.every(k => cleanKeySet.has(k))) {
            const byKey = new Map(clean.map(p => [p.key, p]));
            return keys.map(k => byKey.get(k));
          }
        } catch (_) { /* ignore */ }
      }

      // Shuffle nuevo y guardar
      shuffleInPlace(clean);
      Storage.set(SHUFFLE_KEY, JSON.stringify(clean.map(p => p.key)));
      return clean;
    }

    function renderEmpty() {
      slot.dataset.state = 'empty';
      slot.querySelectorAll('.ns-photo-slot-img').forEach((im) => {
        im.removeAttribute('src');
        im.classList.remove('is-active');
      });
      fallbk.hidden = false;
      fallbk.querySelector('.ns-photo-slot-fallback-text').textContent = 'Aún no hay recuerdos en el cielo';
      dateEl.textContent = '—';
      const todayPhase = getMoonPhase(new Date());
      poetEl.textContent = getMoonPoetry(todayPhase);
      updatePhaseChip(slot, todayPhase, false);
      clearTimeout(timer);
      setActiveStar(null);
    }

    function showPhoto(targetIdx) {
      if (!photos.length) { renderEmpty(); return; }
      const len = photos.length;
      const safeIdx = ((targetIdx % len) + len) % len;
      const photo = photos[safeIdx];
      idx = safeIdx;
      Storage.set(CURSOR_KEY, String(idx));

      // Si ya sabemos que está rota, skip a la siguiente
      if (brokenKeys.has(photo.key) && photos.length > brokenKeys.size) {
        showPhoto(targetIdx + 1);
        return;
      }

      slot.dataset.state = paused ? 'paused' : 'playing';
      fallbk.hidden = true;

      const nextLayer = 1 - activeLayer;
      const nextImg = imgs[nextLayer];

      clearTimeout(loadTimer);

      const cleanup = () => {
        nextImg.onload = null;
        nextImg.onerror = null;
        clearTimeout(loadTimer);
      };

      const onLoad = () => {
        cleanup();
        fallbk.hidden = true;
        imgs[activeLayer].classList.remove('is-active');
        nextImg.classList.add('is-active');
        activeLayer = nextLayer;
        // Sincronizar luna del stage + chip del slot + estrella activa
        const photoPhase = getMoonPhase(photo.date);
        transitionMoonTo(moonStack, photoPhase);
        updatePhaseChip(slot, photoPhase, true);
        setActiveStar(photo.key);
        stage.dataset.slotActive = 'true';
        window.dispatchEvent(new CustomEvent('nightsky:phaseFromPhoto', {
          detail: { phase: photoPhase, photo, isLive: false }
        }));
      };

      const onError = () => {
        cleanup();
        brokenKeys.add(photo.key);
        console.warn('[nightsky] foto no carga:', photo.title, photo.image);
        // Si quedan más fotos sanas, skip
        if (brokenKeys.size < photos.length) {
          setTimeout(() => showPhoto(idx + 1), 80);
        } else {
          // Todas rotas
          slot.dataset.state = 'broken';
          fallbk.hidden = false;
          fallbk.querySelector('.ns-photo-slot-fallback-text').textContent = 'Foto no disponible';
        }
      };

      nextImg.onload = onLoad;
      nextImg.onerror = onError;
      nextImg.alt = photo.title || 'Recuerdo nuestro';
      nextImg.src = photo.image;

      // Timeout para fotos que no terminan de cargar
      loadTimer = setTimeout(() => {
        if (!nextImg.complete || nextImg.naturalWidth === 0) onError();
      }, IMAGE_TIMEOUT_MS);

      // Mientras carga, actualiza meta
      dateEl.textContent = formatDate(photo.date);
      poetEl.textContent = getMoonPoetry(getMoonPhase(photo.date));

      // Reinicia barra de progreso
      if (prog) {
        prog.style.animation = 'none';
        void prog.offsetWidth;
        prog.style.animation = '';
      }
    }

    function scheduleNext() {
      clearTimeout(timer);
      if (paused || photos.length < 2) return;
      timer = setTimeout(() => {
        showPhoto(idx + 1);
        scheduleNext();
      }, SLOT_INTERVAL_MS);
    }

    function pause(byUser = false) {
      if (byUser) userPaused = true;
      paused = true;
      slot.dataset.state = 'paused';
      clearTimeout(timer);
    }

    function resume(byUser = false) {
      if (byUser) userPaused = false;
      if (userPaused) return;
      paused = false;
      slot.dataset.state = photos.length > 1 ? 'playing' : 'idle';
      scheduleNext();
    }

    slot.addEventListener('click', (e) => {
      const a = e.target.closest('[data-action]');
      if (!a) return;
      if (a.dataset.action === 'next') { showPhoto(idx + 1); scheduleNext(); }
      else if (a.dataset.action === 'prev') { showPhoto(idx - 1); scheduleNext(); }
      else if (a.dataset.action === 'pause') {
        if (paused && userPaused) {
          resume(true);
          a.setAttribute('aria-pressed', 'false');
          a.textContent = '⏸';
          a.setAttribute('aria-label', 'Pausar');
        } else {
          pause(true);
          a.setAttribute('aria-pressed', 'true');
          a.textContent = '▶';
          a.setAttribute('aria-label', 'Continuar');
        }
      }
    });

    slot.addEventListener('mouseenter', () => { if (!userPaused) pause(false); });
    slot.addEventListener('mouseleave', () => { if (!userPaused) resume(false); });
    slot.addEventListener('focusin', () => { if (!userPaused) pause(false); });
    slot.addEventListener('focusout', (e) => {
      if (!slot.contains(e.relatedTarget) && !userPaused) resume(false);
    });

    let io = null;
    try {
      io = new IntersectionObserver(([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting && !userPaused) resume(false);
        else pause(false);
      }, { threshold: 0.1 });
      io.observe(slot);
    } catch (_) {}

    const visibilityHandler = () => {
      if (document.hidden) clearTimeout(timer);
      else if (!userPaused) scheduleNext();
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    // Firma de las fotos actuales: si no cambia, no reseteamos nada al recibir
    // un evento de galería (algunas pestañas re-emiten estos eventos al volver
    // al foco aunque los datos sean los mismos).
    let lastSlotPhotoSig = photos.map(p => p.key).join(',');
    const onGalleryUpdate = () => {
      const newPhotos = sanitizePhotos(buildPhotoEvents());
      const newSig = newPhotos.map(p => p.key).join(',');
      if (newSig === lastSlotPhotoSig) return; // nada cambió → no reset
      lastSlotPhotoSig = newSig;
      photos = newPhotos;
      brokenKeys.clear();
      if (!photos.length) { renderEmpty(); return; }
      idx = Math.min(idx, photos.length - 1);
      showPhoto(idx);
      scheduleNext();
    };
    window.addEventListener('superGallery:items', onGalleryUpdate);

    // CRÍTICO: usar `idx` (calculado desde el cursor) — NO 0.
    // Si usamos 0 la primera foto siempre es la misma al recargar.
    if (photos.length === 0) renderEmpty();
    else if (photos.length === 1) showPhoto(0);
    else { showPhoto(idx); scheduleNext(); }

    return {
      destroy() {
        clearTimeout(timer);
        clearTimeout(loadTimer);
        if (io) io.disconnect();
        document.removeEventListener('visibilitychange', visibilityHandler);
        window.removeEventListener('superGallery:items', onGalleryUpdate);
        slot.remove();
        setActiveStar(null);
        // restaurar luna al día actual
        transitionMoonTo(moonStack, getMoonPhase(new Date()));
        stage.dataset.slotActive = 'false';
      },
    };
  }

  // ====================================================
  // RENDER PRINCIPAL
  // ====================================================
  let currentSlot = null;
  let moonStack = null;

  async function render() {
    const section = document.getElementById('night-sky');
    if (!section) return;
    const stage = document.getElementById('night-sky-stage');
    const statsBox = document.getElementById('night-sky-stats');
    const tooltip = document.getElementById('night-sky-tooltip');
    const slotAnchor = document.getElementById('ns-photo-slot-anchor');
    if (!stage || !statsBox || !tooltip) return;

    if (currentSlot) { try { currentSlot.destroy(); } catch (_) {} currentSlot = null; }
    stage.innerHTML = '';
    stage.dataset.slotActive = 'false';
    starByKey.clear();
    currentActiveStar = null;

    // Starfield de la SECCIÓN entera (no solo del stage) — universo extendido
    spawnBackgroundStars(section);

    // Luna del día con crossfade stack
    const phase = getMoonPhase(new Date());
    moonStack = createMoonStack(stage, phase);

    const isMobile = window.innerWidth < 760;
    // PERF: conteos MUY reducidos incluso en desktop. La densidad visual
    // no compensa el coste de paint/animation. Depth orbs eliminados
    // (blur 22px es asesino en cualquier device).
    if (isMobile) section.classList.add('is-mobile-perf');
    else section.classList.remove('is-mobile-perf');
    section.classList.add('is-eco'); // modo eficiente por defecto

    spawnTinyDots(stage, isMobile ? 45 : 110);
    spawnMilkyWay(stage, isMobile ? 20 : 55);
    spawnDecorativeStars(stage, isMobile ? 18 : 42);
    spawnParticles(stage, isMobile ? 4 : 9);
    // Estrellas fugaces + historias: solo desktop, ya rarísimas (1.5-4 min)
    if (!isMobile) {
      scheduleShootingStar(stage);
      scheduleStarStory(section, stage);
    }

    // IntersectionObserver: cuando el cielo NO está en viewport,
    // pausamos animaciones vía data attribute que el CSS respeta.
    if ('IntersectionObserver' in window && !section.dataset.visibilityBound) {
      section.dataset.visibilityBound = '1';
      const io = new IntersectionObserver(([entry]) => {
        if (!entry) return;
        section.dataset.inView = entry.isIntersecting ? '1' : '0';
      }, { threshold: 0.05 });
      io.observe(section);
    }

    const stageW = stage.clientWidth;
    const stageH = stage.clientHeight;
    const moonCenter = { x: stageW / 2, y: stageH / 2 };
    const moonR = Math.min(stageW, stageH) * 0.16 + 12;

    const messageEvents = buildMessageEvents();
    const photoEvents = buildPhotoEvents();
    const noteEvents = await buildNoteEvents();

    renderStats(statsBox, {
      msg: messageEvents.length,
      photo: photoEvents.length,
      note: noteEvents.length,
    }, phase, stage);

    const allEvents = [...messageEvents, ...photoEvents, ...noteEvents];
    renderEventStars(stage, allEvents, moonCenter, moonR, tooltip);

    // Photo slot AFUERA del stage
    currentSlot = createPhotoSlot(slotAnchor, stage, statsBox, moonStack);

    if (!tooltip.dataset.bound) {
      tooltip.dataset.bound = '1';
      tooltip.querySelector('.ns-tooltip-close')?.addEventListener('click', () => closeTooltip(tooltip));
      document.addEventListener('click', (e) => {
        if (tooltip.classList.contains('hidden')) return;
        if (tooltip.contains(e.target)) return;
        if (e.target.closest('.ns-star')) return;
        closeTooltip(tooltip);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !tooltip.classList.contains('hidden')) closeTooltip(tooltip);
      });
    }
  }

  // ====================================================
  // INIT — con debounce más generoso para no trabarse
  // ====================================================
  function dataSignature() {
    // Firma estable de las fuentes de datos. Si esto no cambia entre dos
    // disparos de evento, no tiene sentido re-renderizar el cielo entero.
    const photos = window.galleryModule?.allItems?.() || [];
    const photoSig = photos.map(p => `${p.id || ''}|${p.url || p.image || ''}`).join(',');
    const msgs = (window.messagesModule?.dailyMessages || []).length;
    return `p:${photos.length}|${photoSig}|m:${msgs}`;
  }

  let _lastDataSig = '';

  function init() {
    const section = document.getElementById('night-sky');
    if (section) setupContemplationMode(section);
    render().then(() => { _lastDataSig = dataSignature(); });

    // Refresca al cambiar galería o notas (sin trabar la UI), PERO solo si
    // los datos realmente cambiaron. Algunos módulos disparan el evento al
    // volver el foco de la pestaña aunque no haya nada nuevo — eso causaba
    // que la luna "desapareciera" un instante al volver a la página.
    let pendingRefresh = null;
    const scheduleRefresh = () => {
      const sig = dataSignature();
      if (sig === _lastDataSig) return; // nada cambió → no re-renderizamos
      _lastDataSig = sig;
      if (pendingRefresh) cancelAnimationFrame(pendingRefresh);
      pendingRefresh = requestAnimationFrame(() => {
        pendingRefresh = null;
        try { render(); } catch (_) {}
      });
    };
    window.addEventListener('superGallery:items', scheduleRefresh);
    window.addEventListener('notes:updated', scheduleRefresh);

    // Resize debounceado (600ms para evitar lag mientras el usuario arrastra)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { try { render(); } catch (_) {} }, 600);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 800));
  } else {
    setTimeout(init, 800);
  }
})();
