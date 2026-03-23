// ── Time-based personalization
(function() {
  const hour = new Date().getHours();
  const el = document.getElementById('timeGreeting');
  let greeting = '';
  if (hour >= 6 && hour < 13) greeting = 'Buenos días';
  else if (hour >= 13 && hour < 20) greeting = 'Buenas tardes';
  else greeting = 'Buenas noches';
  el.textContent = greeting + '. Bienvenido a la experiencia.';
})();

// ── Scroll reveal
const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));

// ── Nav scroll
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (window.scrollY > 80) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
  lastScroll = window.scrollY;
}, { passive: true });

// ── Sector picker
function showSector(sector) {
  document.querySelectorAll('.sector-card').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.sector-content').forEach(c => c.classList.remove('active'));

  const card = document.querySelector(`[data-sector="${sector}"]`);
  const content = document.getElementById(`sector-${sector}`);
  if (card) card.classList.add('active');
  if (content) {
    content.classList.add('active');
    content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ── Counter animation
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counters = entry.target.querySelectorAll('[data-target]');
      counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          const current = Math.floor(eased * target);

          if (target >= 1000) {
            counter.textContent = current.toLocaleString('es-ES') + '+';
          } else {
            counter.textContent = current;
          }

          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stats-grid').forEach(el => counterObserver.observe(el));

// ── Video player
function toggleVideo() {
  const video = document.getElementById('mainVideo');
  const btn = document.getElementById('playBtn');
  if (video.paused) {
    video.play();
    btn.style.opacity = '0';
    btn.style.pointerEvents = 'none';
    video.controls = true;
  } else {
    video.pause();
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    video.controls = false;
  }
}
document.getElementById('mainVideo').addEventListener('ended', () => {
  const btn = document.getElementById('playBtn');
  btn.style.opacity = '1';
  btn.style.pointerEvents = 'auto';
  document.getElementById('mainVideo').controls = false;
});

// ── Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
