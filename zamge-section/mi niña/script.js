// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Configurar evento para la pantalla de bienvenida (click + touch)
    const welcome = document.getElementById('welcome-screen');
    if (welcome) {
        console.log('welcome element found, attaching click and touchstart listeners');
        // List loaded stylesheets to help debug 404 issues
        try {
            const sheets = Array.from(document.styleSheets).map(s => s.href || '(inline)');
            console.log('document.styleSheets:', sheets);
        } catch (e) {
            console.warn('Could not read document.styleSheets', e);
        }
        // Handler que se puede llamar tanto por click como por touch
        const welcomeHandler = function handler(evt) {
            console.log('welcomeHandler fired, event type:', evt.type);
            // Evitar que touch y click doble dispare
            evt.preventDefault && evt.preventDefault();
            // Remover listeners para evitar múltiples ejecuciones
            welcome.removeEventListener('click', welcomeHandler);
            welcome.removeEventListener('touchstart', welcomeHandler);

            welcome.classList.add('hidden');
            const main = document.getElementById('main-content');
            if (main) main.classList.remove('hidden');
            showSection('birthday-section');
            // Intentar iniciar confeti de forma segura
            try {
                startConfetti();
            } catch (e) {
                // Si ocurre un error con el confeti, no bloquear la interacción
                console.warn('Confetti failed to start:', e);
            }
            // Pequeña señal visual para depuración: parpadeo rápido
            try {
                const oldOpacity = welcome.style.opacity;
                welcome.style.opacity = '0.6';
                setTimeout(() => {
                    welcome.style.opacity = oldOpacity || '';
                }, 180);
            } catch (e) {
                /* ignore style errors */
            }

            // Verificar si la clase .hidden realmente ocultó el elemento (si styles.css no cargó, .hidden puede no estar definida)
            setTimeout(() => {
                try {
                    const welcomeDisplay = window.getComputedStyle(welcome).display;
                    const mainDisplay = main ? window.getComputedStyle(main).display : 'unknown';
                    console.log('Computed display after adding .hidden -> welcome:', welcomeDisplay, 'main:', mainDisplay);
                    if (welcomeDisplay !== 'none') {
                        console.warn('.hidden class did not hide the welcome element. Forzando estilos inline como fallback. Revisa en Network si styles.css devolvió 404.');
                        welcome.style.display = 'none';
                        if (main) main.style.display = 'block';
                    }
                } catch (e) {
                    console.warn('Error checking computed styles:', e);
                }
            }, 60);
        };

        welcome.addEventListener('click', welcomeHandler, { passive: false });
        welcome.addEventListener('touchstart', welcomeHandler, { passive: false });
    }

    // Inicializar confeti (defensivamente)
    try {
        initConfetti();
    } catch (e) {
        console.warn('Failed to initialize confetti:', e);
    }
});

// Función para mostrar una sección específica
function showSection(sectionId) {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección solicitada
    document.getElementById(sectionId).classList.add('active');
    
    // Desplazar hacia arriba para una mejor experiencia
    window.scrollTo(0, 0);
}

// Función para reiniciar la experiencia
function restartExperience() {
    showSection('birthday-section');
    
    // Efecto especial de confeti al reiniciar
    burstConfetti();
}

// Sistema de confeti
let confettiCanvas, confettiCtx;
let confettiParticles = [];
const confettiColors = ['#e6a8d7', '#d8bfd8', '#8b4789', '#ffffff'];

function initConfetti() {
    confettiCanvas = document.getElementById('confetti-canvas');
    confettiCtx = confettiCanvas.getContext('2d');
    
    // Ajustar tamaño del canvas
    function resizeCanvas() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

function startConfetti() {
    // Crear partículas de confeti iniciales
    for (let i = 0; i < 100; i++) {
        createConfettiParticle();
    }
    
    // Iniciar animación
    animateConfetti();
}

function burstConfetti() {
    // Crear explosión de confeti
    for (let i = 0; i < 150; i++) {
        createConfettiParticle();
    }
}

function createConfettiParticle() {
    const size = Math.random() * 10 + 5;
    const x = Math.random() * confettiCanvas.width;
    const y = -size;
    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    
    confettiParticles.push({
        x: x,
        y: y,
        size: size,
        color: color,
        speed: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5
    });
}

function animateConfetti() {
    // Limpiar canvas
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    // Actualizar y dibujar partículas
    for (let i = 0; i < confettiParticles.length; i++) {
        const p = confettiParticles[i];
        
        // Actualizar posición
        p.y += p.speed;
        p.rotation += p.rotationSpeed;
        
        // Dibujar partícula
        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate(p.rotation * Math.PI / 180);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        confettiCtx.restore();
        
        // Eliminar partículas que salen de la pantalla
        if (p.y > confettiCanvas.height) {
            confettiParticles.splice(i, 1);
            i--;
        }
    }
    
    // Continuar animación si hay partículas
    if (confettiParticles.length > 0) {
        requestAnimationFrame(animateConfetti);
    }
}

// Efectos especiales para mensajes
document.addEventListener('DOMContentLoaded', function() {
    // Agregar efecto de aparición a los mensajes
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar todos los elementos con efecto de aparición
    const animatedElements = document.querySelectorAll('.message-card, .support-card, .reason-item, .memory-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
});