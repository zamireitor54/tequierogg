/**
 * app.js
 * Inicialización general de la página y helpers visuales.
 */
(function(){
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

    const specialMessageBanner = document.getElementById('special-message-banner');
    if (specialMessageBanner) {
      specialMessageBanner.innerHTML = '';
      specialMessageBanner.style.display = 'none';
    }

    document.getElementById('btn-random-bday')?.addEventListener('click', show100ReasonsModal);
  });
})();
