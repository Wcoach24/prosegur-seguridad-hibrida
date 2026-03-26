/* ═══════════════════════════════════════════════
   PROSEGUR — SEGURIDAD HÍBRIDA V6
   Three.js Globe + Scroll Cinema + WOW Effects
   ═══════════════════════════════════════════════ */

// ════════════════════════════════════════════════
// PRELOADER — Runs immediately, independent of Three.js
// ════════════════════════════════════════════════
(function () {
  'use strict';
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const MIN_PRELOADER = 2500;
  const preloaderStart = performance.now();

  function revealHeroText() {
    const badge = document.querySelector('.hero-badge');
    if (badge) {
      badge.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      badge.style.opacity = '1';
      badge.style.transform = 'translateY(0)';
    }
    const heroWords = document.querySelectorAll('.hero-title .word');
    heroWords.forEach((w, i) => {
      setTimeout(() => w.classList.add('revealed'), i * 200);
    });
    const heroSub = document.querySelector('.hero-sub');
    if (heroSub) {
      heroSub.style.opacity = '0';
      heroSub.style.transform = 'translateY(15px)';
      heroSub.style.transition = 'opacity 0.6s ease 0.6s, transform 0.6s ease 0.6s';
      requestAnimationFrame(() => {
        heroSub.style.opacity = '1';
        heroSub.style.transform = 'translateY(0)';
      });
    }
  }

  function hidePreloader() {
    preloader.classList.add('fade-out');
    document.body.classList.remove('loading');
    setTimeout(() => {
      preloader.style.display = 'none';
      revealHeroText();
    }, 600);
  }

  const loadPromise = new Promise(resolve => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });
  const fontsPromise = document.fonts ? document.fonts.ready : Promise.resolve();

  Promise.all([loadPromise, fontsPromise]).then(() => {
    const elapsed = performance.now() - preloaderStart;
    const remainingDelay = Math.max(0, MIN_PRELOADER - elapsed);
    setTimeout(hidePreloader, remainingDelay);
  });
})();

// ════════════════════════════════════════════════
// UTILITY: debounce
// ════════════════════════════════════════════════
function debounce(fn, ms = 150) {
  let tid;
  return (...args) => {
    clearTimeout(tid);
    tid = setTimeout(() => fn(...args), ms);
  };
}

// ════════════════════════════════════════════════
// SCROLL PROGRESS BAR
// ════════════════════════════════════════════════
(function () {
  const progressBar = document.querySelector('.progress-bar');
  if (!progressBar) return;
  function updateProgress() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / docHeight) * 100;
    progressBar.style.width = progress + '%';
  }
  window.addEventListener('scroll', debounce(updateProgress, 50));
})();

// ════════════════════════════════════════════════
// NAVIGATION SCROLL CLASS
// ════════════════════════════════════════════════
(function () {
  const nav = document.querySelector('nav');
  if (!nav) return;
  function updateNavClass() {
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', debounce(updateNavClass, 50));
})();

// ════════════════════════════════════════════════
// MOBILE MENU TOGGLE
// ════════════════════════════════════════════════
(function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!menuToggle || !mobileMenu) return;
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  });
})();

// ════════════════════════════════════════════════
// INTERSECTION OBSERVER FOR REVEAL ANIMATIONS
// ════════════════════════════════════════════════
(function () {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.reveal-up').forEach(el => {
    observer.observe(el);
  });
})();

// ════════════════════════════════════════════════
// WORD INDEX FOR STAGGER ANIMATIONS
// ════════════════════════════════════════════════
(function () {
  document.querySelectorAll('.word').forEach(word => {
    const index = word.parentElement.querySelectorAll('.word').indexOf(word);
    word.style.setProperty('--i', index);
  });
})();

// ════════════════════════════════════════════════
// MOBILE TEXT REVEAL (CSS-driven @keyframes)
// ════════════════════════════════════════════════
(function () {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (!isMobile) return;

  const textRevealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('words-revealed');
        }
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll('.text-reveal, .text-reveal-slow').forEach(container => {
    textRevealObserver.observe(container);
  });
})();

// ════════════════════════════════════════════════
// CINEMA THEATER — VIDEO CONTROLS
// ════════════════════════════════════════════════
(function () {
  const videos = document.querySelectorAll('.cinema-screen video');
  if (videos.length === 0) return;

  videos.forEach(video => {
    const screen = video.closest('.cinema-screen');
    if (!screen) return;

    const overlay = screen.querySelector('.cinema-play-overlay');
    const pauseBtn = screen.querySelector('.cinema-pause-btn');
    const audioBtn = screen.querySelector('.cinema-audio-btn');
    const progressBar = screen.querySelector('.cinema-progress');
    const progressFill = screen.querySelector('.cinema-progress-fill');
    const tooltip = screen.querySelector('.cinema-time-tooltip');

    if (!overlay || !pauseBtn || !audioBtn || !progressBar) return;

    // Play/pause on overlay click
    overlay.addEventListener('click', e => {
      e.stopPropagation();
      if (video.paused) {
        video.play();
        overlay.classList.add('hidden');
      }
    });

    // Pause button
    pauseBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (video.paused) {
        video.play();
        overlay.classList.add('hidden');
      } else {
        video.pause();
        overlay.classList.remove('hidden');
      }
    });

    // Audio button
    audioBtn.addEventListener('click', e => {
      e.stopPropagation();
      video.muted = !video.muted;
      audioBtn.classList.toggle('muted', video.muted);
    });

    // Update progress bar
    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        if (progressFill) progressFill.style.width = progress + '%';
      }
    });

    // Seek on progress bar click
    progressBar.addEventListener('click', e => {
      const rect = progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      video.currentTime = percent * video.duration;
    });

    // Update tooltip on mouse move
    progressBar.addEventListener('mousemove', e => {
      if (!tooltip) return;
      const rect = progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const time = percent * video.duration;
      const mins = Math.floor(time / 60);
      const secs = Math.floor(time % 60);
      tooltip.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      tooltip.style.left = e.clientX - rect.left + 'px';
    });
  });
})();

// ════════════════════════════════════════════════
// CINEMA CHAPTER TRACKING
// ════════════════════════════════════════════════
(function () {
  const chapters = document.querySelectorAll('.cinema-ch');
  if (chapters.length === 0) return;

  const videos = document.querySelectorAll('.cinema-screen video');
  if (videos.length === 0) return;

  const video = videos[0]; // Assume first video for now

  // Parse chapter timestamps (assumes a data-* attribute)
  const chapterTimes = Array.from(chapters).map((ch, i) => {
    const time = parseInt(ch.dataset.time || (video.duration ? (video.duration / chapters.length) * i : 0), 10);
    return time;
  });

  function updateChapters() {
    const currentTime = video.currentTime;
    chapters.forEach((ch, i) => {
      const nextTime = chapterTimes[i + 1] || video.duration;
      const isActive = currentTime >= chapterTimes[i] && currentTime < nextTime;
      const isPassed = currentTime >= chapterTimes[i];
      ch.classList.toggle('active', isActive);
      ch.classList.toggle('passed', isPassed);
    });
  }

  // Make chapters clickable
  chapters.forEach((ch, i) => {
    ch.addEventListener('click', () => {
      video.currentTime = chapterTimes[i];
      video.play();
      const overlay = video.closest('.cinema-screen').querySelector('.cinema-play-overlay');
      if (overlay) overlay.classList.add('hidden');
    });
  });

  video.addEventListener('timeupdate', debounce(updateChapters, 50));
})();

// ════════════════════════════════════════════════
// MOBILE SLIDERS — Ecosystem & Sectors
// ════════════════════════════════════════════════
(function () {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (!isMobile) return;

  // Ecosystem slider
  const ecoGrid = document.querySelector('.eco-grid');
  if (ecoGrid) {
    const cards = ecoGrid.querySelectorAll('.eco-card');
    const wrapper = ecoGrid.parentElement;

    // Create dot container if it doesn't exist
    if (!wrapper.querySelector('.slider-dots')) {
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'slider-dots';
      cards.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'slider-dot';
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
          cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
        dotsContainer.appendChild(dot);
      });
      wrapper.appendChild(dotsContainer);
    }

    // Update dots on scroll
    const updateDots = debounce(() => {
      const dots = wrapper.querySelectorAll('.slider-dot');
      let closestIndex = 0;
      let closestDistance = Infinity;

      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === closestIndex);
      });
    }, 100);

    ecoGrid.addEventListener('scroll', updateDots);

    // Auto-nudge on first intersection
    const observeNudge = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && ecoGrid.scrollLeft === 0) {
            setTimeout(() => {
              ecoGrid.scrollBy({ left: 60, behavior: 'smooth' });
            }, 300);
            observeNudge.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    observeNudge.observe(ecoGrid);
  }

  // Sectors slider
  const sectorCards = document.querySelector('.sector-cards');
  if (sectorCards) {
    const cards = sectorCards.querySelectorAll('.sector-card');
    const wrapper = sectorCards.parentElement;

    // Create dot container if it doesn't exist
    if (!wrapper.querySelector('.slider-dots')) {
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'slider-dots';
      cards.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'slider-dot';
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
          cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
        dotsContainer.appendChild(dot);
      });
      wrapper.appendChild(dotsContainer);
    }

    // Update dots on scroll
    const updateDots = debounce(() => {
      const dots = wrapper.querySelectorAll('.slider-dot');
      let closestIndex = 0;
      let closestDistance = Infinity;

      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === closestIndex);
      });
    }, 100);

    sectorCards.addEventListener('scroll', updateDots);

    // Auto-nudge on first intersection
    const observeNudge = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && sectorCards.scrollLeft === 0) {
            setTimeout(() => {
              sectorCards.scrollBy({ left: 60, behavior: 'smooth' });
            }, 300);
            observeNudge.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    observeNudge.observe(sectorCards);
  }
})();

// ════════════════════════════════════════════════
// THREE.JS GLOBE (Desktop only)
// ════════════════════════════════════════════════
(function () {
  // Only on desktop
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const canvas = document.getElementById('globe');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);

  // Geometry
  const geometry = new THREE.IcosahedronGeometry(1, 4);
  const material = new THREE.MeshPhongMaterial({
    color: 0xffd102,
    emissive: 0x663300,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  });
  const globe = new THREE.Mesh(geometry, material);
  scene.add(globe);

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(5, 3, 5);
  scene.add(light);
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  camera.position.z = 2.5;

  // Animation
  function animate() {
    requestAnimationFrame(animate);
    globe.rotation.x += 0.0002;
    globe.rotation.y += 0.0005;
    renderer.render(scene, camera);
  }
  animate();

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();