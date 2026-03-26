(function () {
  const DEFAULT_CENTER = [4.711, -74.0721];
  const DEFAULT_ZOOM = 10;

  const STATIC_PLACES = [
    { label: 'Bogotá', subtitle: 'Bogotá D.C.', lat: 4.711, lng: -74.0721 },
    { label: 'Chapinero', subtitle: 'Bogotá D.C.', lat: 4.6486, lng: -74.0628 },
    { label: 'Zona T', subtitle: 'Bogotá D.C.', lat: 4.6699, lng: -74.0537 },
    { label: 'Zona G', subtitle: 'Bogotá D.C.', lat: 4.6539, lng: -74.0568 },
    { label: 'Parque de la 93', subtitle: 'Bogotá D.C.', lat: 4.6769, lng: -74.0488 },
    { label: 'Chicó', subtitle: 'Bogotá D.C.', lat: 4.6762, lng: -74.0515 },
    { label: 'Chicó Norte', subtitle: 'Bogotá D.C.', lat: 4.6815, lng: -74.0481 },
    { label: 'Virrey', subtitle: 'Bogotá D.C.', lat: 4.6736, lng: -74.0571 },
    { label: 'Rosales', subtitle: 'Bogotá D.C.', lat: 4.6531, lng: -74.0562 },
    { label: 'Cedritos', subtitle: 'Bogotá D.C.', lat: 4.7246, lng: -74.0452 },
    { label: 'Usaquén', subtitle: 'Bogotá D.C.', lat: 4.6957, lng: -74.0307 },
    { label: 'Usaquén Centro', subtitle: 'Bogotá D.C.', lat: 4.6952, lng: -74.0301 },
    { label: 'Bella Suiza', subtitle: 'Bogotá D.C.', lat: 4.7127, lng: -74.0368 },
    { label: 'Santa Bárbara', subtitle: 'Bogotá D.C.', lat: 4.6958, lng: -74.0425 },
    { label: 'Unicentro', subtitle: 'Bogotá D.C.', lat: 4.7028, lng: -74.0417 },
    { label: 'Teusaquillo', subtitle: 'Bogotá D.C.', lat: 4.6417, lng: -74.0867 },
    { label: 'Galerías', subtitle: 'Bogotá D.C.', lat: 4.6481, lng: -74.0773 },
    { label: 'Campín', subtitle: 'Bogotá D.C.', lat: 4.6459, lng: -74.0791 },
    { label: 'Movistar Arena', subtitle: 'Bogotá D.C.', lat: 4.6483, lng: -74.0779 },
    { label: 'Parque Simón Bolívar', subtitle: 'Bogotá D.C.', lat: 4.6584, lng: -74.0937 },
    { label: 'Jardín Botánico', subtitle: 'Bogotá D.C.', lat: 4.6646, lng: -74.1026 },
    { label: 'Salitre', subtitle: 'Bogotá D.C.', lat: 4.6559, lng: -74.1055 },
    { label: 'Ciudad Salitre', subtitle: 'Bogotá D.C.', lat: 4.6564, lng: -74.1123 },
    { label: 'Salitre Plaza', subtitle: 'Bogotá D.C.', lat: 4.6531, lng: -74.1088 },
    { label: 'Gran Estación', subtitle: 'Bogotá D.C.', lat: 4.6478, lng: -74.1017 },
    { label: 'Modelia', subtitle: 'Bogotá D.C.', lat: 4.6697, lng: -74.1146 },
    { label: 'Hayuelos', subtitle: 'Bogotá D.C.', lat: 4.6765, lng: -74.1291 },
    { label: 'Capellanía', subtitle: 'Bogotá D.C.', lat: 4.6746, lng: -74.1261 },
    { label: 'Normandía', subtitle: 'Bogotá D.C.', lat: 4.6714, lng: -74.1005 },
    { label: 'Fontibón', subtitle: 'Bogotá D.C.', lat: 4.6785, lng: -74.141 },
    { label: 'Engativá', subtitle: 'Bogotá D.C.', lat: 4.6981, lng: -74.1079 },
    { label: 'Engativá Centro', subtitle: 'Bogotá D.C.', lat: 4.7011, lng: -74.0997 },
    { label: 'Villas de Granada', subtitle: 'Bogotá D.C.', lat: 4.7216, lng: -74.1127 },
    { label: 'Garcés Navas', subtitle: 'Bogotá D.C.', lat: 4.7133, lng: -74.1189 },
    { label: 'Santa Cecilia', subtitle: 'Bogotá D.C.', lat: 4.6927, lng: -74.1234 },
    { label: 'Normandía Occidental', subtitle: 'Bogotá D.C.', lat: 4.6779, lng: -74.1084 },
    { label: 'El Real Engativá', subtitle: 'Bogotá D.C.', lat: 4.6954, lng: -74.1093 },
    { label: 'Álamos', subtitle: 'Bogotá D.C.', lat: 4.6909, lng: -74.1087 },
    { label: 'Suba', subtitle: 'Bogotá D.C.', lat: 4.7417, lng: -74.0841 },
    { label: 'Portal Suba', subtitle: 'Bogotá D.C.', lat: 4.7565, lng: -74.0933 },
    { label: 'Portal 80', subtitle: 'Bogotá D.C.', lat: 4.7098, lng: -74.1139 },
    { label: 'Puente de Boyacá', subtitle: 'Bogotá D.C.', lat: 4.6863, lng: -74.1236 },
    { label: 'Puente de Boyacá Luces', subtitle: 'Bogotá D.C.', lat: 4.6868, lng: -74.1232 },
    { label: 'Puente Largo', subtitle: 'Bogotá D.C.', lat: 4.7034, lng: -74.0737 },
    { label: 'Metrópolis', subtitle: 'Bogotá D.C.', lat: 4.6902, lng: -74.0967 },
    { label: 'Titán Plaza', subtitle: 'Bogotá D.C.', lat: 4.6948, lng: -74.1122 },
    { label: 'Andino', subtitle: 'Bogotá D.C.', lat: 4.669, lng: -74.0532 },
    { label: 'Atlantis', subtitle: 'Bogotá D.C.', lat: 4.6698, lng: -74.0545 },
    { label: 'Parque El Virrey', subtitle: 'Bogotá D.C.', lat: 4.6752, lng: -74.0569 },
    { label: 'Parque Nacional', subtitle: 'Bogotá D.C.', lat: 4.6228, lng: -74.0673 },
    { label: 'Corferias', subtitle: 'Bogotá D.C.', lat: 4.6304, lng: -74.0909 },
    { label: 'Universidad Nacional', subtitle: 'Bogotá D.C.', lat: 4.6377, lng: -74.0831 },
    { label: 'Mundo Aventura', subtitle: 'Bogotá D.C.', lat: 4.6474, lng: -74.1503 },
    { label: 'Centro Mayor', subtitle: 'Bogotá D.C.', lat: 4.5928, lng: -74.1219 },
    { label: 'Puente Aranda', subtitle: 'Bogotá D.C.', lat: 4.6222, lng: -74.1054 },
    { label: 'Avenida Boyacá', subtitle: 'Bogotá D.C.', lat: 4.673, lng: -74.1175 },
    { label: 'Kennedy', subtitle: 'Bogotá D.C.', lat: 4.6278, lng: -74.1531 },
    { label: 'Plaza de las Américas', subtitle: 'Bogotá D.C.', lat: 4.6213, lng: -74.1416 },
    { label: 'Tintal', subtitle: 'Bogotá D.C.', lat: 4.6432, lng: -74.1684 },
    { label: 'Patio Bonito', subtitle: 'Bogotá D.C.', lat: 4.6334, lng: -74.1607 },
    { label: 'Castilla', subtitle: 'Bogotá D.C.', lat: 4.638, lng: -74.1449 },
    { label: 'Bosa', subtitle: 'Bogotá D.C.', lat: 4.6142, lng: -74.1949 },
    { label: 'Monserrate', subtitle: 'Bogotá D.C.', lat: 4.6051, lng: -74.0554 },
    { label: 'Centro Internacional', subtitle: 'Bogotá D.C.', lat: 4.6118, lng: -74.0727 },
    { label: 'La Candelaria', subtitle: 'Bogotá D.C.', lat: 4.5964, lng: -74.0721 },
    { label: 'San Victorino', subtitle: 'Bogotá D.C.', lat: 4.6014, lng: -74.0814 },
    { label: 'Restrepo', subtitle: 'Bogotá D.C.', lat: 4.5949, lng: -74.1009 },
    { label: '20 de Julio', subtitle: 'Bogotá D.C.', lat: 4.5668, lng: -74.0918 },
    { label: 'Soacha', subtitle: 'Cundinamarca', lat: 4.5794, lng: -74.2168 },
    { label: 'Chía', subtitle: 'Cundinamarca', lat: 4.8616, lng: -74.0328 },
    { label: 'La Calera', subtitle: 'Cundinamarca', lat: 4.7194, lng: -73.9691 },
    { label: 'Mosquera', subtitle: 'Cundinamarca', lat: 4.7069, lng: -74.2302 },
    { label: 'Mosquera Centro', subtitle: 'Mosquera, Cundinamarca', lat: 4.7057, lng: -74.2316 },
    { label: 'Parque Principal de Mosquera', subtitle: 'Mosquera, Cundinamarca', lat: 4.7059, lng: -74.2305 },
    { label: 'La Aurora Mosquera', subtitle: 'Mosquera, Cundinamarca', lat: 4.7093, lng: -74.2201 },
    { label: 'La Cartuja Mosquera', subtitle: 'Mosquera, Cundinamarca', lat: 4.7134, lng: -74.2192 },
    { label: 'Condado del Duque', subtitle: 'Mosquera, Cundinamarca', lat: 4.7088, lng: -74.2217 },
    { label: 'Parque Residencial Solana', subtitle: 'Mosquera, Cundinamarca', lat: 4.7066, lng: -74.2249 },
    { label: 'Ciudadela Quintas de Zaragoza', subtitle: 'Mosquera, Cundinamarca', lat: 4.7116, lng: -74.2176 },
    { label: 'El Diamante Mosquera', subtitle: 'Mosquera, Cundinamarca', lat: 4.7051, lng: -74.2263 },
    { label: 'El Lucero Mosquera', subtitle: 'Mosquera, Cundinamarca', lat: 4.7008, lng: -74.2328 },
    { label: 'Parque Industrial San Jorge', subtitle: 'Mosquera, Cundinamarca', lat: 4.6928, lng: -74.2467 },
    { label: 'Altos de Serrezuela', subtitle: 'Mosquera, Cundinamarca', lat: 4.6992, lng: -74.2243 },
    { label: 'Planadas Mosquera', subtitle: 'Mosquera, Cundinamarca', lat: 4.7017, lng: -74.2475 },
    { label: 'Serrezuela Mosquera', subtitle: 'Mosquera, Cundinamarca', lat: 4.6981, lng: -74.2235 },
    { label: 'Novaterra Mosquera', subtitle: 'Mosquera, Cundinamarca', lat: 4.7172, lng: -74.2138 },
    { label: 'Ciudad Sabana Mosquera', subtitle: 'Mosquera, Cundinamarca', lat: 4.7099, lng: -74.2157 },
    { label: 'El Trébol Mosquera', subtitle: 'Mosquera, Cundinamarca', lat: 4.7108, lng: -74.2369 },
    { label: 'La Cabaña Mosquera', subtitle: 'Mosquera, Cundinamarca', lat: 4.7001, lng: -74.2396 },
    { label: 'Porvenir Mosquera', subtitle: 'Mosquera, Cundinamarca', lat: 4.7112, lng: -74.2214 },
    { label: 'Maiporé Mosquera', subtitle: 'Mosquera, Cundinamarca', lat: 4.6919, lng: -74.2277 },
    { label: 'Zona Franca Mosquera', subtitle: 'Mosquera, Cundinamarca', lat: 4.6853, lng: -74.2454 },
    { label: 'Funza', subtitle: 'Cundinamarca', lat: 4.7164, lng: -74.2119 },
    { label: 'Funza Centro', subtitle: 'Funza, Cundinamarca', lat: 4.7161, lng: -74.2113 },
    { label: 'Parque Principal de Funza', subtitle: 'Funza, Cundinamarca', lat: 4.7162, lng: -74.2126 },
    { label: 'Altos de Gertrudis Funza', subtitle: 'Funza, Cundinamarca', lat: 4.7346, lng: -74.2148 },
    { label: 'La Cofradía Funza', subtitle: 'Funza, Cundinamarca', lat: 4.7263, lng: -74.2084 },
    { label: 'Portal de María Funza', subtitle: 'Funza, Cundinamarca', lat: 4.7193, lng: -74.2064 },
    { label: 'Hacienda Casablanca Funza', subtitle: 'Funza, Cundinamarca', lat: 4.7228, lng: -74.2025 },
    { label: 'Bosques de Salamanca Funza', subtitle: 'Funza, Cundinamarca', lat: 4.7201, lng: -74.2052 },
    { label: 'Parque Empresarial Celta', subtitle: 'Funza, Cundinamarca', lat: 4.7395, lng: -74.2291 },
    { label: 'Villa Olímpica Funza', subtitle: 'Funza, Cundinamarca', lat: 4.7238, lng: -74.2059 },
    { label: 'Hato Grande Funza', subtitle: 'Funza, Cundinamarca', lat: 4.7422, lng: -74.1978 },
    { label: 'Siete Trojes Funza', subtitle: 'Funza, Cundinamarca', lat: 4.7177, lng: -74.2201 },
    { label: 'San Antonio Funza', subtitle: 'Funza, Cundinamarca', lat: 4.7076, lng: -74.2027 },
    { label: 'El Cacique Funza', subtitle: 'Funza, Cundinamarca', lat: 4.7145, lng: -74.2174 },
    { label: 'La 80 Funza', subtitle: 'Funza, Cundinamarca', lat: 4.721, lng: -74.2115 },
    { label: 'Celta Funza', subtitle: 'Funza, Cundinamarca', lat: 4.7393, lng: -74.2295 },
    { label: 'Zona Franca Funza', subtitle: 'Funza, Cundinamarca', lat: 4.7411, lng: -74.2235 },
    { label: 'Parque Industrial Funza', subtitle: 'Funza, Cundinamarca', lat: 4.7314, lng: -74.2205 },
    { label: 'Tres Esquinas Funza', subtitle: 'Funza, Cundinamarca', lat: 4.7199, lng: -74.2247 },
    { label: 'Madrid', subtitle: 'Cundinamarca', lat: 4.7338, lng: -74.2644 },
    { label: 'Madrid Centro', subtitle: 'Madrid, Cundinamarca', lat: 4.7336, lng: -74.2646 },
    { label: 'La Prosperidad Madrid', subtitle: 'Madrid, Cundinamarca', lat: 4.7498, lng: -74.2538 },
    { label: 'Cartagenita Madrid', subtitle: 'Madrid, Cundinamarca', lat: 4.7453, lng: -74.2864 },
    { label: 'Facatativá', subtitle: 'Cundinamarca', lat: 4.8133, lng: -74.3545 },
    { label: 'Parque Principal de Facatativá', subtitle: 'Facatativá, Cundinamarca', lat: 4.8156, lng: -74.3549 },
    { label: 'Faca Centro', subtitle: 'Facatativá, Cundinamarca', lat: 4.8147, lng: -74.3558 }
  ];

  const STATIC_GENERIC_BLOCKLIST = new Set([
    'apartamento', 'casa', 'cafecito', 'cafe', 'parque', 'cita', 'lugar', 'zona',
    'nuestros momentos', 'varios', 'bloque', 'titulo'
  ]);

  let memoryMap = null;
  let memoryMarkersLayer = null;
  let memorySpotlightLayer = null;
  let memoryMapResizeBound = false;
  let mapPicker = null;
  let mapPickerMarker = null;
  let mapPickerPendingResolver = null;
  let mapPickerSelected = null;
  let mapPickerSearchController = null;
  let mapPickerSearchDebounce = null;
  let mapPickerMoveEndBound = false;
  let mapPickerReverseTimer = null;
  let currentGalleryItems = [];
  let moduleInitialized = false;
  let geocodeCache = null;

  function normalizePlaceKey(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function isGenericManualPlace(value) {
    const key = normalizePlaceKey(value);
    if (!key) return true;
    if (STATIC_GENERIC_BLOCKLIST.has(key)) return true;
    return key.length <= 2;
  }

  function getStaticPlaceOptions() {
    return STATIC_PLACES.map(place => place.label);
  }

  function getStaticPlaceByLabel(label) {
    const normalized = normalizePlaceKey(label);
    return STATIC_PLACES.find(place => normalizePlaceKey(place.label) === normalized) || null;
  }

  function getStoredPhotoMapLocations() {
    try {
      return JSON.parse(localStorage.getItem('zamge-photo-map-locations-v1') || '{}');
    } catch {
      return {};
    }
  }

  function getStoredPhotoMapLocation(photoId) {
    if (!photoId) return '';
    const cache = getStoredPhotoMapLocations();
    return String(cache[String(photoId)] || '').trim();
  }

  function setStoredPhotoMapLocation(photoId, location) {
    if (!photoId) return;
    const cache = getStoredPhotoMapLocations();
    const key = String(photoId);
    const value = String(location || '').trim();
    if (value) {
      cache[key] = value;
    } else {
      delete cache[key];
    }
    localStorage.setItem('zamge-photo-map-locations-v1', JSON.stringify(cache));
  }

  function getStoredPhotoMapPoints() {
    try {
      return JSON.parse(localStorage.getItem('zamge-photo-map-points-v1') || '{}');
    } catch {
      return {};
    }
  }

  function getStoredPhotoMapPoint(photoId) {
    if (!photoId) return null;
    const cache = getStoredPhotoMapPoints();
    const point = cache[String(photoId)];
    if (!point) return null;
    const lat = Number(point.lat);
    const lng = Number(point.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }

  function setStoredPhotoMapPoint(photoId, point) {
    if (!photoId) return;
    const cache = getStoredPhotoMapPoints();
    const key = String(photoId);
    const lat = Number(point?.lat);
    const lng = Number(point?.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      cache[key] = { lat, lng };
    } else {
      delete cache[key];
    }
    localStorage.setItem('zamge-photo-map-points-v1', JSON.stringify(cache));
  }

  function getGeocodeCache() {
    if (geocodeCache) return geocodeCache;
    try {
      geocodeCache = JSON.parse(localStorage.getItem('zamge-map-geocode-cache-v1') || '{}');
    } catch {
      geocodeCache = {};
    }
    return geocodeCache;
  }

  function setGeocodeCacheValue(key, value) {
    const cache = getGeocodeCache();
    if (value) {
      cache[key] = value;
    } else {
      delete cache[key];
    }
    localStorage.setItem('zamge-map-geocode-cache-v1', JSON.stringify(cache));
  }

  function hasSpecificMapLabel(value) {
    const clean = String(value || '').trim();
    return !!clean && !isGenericManualPlace(clean);
  }

  function hasRealCoords(item) {
    const lat = Number(item?.map_lat);
    const lng = Number(item?.map_lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
    if (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001) return false;
    return true;
  }

  function createPurpleMarkerIcon(count = 1) {
    const countBadge = count > 1 ? `<span class="memory-marker-count">${count}</span>` : '';
    return L.divIcon({
      className: 'memory-marker-wrap',
      html: `<div class="memory-marker">${countBadge}<span class="memory-marker-heart">💗</span></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 30],
      popupAnchor: [0, -24]
    });
  }

  async function queryNominatim(q) {
    if (!q) return [];
    if (mapPickerSearchController) {
      mapPickerSearchController.abort();
    }
    mapPickerSearchController = new AbortController();
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&countrycodes=co&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      signal: mapPickerSearchController.signal,
      headers: { 'Accept-Language': 'es-CO,es;q=0.9,en;q=0.7' }
    });
    if (!res.ok) throw new Error('No se pudo buscar en el mapa');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  async function searchMapLocations(rawQuery) {
    const query = String(rawQuery || '').trim();
    if (!query) return getMapPickerPopularOptions();

    const normalized = normalizePlaceKey(query);
    const localMatches = STATIC_PLACES
      .filter(place =>
        normalizePlaceKey(place.label).includes(normalized) ||
        normalizePlaceKey(place.subtitle).includes(normalized)
      )
      .slice(0, 12)
      .map(place => ({
        label: place.label,
        subtitle: place.subtitle,
        lat: place.lat,
        lng: place.lng,
        source: 'static'
      }));

    let remoteMatches = [];
    if (query.length >= 2) {
      try {
        remoteMatches = (await queryNominatim(`${query}, Colombia`))
          .map(item => ({
            label: item.display_name.split(',')[0]?.trim() || item.display_name,
            subtitle: item.display_name,
            lat: Number(item.lat),
            lng: Number(item.lon),
            source: 'remote'
          }))
          .filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lng));
      } catch (error) {
        if (error?.name !== 'AbortError') {
          console.warn('No se pudo consultar Nominatim:', error);
        }
      }
    }

    const seen = new Set();
    return [...localMatches, ...remoteMatches].filter(item => {
      const key = normalizePlaceKey(item.label + '|' + item.subtitle);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 14);
  }

  function getMapPickerPopularOptions() {
    return STATIC_PLACES.slice(0, 20).map(place => ({
      label: place.label,
      subtitle: place.subtitle,
      lat: place.lat,
      lng: place.lng,
      source: 'static'
    }));
  }

  function setPickerSelectedText(label) {
    const selectedText = document.getElementById('map-picker-selected-text');
    if (selectedText) {
      selectedText.textContent = label || 'Aún no has marcado un punto.';
    }
  }

  function updateMapPickerSelection(selection) {
    mapPickerSelected = selection ? {
      lat: Number(selection.lat),
      lng: Number(selection.lng),
      label: selection.label || '',
      subtitle: selection.subtitle || ''
    } : null;

    if (mapPickerSelected && Number.isFinite(mapPickerSelected.lat) && Number.isFinite(mapPickerSelected.lng)) {
      setPickerSelectedText(mapPickerSelected.label || `${mapPickerSelected.lat.toFixed(5)}, ${mapPickerSelected.lng.toFixed(5)}`);
    } else {
      setPickerSelectedText('');
    }
  }

  function setMapPickerSearchResults(items) {
    const resultsEl = document.getElementById('map-picker-search-results');
    if (!resultsEl) return;

    if (!items.length) {
      resultsEl.innerHTML = '';
      resultsEl.classList.add('hidden');
      return;
    }

    resultsEl.innerHTML = items.map((item) => `
      <button type="button" class="map-picker-search-item" data-lat="${item.lat}" data-lng="${item.lng}" data-label="${(item.label || '').replaceAll('"', '&quot;')}" data-subtitle="${(item.subtitle || '').replaceAll('"', '&quot;')}">
        <span class="map-picker-search-icon">📍</span>
        <span class="map-picker-search-copy">
          <strong>${item.label}</strong>
          <small>${item.subtitle || ''}</small>
        </span>
      </button>
    `).join('');

    resultsEl.classList.remove('hidden');

    resultsEl.querySelectorAll('.map-picker-search-item').forEach((button) => {
      button.addEventListener('click', () => {
        const item = {
          lat: Number(button.dataset.lat),
          lng: Number(button.dataset.lng),
          label: button.dataset.label || '',
          subtitle: button.dataset.subtitle || ''
        };
        if (mapPicker) {
          mapPicker.flyTo([item.lat, item.lng], 15, { duration: 1.25 });
        }
        updateMapPickerSelection(item);
        resultsEl.classList.add('hidden');
      });
    });
  }

  async function reverseLookupLabel(lat, lng) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'es-CO,es;q=0.9,en;q=0.7' }
      });
      if (!res.ok) throw new Error('No se pudo consultar dirección');
      const data = await res.json();
      const address = data.address || {};
      const pieces = [
        address.road,
        address.suburb,
        address.neighbourhood,
        address.city || address.town || address.village || address.municipality,
        address.state
      ].filter(Boolean);
      return pieces[0] ? pieces.slice(0, 3).join(', ') : (data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  }

  async function syncMapPickerToCenter() {
    if (!mapPicker) return null;
    const center = mapPicker.getCenter();
    const label = await reverseLookupLabel(center.lat, center.lng);
    updateMapPickerSelection({
      lat: center.lat,
      lng: center.lng,
      label
    });
    return { lat: center.lat, lng: center.lng, label };
  }

  async function goToMapPickerSearch(rawQuery) {
    const results = await searchMapLocations(rawQuery);
    setMapPickerSearchResults(results);
    const first = results[0];
    if (!first || !mapPicker) return null;
    mapPicker.flyTo([first.lat, first.lng], 14, { duration: 1.2 });
    updateMapPickerSelection(first);
    return first;
  }

  function ensureMapPicker() {
    if (!window.L) return null;
    const canvas = document.getElementById('map-picker-canvas');
    if (!canvas) return null;

    if (!mapPicker) {
      mapPicker = L.map(canvas, { zoomControl: true, attributionControl: false }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(mapPicker);

      if (!mapPickerMoveEndBound) {
        mapPickerMoveEndBound = true;
        mapPicker.on('moveend', () => {
          clearTimeout(mapPickerReverseTimer);
          mapPickerReverseTimer = setTimeout(() => {
            syncMapPickerToCenter();
          }, 180);
        });
      }
    }

    setTimeout(() => mapPicker.invalidateSize(), 50);
    return mapPicker;
  }

  function closeMapPicker(result = null) {
    const modal = document.getElementById('map-picker-modal');
    const resultsEl = document.getElementById('map-picker-search-results');
    if (resultsEl) {
      resultsEl.innerHTML = '';
      resultsEl.classList.add('hidden');
    }
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
    const resolver = mapPickerPendingResolver;
    mapPickerPendingResolver = null;
    if (resolver) resolver(result);
  }

  async function finalizeMapPickerSelection() {
    const liveSelection = await syncMapPickerToCenter();
    if (liveSelection?.label) {
      updateMapPickerSelection(liveSelection);
    }
    if (!mapPickerSelected) {
      closeMapPicker(null);
      return;
    }
    closeMapPicker({
      label: mapPickerSelected.label,
      lat: mapPickerSelected.lat,
      lng: mapPickerSelected.lng,
      subtitle: mapPickerSelected.subtitle || ''
    });
  }

  async function openMapPicker({ initialPlace = '' } = {}) {
    const modal = document.getElementById('map-picker-modal');
    const searchInput = document.getElementById('map-picker-search-input');
    if (!modal || !searchInput) return null;

    ensureMapPicker();
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => mapPicker?.invalidateSize(), 60);

    mapPickerSelected = null;
    updateMapPickerSelection(null);
    searchInput.value = initialPlace || '';

    if (initialPlace) {
      await goToMapPickerSearch(initialPlace);
    } else if (mapPicker) {
      mapPicker.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.1 });
      setTimeout(() => syncMapPickerToCenter(), 350);
    }

    return new Promise((resolve) => {
      mapPickerPendingResolver = resolve;
    });
  }

  async function resolvePlaceToCoords(place) {
    const cleanPlace = String(place || '').trim();
    if (!cleanPlace || isGenericManualPlace(cleanPlace)) return null;

    const exactStatic = getStaticPlaceByLabel(cleanPlace);
    if (exactStatic) {
      return { lat: exactStatic.lat, lng: exactStatic.lng, label: exactStatic.label, subtitle: exactStatic.subtitle || '' };
    }

    const cacheKey = normalizePlaceKey(cleanPlace);
    const cache = getGeocodeCache();
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const results = await queryNominatim(`${cleanPlace}, Colombia`);
      const first = results.find(item => Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lon)));
      if (!first) return null;
      const resolved = {
        lat: Number(first.lat),
        lng: Number(first.lon),
        label: first.display_name.split(',')[0]?.trim() || cleanPlace,
        subtitle: first.display_name
      };
      setGeocodeCacheValue(cacheKey, resolved);
      return resolved;
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.warn('No se pudo resolver lugar:', cleanPlace, error);
      }
      return null;
    }
  }

  async function updateMemoryMapMarkers(items = []) {
    currentGalleryItems = Array.isArray(items) ? items : [];
    if (!memoryMap || !memoryMarkersLayer) return;

    memoryMarkersLayer.clearLayers();

    const grouped = new Map();
    currentGalleryItems.forEach((item) => {
      const mapPlace = String(item.map_location || '').trim();
      const hasCoords = hasRealCoords(item);
      if ((!mapPlace || isGenericManualPlace(mapPlace)) && !hasCoords) return;
      const key = hasCoords
        ? `${Number(item.map_lat).toFixed(6)},${Number(item.map_lng).toFixed(6)}`
        : normalizePlaceKey(mapPlace);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(item);
    });

    for (const [key, photos] of grouped.entries()) {
      const firstPhoto = photos[0] || {};
      const resolved = hasRealCoords(firstPhoto)
        ? {
            lat: Number(firstPhoto.map_lat),
            lng: Number(firstPhoto.map_lng),
            label: hasSpecificMapLabel(firstPhoto.map_location) ? firstPhoto.map_location : '',
            subtitle: ''
          }
        : await resolvePlaceToCoords(firstPhoto.map_location || key);
      if (!resolved) continue;
      if (!resolved.label && hasRealCoords(firstPhoto)) {
        resolved.label = await reverseLookupLabel(Number(firstPhoto.map_lat), Number(firstPhoto.map_lng));
      }
      const marker = L.marker([resolved.lat, resolved.lng], {
        icon: createPurpleMarkerIcon(photos.length)
      });
      const popupHtml = `
        <div class="memory-map-popup">
          <strong>${hasSpecificMapLabel(photos[0]?.map_location) ? photos[0].map_location : resolved.label}</strong>
          <div>${photos.length} recuerdo${photos.length > 1 ? 's' : ''}</div>
        </div>
      `;
      marker.bindPopup(popupHtml);
      marker.addTo(memoryMarkersLayer);
    }
  }

  async function focusMemoryMapPlace(place) {
    const resolved = await resolvePlaceToCoords(place);
    if (!resolved || !memoryMap) return;
    memoryMap.flyTo([resolved.lat, resolved.lng], 14, { duration: 1.2 });
  }

  async function spotlightPhoto(item) {
    if (!memoryMap || !item) return;
    const place = String(item.map_location || '').trim();

    let resolved = null;
    const lat = Number(item.map_lat);
    const lng = Number(item.map_lng);

    if (hasRealCoords(item)) {
      resolved = {
        lat,
        lng,
        label: hasSpecificMapLabel(place) ? place : '',
        subtitle: ''
      };
      if (!resolved.label) {
        resolved.label = await reverseLookupLabel(lat, lng);
      }
    } else {
      resolved = await resolvePlaceToCoords(place);
    }

    if (!resolved) return;

    if (memoryMarkersLayer) memoryMarkersLayer.clearLayers();
    if (memorySpotlightLayer) memorySpotlightLayer.clearLayers();

    const marker = L.marker([resolved.lat, resolved.lng], {
      icon: createPurpleMarkerIcon()
    });
    marker.bindPopup(`
      <div class="memory-map-popup">
        <strong>${hasSpecificMapLabel(place) ? place : resolved.label}</strong>
        <div>${item.place || item.album || 'Nuestro recuerdo'}</div>
      </div>
    `);
    marker.addTo(memorySpotlightLayer);
    memoryMap.flyTo([resolved.lat, resolved.lng], 14, { duration: 1.35 });
    setTimeout(() => marker.openPopup(), 420);
  }

  function initMemoryMap() {
    if (!window.L || memoryMap) return;
    const mapEl = document.getElementById('memory-map');
    if (!mapEl) return;

    memoryMap = L.map(mapEl, { zoomControl: true, attributionControl: false }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(memoryMap);

    memoryMarkersLayer = L.layerGroup().addTo(memoryMap);
    memorySpotlightLayer = L.layerGroup().addTo(memoryMap);

    if (!memoryMapResizeBound) {
      memoryMapResizeBound = true;
      window.addEventListener('resize', () => {
        memoryMap?.invalidateSize();
        mapPicker?.invalidateSize();
      });
    }

    setTimeout(() => memoryMap.invalidateSize(), 120);
  }

  function bindMapPickerUi() {
    const closeX = document.getElementById('btn-close-map-picker-x');
    const cancelBtn = document.getElementById('btn-cancel-map-picker');
    const confirmBtn = document.getElementById('btn-confirm-map-picker');
    const searchInput = document.getElementById('map-picker-search-input');
    const resultsEl = document.getElementById('map-picker-search-results');

    closeX?.addEventListener('click', () => closeMapPicker(null));
    cancelBtn?.addEventListener('click', () => closeMapPicker(null));
    confirmBtn?.addEventListener('click', () => {
      finalizeMapPickerSelection();
    });

    document.querySelectorAll('.map-picker-quick-chip').forEach((chip) => {
      chip.addEventListener('click', async () => {
        const place = chip.dataset.place || '';
        if (!place) return;
        if (searchInput) searchInput.value = place;
        await goToMapPickerSearch(place);
      });
    });

    searchInput?.addEventListener('input', () => {
      const query = searchInput.value || '';
      clearTimeout(mapPickerSearchDebounce);
      mapPickerSearchDebounce = setTimeout(async () => {
        const results = await searchMapLocations(query);
        setMapPickerSearchResults(results);
      }, 280);
    });

    searchInput?.addEventListener('focus', async () => {
      const query = searchInput.value || '';
      const results = await searchMapLocations(query);
      setMapPickerSearchResults(results);
    });

    searchInput?.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        await goToMapPickerSearch(searchInput.value || '');
      }
      if (event.key === 'Escape') {
        resultsEl?.classList.add('hidden');
      }
    });

    searchInput?.addEventListener('blur', () => {
      setTimeout(() => resultsEl?.classList.add('hidden'), 140);
    });
  }

  function init() {
    if (moduleInitialized) {
      initMemoryMap();
      updateMemoryMapMarkers(currentGalleryItems);
      return;
    }
    moduleInitialized = true;

    bindMapPickerUi();
    initMemoryMap();

    window.addEventListener('superGallery:items', (event) => {
      updateMemoryMapMarkers(event.detail?.items || []);
    });

    window.addEventListener('memory-map:focus-place', (event) => {
      const place = event.detail?.place || '';
      if (place) focusMemoryMapPlace(place);
    });

    window.addEventListener('memory-map:spotlight-photo', (event) => {
      const item = event.detail?.item || null;
      if (item) spotlightPhoto(item);
    });

    const initialItems = window.galleryModule?.allItems?.() || [];
    if (initialItems.length) {
      updateMemoryMapMarkers(initialItems);
    }
  }

  window.memoryMapModule = {
    init,
    openPicker: openMapPicker,
    focusPlace: focusMemoryMapPlace,
    getPlaceOptions: getStaticPlaceOptions,
    resolvePlace: resolvePlaceToCoords,
    getStoredPhotoMapLocation,
    setStoredPhotoMapLocation,
    getStoredPhotoMapPoint,
    setStoredPhotoMapPoint
  };
})();
