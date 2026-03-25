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
    const remaining = Math.max(0, MIN_PRELOADER - elapsed);
    setTimeout(hidePreloader, remaining);
  });

  // Safety fallback — hide preloader after 5s no matter what
  setTimeout(() => {
    if (!preloader.classList.contains('fade-out')) {
      hidePreloader();
    }
  }, 5000);
})();

// ════════════════════════════════════════════════
// TEXT REVEAL — IntersectionObserver (independent of Three.js)
// ════════════════════════════════════════════════
(function () {
  'use strict';
  const textRevealSections = document.querySelectorAll('.text-reveal');
  if (!textRevealSections.length || !('IntersectionObserver' in window)) return;

  const textObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const words = entry.target.querySelectorAll('.word');
        words.forEach((w, i) => {
          setTimeout(() => w.classList.add('revealed'), i * 120);
        });
        textObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  textRevealSections.forEach(el => textObs.observe(el));

  const closingReveal = document.querySelector('.text-reveal-slow');
  if (closingReveal) {
    textObs.unobserve(closingReveal);
    const closingObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const words = entry.target.querySelectorAll('.word');
          words.forEach((w, i) => {
            setTimeout(() => w.classList.add('revealed'), i * 180);
          });
          closingObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    closingObs.observe(closingReveal);
  }
})();

// ════════════════════════════════════════════════
// THREE.JS GLOBE + CINEMA + VIDEO FEATURES
// ════════════════════════════════════════════════
(function () {
  'use strict';

  // ────────────────────────────────────────────
  // CONFIG
  // ────────────────────────────────────────────
  const COUNTRIES = [
    [40.4, -3.7], [-23.5, -46.6], [-34.6, -58.4], [-33.4, -70.6],
    [4.7, -74.1], [-12.0, -77.0], [19.4, -99.1], [-34.9, -56.2],
    [-25.3, -57.6], [10.5, -66.9], [51.5, -0.1], [48.9, 2.3],
    [52.5, 13.4], [41.9, 12.5], [38.7, -9.1], [59.3, 18.1],
    [1.3, 103.8], [25.3, 55.3], [-26.2, 28.0], [28.6, 77.2],
    [35.7, 139.7], [-33.9, 151.2], [22.3, 114.2], [14.6, 121.0],
    [40.7, -74.0], [45.4, -75.7],
  ];

  // ────────────────────────────────────────────
  // THREE.JS SETUP
  // ────────────────────────────────────────────
  const canvas = document.getElementById('globe');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x040810, 0.08);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 4.5);

  // ────────────────────────────────────────────
  // GLOBE
  // ────────────────────────────────────────────
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const wireMat = new THREE.MeshBasicMaterial({ color: 0xffd102, wireframe: true, transparent: true, opacity: 0.06 });
  globeGroup.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 5), wireMat));

  const glowMat = new THREE.MeshBasicMaterial({ color: 0xffd102, transparent: true, opacity: 0.02 });
  globeGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.48, 32, 32), glowMat));

  // Surface dots
  const DOT_COUNT = 3000;
  const dotPos = new Float32Array(DOT_COUNT * 3);
  for (let i = 0; i < DOT_COUNT; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    dotPos[i * 3] = 1.5 * Math.sin(phi) * Math.cos(theta);
    dotPos[i * 3 + 1] = 1.5 * Math.sin(phi) * Math.sin(theta);
    dotPos[i * 3 + 2] = 1.5 * Math.cos(phi);
  }
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
  const dotMat = new THREE.PointsMaterial({ color: 0xffd102, size: 0.015, transparent: true, opacity: 0.5, sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false });
  globeGroup.add(new THREE.Points(dotGeo, dotMat));

  // Country markers
  function latLngToVec3(lat, lng, r) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
  }

  const mPos = new Float32Array(COUNTRIES.length * 3);
  COUNTRIES.forEach((c, i) => {
    const v = latLngToVec3(c[0], c[1], 1.52);
    mPos[i * 3] = v.x; mPos[i * 3 + 1] = v.y; mPos[i * 3 + 2] = v.z;
  });
  const mGeo = new THREE.BufferGeometry();
  mGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
  const markerMat = new THREE.PointsMaterial({ color: 0xffd102, size: 0.06, transparent: true, opacity: 0.9, sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false });
  globeGroup.add(new THREE.Points(mGeo, markerMat));

  // Orbital rings
  function createRing(radius, count, tiltX, tiltZ, speed) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      pos[i * 3] = radius * Math.cos(a);
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = radius * Math.sin(a);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffd102, size: 0.02, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
    const ring = new THREE.Points(geo, mat);
    ring.rotation.x = tiltX;
    ring.rotation.z = tiltZ;
    ring.userData = { speed, base: pos.slice() };
    return ring;
  }

  const rings = [
    createRing(2.0, 200, 0.3, 0.1, 0.15),
    createRing(2.3, 150, -0.5, 0.3, -0.1),
    createRing(2.6, 120, 0.8, -0.2, 0.08),
  ];
  rings.forEach(r => globeGroup.add(r));

  // Ambient particles
  const AMB = 500;
  const ambPos = new Float32Array(AMB * 3);
  const ambVel = [];
  for (let i = 0; i < AMB; i++) {
    ambPos[i * 3] = (Math.random() - 0.5) * 20;
    ambPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
    ambPos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    ambVel.push({ x: (Math.random() - 0.5) * 0.003, y: (Math.random() - 0.5) * 0.003, z: (Math.random() - 0.5) * 0.003 });
  }
  const ambGeo = new THREE.BufferGeometry();
  ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
  const ambMat = new THREE.PointsMaterial({ color: 0xffd102, size: 0.03, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
  const ambParticles = new THREE.Points(ambGeo, ambMat);
  scene.add(ambParticles);

  // Connection arcs
  const linesMat = new THREE.LineBasicMaterial({ color: 0xffd102, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending });
  function createArc(s, e, seg) {
    const pts = [];
    const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(s.length() * 1.2);
    for (let i = 0; i <= seg; i++) {
      const t = i / seg;
      pts.push(new THREE.Vector3(
        (1 - t) * (1 - t) * s.x + 2 * (1 - t) * t * mid.x + t * t * e.x,
        (1 - t) * (1 - t) * s.y + 2 * (1 - t) * t * mid.y + t * t * e.y,
        (1 - t) * (1 - t) * s.z + 2 * (1 - t) * t * mid.z + t * t * e.z
      ));
    }
    return pts;
  }

  const conns = [[0,1],[0,6],[0,11],[0,14],[0,16],[0,24],[1,2],[6,24],[11,12]];
  const linesGrp = new THREE.Group();
  conns.forEach(([a, b]) => {
    const va = latLngToVec3(COUNTRIES[a][0], COUNTRIES[a][1], 1.52);
    const vb = latLngToVec3(COUNTRIES[b][0], COUNTRIES[b][1], 1.52);
    linesGrp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(createArc(va, vb, 30)), linesMat));
  });
  globeGroup.add(linesGrp);

  // ────────────────────────────────────────────
  // MOUSE PARALLAX
  // ────────────────────────────────────────────
  let mouseX = 0, mouseY = 0, tMouseX = 0, tMouseY = 0;
  document.addEventListener('mousemove', e => {
    tMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    tMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ────────────────────────────────────────────
  // SCROLL STATE
  // ────────────────────────────────────────────
  let scrollProgress = 0;
  const progressBar = document.getElementById('progressBar');

  function updateScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? window.scrollY / max : 0;
    if (progressBar) progressBar.style.width = (scrollProgress * 100) + '%';
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // ────────────────────────────────────────────
  // ANIMATION LOOP
  // ────────────────────────────────────────────
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    mouseX += (tMouseX - mouseX) * 0.05;
    mouseY += (tMouseY - mouseY) * 0.05;

    globeGroup.rotation.y = t * 0.08 + mouseX * 0.3;
    globeGroup.rotation.x = mouseY * 0.15;

    // Scroll-driven camera
    let camZ, camY, camX;
    if (scrollProgress < 0.12) {
      camZ = 4.5; camY = 0; camX = 0;
    } else if (scrollProgress < 0.25) {
      const p = (scrollProgress - 0.12) / 0.13;
      camZ = 4.5 - p * 1.2; camY = p * 0.3; camX = 0;
    } else if (scrollProgress < 0.45) {
      const p = (scrollProgress - 0.25) / 0.2;
      camZ = 3.3 + p * 2; camY = 0.3 - p * 0.3; camX = p * 1.5;
    } else {
      const p = (scrollProgress - 0.45) / 0.55;
      camZ = 5.3 + p * 3; camY = 0; camX = 1.5 - p * 1.5;
    }

    camera.position.x += (camX - camera.position.x) * 0.03;
    camera.position.y += (camY - camera.position.y) * 0.03;
    camera.position.z += (camZ - camera.position.z) * 0.03;
    camera.lookAt(0, 0, 0);

    // Globe opacity — fades earlier since scroll cinema takes over
    const gOp = scrollProgress < 0.35 ? 1 : Math.max(0, 1 - (scrollProgress - 0.35) * 4);
    wireMat.opacity = 0.06 * gOp;
    glowMat.opacity = 0.02 * gOp;
    dotMat.opacity = 0.5 * gOp;
    markerMat.opacity = 0.9 * gOp;
    linesMat.opacity = 0.08 * gOp;
    ambMat.opacity = 0.15 * Math.max(0.3, gOp);
    rings.forEach(r => { r.material.opacity = 0.35 * gOp; });

    // Animate rings
    rings.forEach(ring => {
      const d = ring.userData;
      const pos = ring.geometry.attributes.position.array;
      const count = pos.length / 3;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + t * d.speed;
        const rad = Math.sqrt(d.base[i * 3] * d.base[i * 3] + d.base[i * 3 + 2] * d.base[i * 3 + 2]);
        pos[i * 3] = rad * Math.cos(a);
        pos[i * 3 + 2] = rad * Math.sin(a);
      }
      ring.geometry.attributes.position.needsUpdate = true;
    });

    // Ambient particles
    const ap = ambParticles.geometry.attributes.position.array;
    for (let i = 0; i < AMB; i++) {
      ap[i * 3] += ambVel[i].x;
      ap[i * 3 + 1] += ambVel[i].y;
      ap[i * 3 + 2] += ambVel[i].z;
      if (Math.abs(ap[i * 3]) > 10) ap[i * 3] *= -0.9;
      if (Math.abs(ap[i * 3 + 1]) > 10) ap[i * 3 + 1] *= -0.9;
      if (Math.abs(ap[i * 3 + 2]) > 10) ap[i * 3 + 2] *= -0.9;
    }
    ambParticles.geometry.attributes.position.needsUpdate = true;

    markerMat.size = 0.06 + Math.sin(t * 2) * 0.01;
    renderer.render(scene, camera);
  }
  animate();

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ────────────────────────────────────────────
  // NAV
  // ────────────────────────────────────────────
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // Mobile menu
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => mobileMenu.classList.toggle('open'));
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  // ────────────────────────────────────────────
  // SCROLL REVEAL
  // ────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal-up');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => entry.target.classList.add('visible'), parseInt(delay));
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => obs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // ────────────────────────────────────────────
  // COUNTER ANIMATION
  // ────────────────────────────────────────────
  const counters = document.querySelectorAll('.stat-value[data-target]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animateCounter(entry.target); cObs.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cObs.observe(el));
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

  // ────────────────────────────────────────────
  // CINEMA THEATER — Autoplay on Viewport
  // ────────────────────────────────────────────
  const cinemaVideo = document.getElementById('cinemaVideo');
  const cinemaOverlay = document.getElementById('cinemaPlayOverlay');
  const cinemaPlayBtn = document.getElementById('cinemaPlayBtn');
  const cinemaProgressFill = document.getElementById('cinemaProgressFill');
  const cinemaChapters = document.querySelectorAll('.cinema-ch');

  // Chapter time boundaries in seconds
  // Video: 76s. Ch1: 0-12s, Ch2: 12-50s, Ch3: 50-63s, Ch4: 63-76s
  const CH_TIMES = [0, 12, 50, 63];

  if (cinemaVideo) {
    let isPlaying = false;

    // Try autoplay when visible
    function tryAutoplay() {
      const playPromise = cinemaVideo.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          isPlaying = true;
          if (cinemaOverlay) cinemaOverlay.classList.add('hidden');
        }).catch(() => {
          // Autoplay blocked — show play button
          if (cinemaOverlay) cinemaOverlay.classList.remove('hidden');
        });
      }
    }

    // IntersectionObserver: play when 40% visible, pause when out
    if ('IntersectionObserver' in window) {
      const videoObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isPlaying) {
            tryAutoplay();
          } else if (!entry.isIntersecting && isPlaying) {
            cinemaVideo.pause();
            isPlaying = false;
          }
        });
      }, { threshold: 0.4 });
      videoObs.observe(cinemaVideo);
    }

    // Manual play button fallback — unmute on user-initiated play
    if (cinemaPlayBtn) {
      cinemaPlayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cinemaVideo.muted = false;
        cinemaVideo.play();
        isPlaying = true;
        updateAudioIcon();
        if (cinemaOverlay) cinemaOverlay.classList.add('hidden');
      });
    }
    if (cinemaOverlay) {
      cinemaOverlay.addEventListener('click', () => {
        cinemaVideo.muted = false;
        cinemaVideo.play();
        isPlaying = true;
        updateAudioIcon();
        cinemaOverlay.classList.add('hidden');
      });
    }

    // Pause / Play toggle
    const pauseBtn = document.getElementById('cinemaPauseBtn');
    function updatePauseIcon() {
      if (!pauseBtn) return;
      const pauseIcon = pauseBtn.querySelector('.icon-pause');
      const playIcon = pauseBtn.querySelector('.icon-play');
      if (cinemaVideo.paused) {
        pauseIcon.style.display = 'none';
        playIcon.style.display = '';
        pauseBtn.title = 'Reproducir';
      } else {
        pauseIcon.style.display = '';
        playIcon.style.display = 'none';
        pauseBtn.title = 'Pausar';
      }
    }
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (cinemaVideo.paused) {
          cinemaVideo.play().then(() => {
            isPlaying = true;
            if (cinemaOverlay) cinemaOverlay.classList.add('hidden');
          }).catch(() => {});
        } else {
          cinemaVideo.pause();
          isPlaying = false;
        }
        updatePauseIcon();
      });
    }
    // Click on video itself to toggle pause
    cinemaVideo.addEventListener('click', () => {
      if (cinemaOverlay && !cinemaOverlay.classList.contains('hidden')) return;
      if (cinemaVideo.paused) {
        cinemaVideo.play().then(() => { isPlaying = true; }).catch(() => {});
      } else {
        cinemaVideo.pause();
        isPlaying = false;
      }
      updatePauseIcon();
    });
    cinemaVideo.addEventListener('play', updatePauseIcon);
    cinemaVideo.addEventListener('pause', updatePauseIcon);

    // Audio toggle button
    const audioBtn = document.getElementById('cinemaAudioBtn');
    function updateAudioIcon() {
      if (!audioBtn) return;
      const mutedIcon = audioBtn.querySelector('.icon-muted');
      const soundIcon = audioBtn.querySelector('.icon-sound');
      if (cinemaVideo.muted) {
        mutedIcon.style.display = '';
        soundIcon.style.display = 'none';
        audioBtn.title = 'Activar audio';
      } else {
        mutedIcon.style.display = 'none';
        soundIcon.style.display = '';
        audioBtn.title = 'Silenciar';
      }
    }
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        cinemaVideo.muted = !cinemaVideo.muted;
        // If video isn't playing, start it unmuted
        if (!isPlaying) {
          cinemaVideo.play().then(() => {
            isPlaying = true;
            if (cinemaOverlay) cinemaOverlay.classList.add('hidden');
          }).catch(() => {});
        }
        updateAudioIcon();
      });
    }

    // Chapter cards are clickable — seek to chapter start
    cinemaChapters.forEach((ch, idx) => {
      ch.addEventListener('click', () => {
        if (cinemaVideo.duration) {
          cinemaVideo.currentTime = CH_TIMES[idx];
          if (!isPlaying) {
            cinemaVideo.play();
            isPlaying = true;
            if (cinemaOverlay) cinemaOverlay.classList.add('hidden');
          }
        }
      });
    });

    // Update progress + active chapter on timeupdate
    cinemaVideo.addEventListener('timeupdate', () => {
      if (!cinemaVideo.duration) return;
      const t = cinemaVideo.currentTime;
      const progress = (t / cinemaVideo.duration) * 100;

      if (cinemaProgressFill) cinemaProgressFill.style.width = progress + '%';

      // Active chapter
      let activeIdx = 0;
      for (let i = CH_TIMES.length - 1; i >= 0; i--) {
        if (t >= CH_TIMES[i]) { activeIdx = i; break; }
      }

      cinemaChapters.forEach((ch, i) => {
        ch.classList.toggle('active', i === activeIdx);
        ch.classList.toggle('passed', i < activeIdx);
      });
    });

    // When video ends, show replay
    cinemaVideo.addEventListener('ended', () => {
      isPlaying = false;
      if (cinemaOverlay) cinemaOverlay.classList.remove('hidden');
      cinemaChapters.forEach(ch => {
        ch.classList.remove('active');
        ch.classList.add('passed');
      });
    });
  }

  // ────────────────────────────────────────────
  // VIDEO SEEK — Click/Touch on progress bar
  // ────────────────────────────────────────────
  const cinemaProgress = document.getElementById('cinemaProgress');
  const cinemaTooltip = document.getElementById('cinemaTimeTooltip');

  if (cinemaProgress && cinemaVideo) {
    let isDragging = false;

    function seekToPosition(clientX) {
      const rect = cinemaProgress.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      if (cinemaVideo.duration) {
        cinemaVideo.currentTime = ratio * cinemaVideo.duration;
      }
    }

    function formatTime(seconds) {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function updateTooltip(clientX) {
      if (!cinemaTooltip || !cinemaVideo.duration) return;
      const rect = cinemaProgress.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const time = ratio * cinemaVideo.duration;
      cinemaTooltip.textContent = formatTime(time);
      cinemaTooltip.style.left = (ratio * 100) + '%';
    }

    // Click seek
    cinemaProgress.addEventListener('click', (e) => {
      seekToPosition(e.clientX);
    });

    // Drag seek
    cinemaProgress.addEventListener('mousedown', (e) => {
      isDragging = true;
      seekToPosition(e.clientX);
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (isDragging) seekToPosition(e.clientX);
      // Update tooltip on hover regardless
      if (cinemaProgress.matches(':hover') || isDragging) {
        updateTooltip(e.clientX);
      }
    });
    document.addEventListener('mouseup', () => { isDragging = false; });

    // Hover tooltip
    cinemaProgress.addEventListener('mousemove', (e) => {
      updateTooltip(e.clientX);
    });

    // Touch seek
    cinemaProgress.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      seekToPosition(touch.clientX);
      e.preventDefault();
    }, { passive: false });
    cinemaProgress.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      seekToPosition(touch.clientX);
    }, { passive: true });
  }

  // ────────────────────────────────────────────
  // FULLSCREEN — Mobile video expand
  // ────────────────────────────────────────────
  const fullscreenBtn = document.getElementById('cinemaFullscreenBtn');
  if (fullscreenBtn && cinemaVideo) {
    fullscreenBtn.addEventListener('click', () => {
      if (cinemaVideo.requestFullscreen) {
        cinemaVideo.requestFullscreen();
      } else if (cinemaVideo.webkitEnterFullscreen) {
        cinemaVideo.webkitEnterFullscreen();
      } else if (cinemaVideo.webkitRequestFullscreen) {
        cinemaVideo.webkitRequestFullscreen();
      }
    });
  }

  // ────────────────────────────────────────────
  // DYNAMIC VIDEO GLOW — Canvas color sampling (desktop)
  // ────────────────────────────────────────────
  if (cinemaVideo && window.innerWidth > 1024) {
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 4;
    glowCanvas.height = 3;
    const glowCtx = glowCanvas.getContext('2d', { willReadFrequently: true });
    const cinemaScreen = document.querySelector('.cinema-screen');
    let glowInterval = null;

    function sampleVideoColor() {
      if (!cinemaVideo || cinemaVideo.paused || cinemaVideo.ended || !glowCtx) return;
      try {
        glowCtx.drawImage(cinemaVideo, 0, 0, 4, 3);
        const data = glowCtx.getImageData(0, 0, 4, 3).data;
        let r = 0, g = 0, b = 0;
        const pixels = 12;
        for (let i = 0; i < pixels; i++) {
          r += data[i * 4];
          g += data[i * 4 + 1];
          b += data[i * 4 + 2];
        }
        r = Math.round(r / pixels);
        g = Math.round(g / pixels);
        b = Math.round(b / pixels);
        // Boost brightness slightly for glow visibility
        const boost = 1.3;
        r = Math.min(255, Math.round(r * boost));
        g = Math.min(255, Math.round(g * boost));
        b = Math.min(255, Math.round(b * boost));
        if (cinemaScreen) {
          cinemaScreen.style.setProperty('--glow-color', `rgba(${r}, ${g}, ${b}, 0.15)`);
          cinemaScreen.classList.add('dynamic-glow');
        }
      } catch (e) {
        // CORS or other error — fall back to CSS glow
        if (glowInterval) clearInterval(glowInterval);
      }
    }

    cinemaVideo.addEventListener('play', () => {
      if (!glowInterval) {
        glowInterval = setInterval(sampleVideoColor, 500);
      }
    });
    cinemaVideo.addEventListener('pause', () => {
      if (glowInterval) { clearInterval(glowInterval); glowInterval = null; }
      // Revert to CSS glow
      if (cinemaScreen) {
        cinemaScreen.classList.remove('dynamic-glow');
        cinemaScreen.style.removeProperty('--glow-color');
      }
    });
    cinemaVideo.addEventListener('ended', () => {
      if (glowInterval) { clearInterval(glowInterval); glowInterval = null; }
      if (cinemaScreen) {
        cinemaScreen.classList.remove('dynamic-glow');
        cinemaScreen.style.removeProperty('--glow-color');
      }
    });
  }

  // ────────────────────────────────────────────
  // SMOOTH ANCHOR SCROLL
  // ────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


})();
