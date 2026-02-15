/**
 * app.js (REFACTORIZADO CON MÓDULOS)
 * Archivo principal: importa e inicializa todos los módulos
 * 
 * Módulos utilizados:
 * - messages.js       → Arrays de mensajes y renderizado de tarjetas
 * - gallery.js        → Super galería (upload, filtros, lightbox, álbumes)
 * - calendar.js       → Sistema de 365 días
 * - printGallery.js   → Galería de fotos de impresión
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==============================================
  // INICIALIZAR MÓDULOS
  // ==============================================

  // 1. Renderizar tarjetas de mensajes
  try {
    window.messagesModule?.renderMessageLists?.();
  } catch(e) {
    console.error("Error en messages module:", e);
  }

  // 2. Inicializar galería de super fotos
  try {
    window.galleryModule?.initGallery?.();
  } catch(e) {
    console.error("Error en gallery module:", e);
  }

  // 3. Inicializar calendario de 365 días
  try {
    window.calendarModule?.initCalendar?.();
  } catch(e) {
    console.error("Error en calendar module:", e);
  }

  // 4. Inicializar galería de impresión
  try {
    window.printGalleryModule?.initPrintGallery?.();
  } catch(e) {
    console.error("Error en printGallery module:", e);
  }

  // ==============================================
  // FUNCIONALIDAD AUXILIAR
  // ==============================================

  // Modal "100 Razones"
  const btn100Reasons = document.getElementById('btn-random-bday');
  if (btn100Reasons) {
    btn100Reasons.addEventListener('click', show100ReasonsModal);
  }

  /**
   * Muestra modal de "100 Razones" con todas las razones del array
   */
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

    // Cerrar modal
    const closeBtn = modal.querySelector('.close-popup');
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Animación de entrada
    setTimeout(() => modal.classList.add('show'), 10);
  }

  /**
   * Confeti pequeño para celebraciones
   */
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
          p.vy += 0.1; // gravedad

          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
          activeCount++;
        }
      });

      if (activeCount > 0) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    };

    animate();
  };

  /**
   * Modal genérico para mostrar mensajes
   */
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

    const closeBtn = modal.querySelector('.close-popup');
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    setTimeout(() => modal.classList.add('show'), 10);
  };
});
