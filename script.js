/* ═══════════════════════════════════════════════
   PROSEGUR — SEGURIDAD HÍBRIDA
   Interactive Script — Particles + Scroll + Cinema
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Particle Network ──
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;
    const PARTICLE_COUNT = 60;
    const CONNECTION_DIST = 150;
    const YELLOW = { r: 255, g: 209, b: 2 };

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          r: Math.random() * 2 + 1,
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${YELLOW.r},${YELLOW.g},${YELLOW.b},0.6)`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${YELLOW.r},${YELLOW.g},${YELLOW.b},${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawParticles);
    }

    resize();
    initParticles();
    drawParticles();
    window.addEventListener('resize', () => { resize(); initParticles(); });
  }

  // ── Nav Scroll ──
  const nav = document.getElementById('nav');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', scroll > 50);
    lastScroll = scroll;
  }, { passive: true });

  // ── Scroll Reveal (IntersectionObserver) ──
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  // ── Counter Animation ──
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => counterObserver.observe(el));
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const decimals = parseInt(el.dataset.decimals) || 0;
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      if (decimals > 0) {
        el.textContent = prefix + current.toFixed(decimals) + suffix;
      } else {
        el.textContent = prefix + Math.floor(current).toLocaleString('es-ES') + suffix;
      }

      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ── Sector Tabs ──
  const sectorTabs = document.querySelectorAll('.sector-tab');
  const sectorContents = document.querySelectorAll('.sector-content');

  sectorTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const sector = tab.dataset.sector;
      sectorTabs.forEach((t) => t.classList.remove('active'));
      sectorContents.forEach((c) => c.classList.remove('active'));
      tab.classList.add('active');
      const target = document.querySelector(`.sector-content[data-sector="${sector}"]`);
      if (target) target.classList.add('active');
    });
  });

  // ── Cinema Video Player ──
  const video = document.getElementById('cinemaVideo');
  const overlay = document.getElementById('cinemaOverlay');
  const progressBar = document.getElementById('cinemaProgress');
  const progressFill = document.getElementById('cinemaProgressFill');
  const timeDisplay = document.getElementById('cinemaTime');
  const playPauseBtn = document.getElementById('cinemaPlayPause');
  const fsBtn = document.getElementById('cinemaFS');

  if (video && overlay) {
    overlay.addEventListener('click', () => {
      video.play();
      overlay.classList.add('hidden');
    });

    playPauseBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        overlay.classList.add('hidden');
      } else {
        video.pause();
      }
    });

    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        const pct = (video.currentTime / video.duration) * 100;
        progressFill.style.width = pct + '%';
        timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
      }
    });

    video.addEventListener('ended', () => {
      overlay.classList.remove('hidden');
      progressFill.style.width = '0%';
    });

    video.addEventListener('play', () => {
      playPauseBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    });

    video.addEventListener('pause', () => {
      playPauseBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>';
    });

    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      video.currentTime = pct * video.duration;
    });

    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        const wrapper = document.querySelector('.cinema-wrapper');
        if (wrapper.requestFullscreen) wrapper.requestFullscreen();
        else if (wrapper.webkitRequestFullscreen) wrapper.webkitRequestFullscreen();
      });
    }
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
