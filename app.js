/**
 * app.js
 * Inicialización general de la página y helpers visuales.
 */
(function(){
  const LOVE_COUNTER_START_DATE = new Date('2026-01-11T23:11:00-05:00');

  function shuffleArray(list = []) {
    const copy = Array.isArray(list) ? [...list] : [];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
  }

  function normalizeCarouselImageUrl(value = '') {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try {
      return new URL(raw, window.location.origin).href;
    } catch {
      return raw;
    }
  }

  function formatMemoryCarouselDate(value = '') {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(parsed);
  }

  function normalizeCarouselCopyText(value = '') {
    const raw = String(value || '').trim();
    if (!raw) return '';

    const letters = raw.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || [];
    const upperLetters = raw.match(/[A-ZÁÉÍÓÚÜÑ]/g) || [];
    const isMostlyUpper = letters.length >= 8 && (upperLetters.length / letters.length) > 0.7;

    if (!isMostlyUpper) return raw;

    const lowered = raw.toLocaleLowerCase('es-CO');
    return lowered.charAt(0).toLocaleUpperCase('es-CO') + lowered.slice(1);
  }

  function formatMemoryCarouselCount(current = 1, total = 1) {
    return `${String(current).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  }

  function formatMemoryCarouselRelativeDate(value = '') {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return '';
    const today = new Date();
    const start = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffDays = Math.round((end - start) / 86400000);
    if (!Number.isFinite(diffDays) || diffDays < 0) return '';
    if (diffDays === 0) return 'de hoy';
    if (diffDays === 1) return 'de ayer';
    return `hace ${diffDays} días`;
  }

  function buildMemoryCarouselSlides(items = []) {
    const countByGroup = new Map();
    items.forEach((item) => {
      const key = String(item?.album || item?.place || '').trim().toLocaleLowerCase('es-CO');
      if (!key) return;
      countByGroup.set(key, (countByGroup.get(key) || 0) + 1);
    });

    const gallerySlides = shuffleArray(items)
      .filter((item) => String(item?.url || '').trim())
      .map((item, index) => {
        const src = normalizeCarouselImageUrl(item.url);
        if (!src) return null;

        const rawTitle = String(item.album || item.place || '').trim();
        const rawCopy = normalizeCarouselCopyText(String(item.caption || item.place || '').trim());
        const groupKey = String(item.album || item.place || '').trim().toLocaleLowerCase('es-CO');
        return {
          src,
          title: rawTitle || `Recuerdo bonito ${index + 1}`,
          copy: rawCopy || '💗',
          variant: 'photo',
          label: 'Galería',
          place: String(item.place || '').trim(),
          date: formatMemoryCarouselDate(item.date || item.created_at || ''),
          relativeDate: formatMemoryCarouselRelativeDate(item.date || item.created_at || ''),
          groupCount: countByGroup.get(groupKey) || 1,
          sourceItem: item
        };
      })
      .filter(Boolean);

    if (gallerySlides.length) return gallerySlides;

    return [
      {
        src: 'img/certificado_adopcion_perro_ilustrado_verde.png',
        title: 'Nuestro certificadito',
        copy: 'Mientras cargan las fotos de la galería, aquí sigue este recuerdito especial.',
        variant: 'wide',
        label: 'Especial',
        place: '',
        date: '',
        relativeDate: '',
        groupCount: 1,
        sourceItem: null
      }
    ];
  }

  function initMemoryCarousel() {
    const track = document.getElementById('memory-carousel-track');
    const prevBtn = document.getElementById('memory-carousel-prev');
    const nextBtn = document.getElementById('memory-carousel-next');
    const shell = document.querySelector('.memory-carousel-shell');
    const eyebrow = document.querySelector('.memory-carousel-eyebrow');
    const gallerySection = document.querySelector('.super-gallery.full-bleed');
    const viewport = document.querySelector('.memory-carousel-viewport');
    const filterPlace = document.getElementById('filter-place');
    const searchCaption = document.getElementById('search-caption');
    if (!track || !prevBtn || !nextBtn || !shell || !viewport) return;

    let slides = [];
    let activeIndex = 0;
    let autoplayTimer = null;
    let history = [];
    let historyPointer = 0;
    let isAnimating = false;
    let touchStartX = 0;
    let touchEndX = 0;
    const AUTOPLAY_MS = 6000;

    function applyMediaLayout(article) {
      if (!article) return;
      const card = article.querySelector('.memory-carousel-card');
      const media = article.querySelector('.memory-carousel-media');
      const image = media?.querySelector('img');
      if (!card || !media || !image) return;

      const setRatioClass = () => {
        const width = image.naturalWidth || image.clientWidth;
        const height = image.naturalHeight || image.clientHeight;
        if (!width || !height) return;
        const ratio = width / height;
        card.classList.remove('is-landscape', 'is-portrait', 'is-square');
        if (ratio >= 1.22) card.classList.add('is-landscape');
        else if (ratio <= 0.88) card.classList.add('is-portrait');
        else card.classList.add('is-square');
        window.requestAnimationFrame(syncNavPosition);
      };

      if (image.complete) setRatioClass();
      else image.addEventListener('load', setRatioClass, { once: true });
    }

    function syncNavPosition() {
      const activeMedia = track.querySelector('.memory-carousel-slide.is-current .memory-carousel-media');
      if (!activeMedia) return;
      const navTop = activeMedia.offsetTop + (activeMedia.offsetHeight / 2);
      shell.style.setProperty('--memory-nav-top', `${navTop}px`);
    }

    function createSlideElement(index, { current = false } = {}) {
      const slide = slides[index];
      const safeSrc = encodeURI(slide.src);
      const metaParts = [
        slide.date ? `<span class="memory-carousel-meta-item">${slide.date}</span>` : '',
        slide.place ? `<span class="memory-carousel-meta-item">${slide.place}</span>` : ''
      ].filter(Boolean);
      const metaMarkup = metaParts.length
        ? `<div class="memory-carousel-meta">${metaParts.join('<span class="memory-carousel-meta-sep" aria-hidden="true">•</span>')}</div>`
        : '';
      const isClickable = !!slide.sourceItem && typeof window.galleryModule?.openLightbox === 'function';
      const isLongCopy = slide.copy.length > 118;
      const titleTone = slide.label === 'Especial' ? 'memory-carousel-title--special' : '';
      const article = document.createElement('article');
      article.className = `memory-carousel-slide${current ? ' is-current' : ''}`;
      article.dataset.slideIndex = String(index);
      article.setAttribute('aria-hidden', current ? 'false' : 'true');
      article.innerHTML = `
        <div class="memory-carousel-card memory-carousel-card--${slide.variant || 'photo'}">
          <div class="memory-carousel-media${isClickable ? ' is-clickable' : ''}" style="--memory-image: url('${safeSrc}')">
            <img src="${safeSrc}" alt="${slide.title}" loading="eager" decoding="async" draggable="false">
            <div class="memory-carousel-progress" aria-hidden="true">
              <span class="memory-carousel-progress-fill"></span>
            </div>
          </div>
          <div class="memory-carousel-copy">
            <div class="memory-carousel-copy-head">
              <div class="memory-carousel-copy-mainmeta">
                <span class="memory-carousel-tag">${slide.label || 'Recuerdo'}</span>
                <span class="memory-carousel-count">${formatMemoryCarouselCount(index + 1, slides.length)}</span>
                ${slide.groupCount > 1 ? `<span class="memory-carousel-group-count"><span class="memory-carousel-group-icon" aria-hidden="true">📷</span><span>${slide.groupCount}</span></span>` : ''}
              </div>
              ${slide.relativeDate ? `<div class="memory-carousel-when">${slide.relativeDate}</div>` : ''}
              ${metaMarkup}
            </div>
            <strong class="${titleTone}">${slide.title}</strong>
            <span class="memory-carousel-copy-text${isLongCopy ? ' is-collapsed' : ''}${slide.copy === '💗' ? ' is-placeholder' : ''}">${slide.copy}</span>
            <div class="memory-carousel-copy-actions">
              ${isLongCopy ? `<button class="memory-carousel-more" type="button">Ver más</button>` : ''}
              ${slide.sourceItem ? `<button class="memory-carousel-link" type="button">Ver en galería</button>` : ''}
            </div>
          </div>
        </div>
      `;
      applyMediaLayout(article);
      return article;
    }

    function updateButtons() {
      const hasMultiple = slides.length > 1;
      prevBtn.disabled = !hasMultiple || historyPointer <= 0 || isAnimating;
      nextBtn.disabled = !hasMultiple || isAnimating;
    }

    function syncShellBackground(index) {
      const slide = slides[index];
      if (!slide) {
        shell.style.removeProperty('--memory-shell-image');
        return;
      }
      shell.style.setProperty('--memory-shell-image', `url('${encodeURI(slide.src)}')`);
    }

    function renderSlides(nextSlides = []) {
      slides = Array.isArray(nextSlides) && nextSlides.length ? nextSlides : buildMemoryCarouselSlides([]);
      activeIndex = 0;
      history = slides.length ? [0] : [];
      historyPointer = 0;
      isAnimating = false;

      track.innerHTML = '';
      if (slides.length) {
        track.appendChild(createSlideElement(0, { current: true }));
      }
      syncShellBackground(0);
      updateButtons();
      window.requestAnimationFrame(syncNavPosition);
      startAutoplay();
    }

    function showSlide(index, direction = 'next') {
      if (!slides.length) return;
      const nextIndex = (index + slides.length) % slides.length;
      const currentEl = track.querySelector('.memory-carousel-slide.is-current');

      if (!currentEl) {
        track.innerHTML = '';
        track.appendChild(createSlideElement(nextIndex, { current: true }));
        activeIndex = nextIndex;
        syncShellBackground(nextIndex);
        updateButtons();
        return;
      }

      if (nextIndex === activeIndex || isAnimating) return;

      const incoming = createSlideElement(nextIndex);
      incoming.classList.add('is-ghost', direction === 'next' ? 'enter-next' : 'enter-prev');
      currentEl.classList.add(direction === 'next' ? 'exit-next' : 'exit-prev');
      currentEl.setAttribute('aria-hidden', 'true');
      track.appendChild(incoming);
      syncShellBackground(nextIndex);

      isAnimating = true;
      updateButtons();

      const finalize = () => {
        currentEl.remove();
        incoming.classList.remove('is-ghost', 'enter-next', 'enter-prev');
        incoming.classList.add('is-current');
        incoming.setAttribute('aria-hidden', 'false');
        activeIndex = nextIndex;
        isAnimating = false;
        updateButtons();
        window.requestAnimationFrame(syncNavPosition);
      };

      incoming.addEventListener('animationend', finalize, { once: true });
    }

    function pickRandomIndex(exclusions = []) {
      if (slides.length < 2) return 0;
      const excluded = new Set(exclusions);
      const available = slides
        .map((_, index) => index)
        .filter((index) => !excluded.has(index));

      if (available.length) {
        return available[Math.floor(Math.random() * available.length)];
      }

      const fallback = slides
        .map((_, index) => index)
        .filter((index) => index !== activeIndex);

      return fallback[Math.floor(Math.random() * fallback.length)] ?? activeIndex;
    }

    function showRandomNext() {
      if (slides.length < 2 || isAnimating) return;
      const recent = history.slice(Math.max(0, historyPointer - 2), historyPointer + 1);
      const nextIndex = pickRandomIndex([activeIndex, ...recent]);
      history = history.slice(0, historyPointer + 1);
      history.push(nextIndex);
      historyPointer = history.length - 1;
      showSlide(nextIndex, 'next');
    }

    function showPrevious() {
      if (historyPointer <= 0 || isAnimating) return;
      historyPointer -= 1;
      showSlide(history[historyPointer], 'prev');
    }

    function stopAutoplay() {
      if (!autoplayTimer) return;
      clearInterval(autoplayTimer);
      autoplayTimer = null;
      shell.classList.add('is-paused');
    }

    function startAutoplay() {
      stopAutoplay();
      shell.classList.remove('is-paused');
      if (slides.length < 2) return;
      autoplayTimer = window.setInterval(showRandomNext, AUTOPLAY_MS);
    }

    prevBtn.addEventListener('click', () => {
      showPrevious();
      startAutoplay();
    });

    nextBtn.addEventListener('click', () => {
      showRandomNext();
      startAutoplay();
    });

    viewport.addEventListener('mouseenter', stopAutoplay);
    viewport.addEventListener('mouseleave', startAutoplay);
    viewport.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0]?.clientX || 0;
      stopAutoplay();
    }, { passive: true });
    viewport.addEventListener('touchend', (event) => {
      touchEndX = event.changedTouches[0]?.clientX || 0;
      const deltaX = touchEndX - touchStartX;
      if (Math.abs(deltaX) > 44) {
        if (deltaX < 0) showRandomNext();
        else showPrevious();
      }
      startAutoplay();
    }, { passive: true });

    track.addEventListener('click', (event) => {
      const moreBtn = event.target.closest('.memory-carousel-more');
      if (moreBtn) {
        const copyText = moreBtn.closest('.memory-carousel-copy')?.querySelector('.memory-carousel-copy-text');
        if (!copyText) return;
        const expanded = copyText.classList.toggle('is-collapsed');
        moreBtn.textContent = expanded ? 'Ver más' : 'Ver menos';
        return;
      }

      const openGalleryBtn = event.target.closest('.memory-carousel-link');
      if (openGalleryBtn) {
        const slideEl = openGalleryBtn.closest('.memory-carousel-slide');
        const clickedIndex = Number(slideEl?.dataset.slideIndex);
        const slide = slides[clickedIndex];
        if (!slide?.sourceItem) return;

        if (filterPlace && slide.place) {
          const hasOption = Array.from(filterPlace.options).some((option) => option.value === slide.place);
          if (hasOption) {
            filterPlace.value = slide.place;
            filterPlace.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }

        if (searchCaption) {
          searchCaption.value = slide.title || '';
          searchCaption.dispatchEvent(new Event('input', { bubbles: true }));
        }

        gallerySection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      const media = event.target.closest('.memory-carousel-media.is-clickable');
      if (!media) return;
      const slideEl = media.closest('.memory-carousel-slide');
      const clickedIndex = Number(slideEl?.dataset.slideIndex);
      if (!Number.isInteger(clickedIndex)) return;
      const lightboxItems = slides.map((slide) => slide.sourceItem).filter(Boolean);
      if (!lightboxItems.length || typeof window.galleryModule?.openLightbox !== 'function') return;
      window.galleryModule.openLightbox(lightboxItems, clickedIndex);
    });

    eyebrow?.addEventListener('click', () => {
      gallerySection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    window.addEventListener('resize', () => {
      window.requestAnimationFrame(syncNavPosition);
    });

    const initialItems = window.galleryModule?.allItems?.() || [];
    renderSlides(buildMemoryCarouselSlides(initialItems));

    window.addEventListener('superGallery:items', (event) => {
      const nextItems = Array.isArray(event.detail?.items) ? event.detail.items : [];
      renderSlides(buildMemoryCarouselSlides(nextItems));
    });
  }

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
        ? `Llevamos ${diff.years} ${pluralizeCounterLabel(diff.years, 'año', 'años')} juntos`
        : `Llevamos ${diff.totalMonths} ${pluralizeCounterLabel(diff.totalMonths, 'mes', 'meses')} juntos`;

      modalText.textContent = diff.years > 0
        ? `Desde el ${formatCounterStartDate(diff.start)} han pasado ${diff.years} ${pluralizeCounterLabel(diff.years, 'año', 'años')}, ${diff.months} ${pluralizeCounterLabel(diff.months, 'mes', 'meses')}, ${diff.days} ${pluralizeCounterLabel(diff.days, 'día', 'días')} y ${formatCounterClockValue(diff.hours)} horas. Y todavía se siente igual de bonito seguir contando este tiempo contigo.`
        : `Desde el ${formatCounterStartDate(diff.start)} ya van ${diff.totalMonths} ${pluralizeCounterLabel(diff.totalMonths, 'mes', 'meses')}, ${diff.days} ${pluralizeCounterLabel(diff.days, 'día', 'días')} y ${formatCounterClockValue(diff.hours)} horas desde que nos hicimos novios. Cada segundo contigo le suma algo lindo a mi vida.`;

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
    }

    function openModal() {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
    }

    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      setMobileOpen();
    });

    panel.addEventListener('click', () => {
      if (mobileQuery.matches && !root.classList.contains('is-open')) {
        setMobileOpen(true);
        return;
      }
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
    try { initMemoryCarousel(); } catch(e) { console.error('Error inicializando carrusel de recuerdos:', e); }
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
