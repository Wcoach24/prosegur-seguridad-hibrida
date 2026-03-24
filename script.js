/* ═══════════════════════════════════════════════
   PROSEGUR — SEGURIDAD HÍBRIDA
   Globe Experience V3 — Three.js + Scroll Cinema
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  // ────────────────────────────────────────────
  // CONFIG
  // ────────────────────────────────────────────
  const GOLD = new THREE.Color(0xffd102);
  const GOLD_DIM = new THREE.Color(0x997d01);
  const WHITE_DIM = new THREE.Color(0x999999);
  const DARK = new THREE.Color(0x0a0a0a);

  // Prosegur presence: 26 countries (lat, lng)
  const COUNTRIES = [
    [40.4, -3.7],   // España (HQ)
    [-23.5, -46.6], // Brasil
    [-34.6, -58.4], // Argentina
    [-33.4, -70.6], // Chile
    [4.7, -74.1],   // Colombia
    [-12.0, -77.0], // Perú
    [19.4, -99.1],  // México
    [-34.9, -56.2], // Uruguay
    [-25.3, -57.6], // Paraguay
    [10.5, -66.9],  // Venezuela
    [51.5, -0.1],   // UK
    [48.9, 2.3],    // Francia
    [52.5, 13.4],   // Alemania
    [41.9, 12.5],   // Italia
    [38.7, -9.1],   // Portugal
    [59.3, 18.1],   // Suecia
    [1.3, 103.8],   // Singapur
    [25.3, 55.3],   // EAU
    [-26.2, 28.0],  // Sudáfrica
    [28.6, 77.2],   // India
    [35.7, 139.7],  // Japón
    [-33.9, 151.2], // Australia
    [22.3, 114.2],  // Hong Kong
    [14.6, 121.0],  // Filipinas
    [40.7, -74.0],  // USA
    [45.4, -75.7],  // Canadá
  ];

  // ────────────────────────────────────────────
  // THREE.JS SETUP
  // ────────────────────────────────────────────
  const canvas = document.getElementById('globe');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.08);

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 4.5);

  // ────────────────────────────────────────────
  // GLOBE WIREFRAME (Icosahedron)
  // ────────────────────────────────────────────
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // Wireframe sphere
  const wireGeo = new THREE.IcosahedronGeometry(1.5, 5);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffd102,
    wireframe: true,
    transparent: true,
    opacity: 0.06,
  });
  const wireMesh = new THREE.Mesh(wireGeo, wireMat);
  globeGroup.add(wireMesh);

  // Solid inner glow sphere
  const glowGeo = new THREE.SphereGeometry(1.48, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffd102,
    transparent: true,
    opacity: 0.02,
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  globeGroup.add(glowMesh);

  // ────────────────────────────────────────────
  // GLOBE DOTS (Surface particles)
  // ────────────────────────────────────────────
  const DOT_COUNT = 3000;
  const dotPositions = new Float32Array(DOT_COUNT * 3);
  const dotSizes = new Float32Array(DOT_COUNT);

  for (let i = 0; i < DOT_COUNT; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = 1.5;
    dotPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    dotPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    dotPositions[i * 3 + 2] = r * Math.cos(phi);
    dotSizes[i] = Math.random() * 2 + 0.5;
  }

  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
  dotGeo.setAttribute('size', new THREE.BufferAttribute(dotSizes, 1));

  const dotMat = new THREE.PointsMaterial({
    color: 0xffd102,
    size: 0.015,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const dots = new THREE.Points(dotGeo, dotMat);
  globeGroup.add(dots);

  // ────────────────────────────────────────────
  // COUNTRY MARKERS
  // ────────────────────────────────────────────
  function latLngToVec3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  const markerPositions = new Float32Array(COUNTRIES.length * 3);
  const markerSizes = new Float32Array(COUNTRIES.length);

  COUNTRIES.forEach((c, i) => {
    const v = latLngToVec3(c[0], c[1], 1.52);
    markerPositions[i * 3] = v.x;
    markerPositions[i * 3 + 1] = v.y;
    markerPositions[i * 3 + 2] = v.z;
    markerSizes[i] = i === 0 ? 6 : 3; // Spain (HQ) is larger
  });

  const markerGeo = new THREE.BufferGeometry();
  markerGeo.setAttribute('position', new THREE.BufferAttribute(markerPositions, 3));

  const markerMat = new THREE.PointsMaterial({
    color: 0xffd102,
    size: 0.06,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const markers = new THREE.Points(markerGeo, markerMat);
  globeGroup.add(markers);

  // ────────────────────────────────────────────
  // ORBITAL RINGS (Halo Dorado)
  // ────────────────────────────────────────────
  function createOrbitalRing(radius, particleCount, tiltX, tiltZ, speed) {
    const positions = new Float32Array(particleCount * 3);
    const geo = new THREE.BufferGeometry();

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      positions[i * 3] = radius * Math.cos(angle);
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = radius * Math.sin(angle);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffd102,
      size: 0.02,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const ring = new THREE.Points(geo, mat);
    ring.rotation.x = tiltX;
    ring.rotation.z = tiltZ;
    ring.userData = { speed, basePositions: positions.slice() };
    return ring;
  }

  const rings = [
    createOrbitalRing(2.0, 200, 0.3, 0.1, 0.15),
    createOrbitalRing(2.3, 150, -0.5, 0.3, -0.1),
    createOrbitalRing(2.6, 120, 0.8, -0.2, 0.08),
  ];
  rings.forEach((r) => globeGroup.add(r));

  // ────────────────────────────────────────────
  // AMBIENT PARTICLES (Background)
  // ────────────────────────────────────────────
  const AMB_COUNT = 500;
  const ambPositions = new Float32Array(AMB_COUNT * 3);
  const ambVelocities = [];

  for (let i = 0; i < AMB_COUNT; i++) {
    ambPositions[i * 3] = (Math.random() - 0.5) * 20;
    ambPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    ambPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    ambVelocities.push({
      x: (Math.random() - 0.5) * 0.003,
      y: (Math.random() - 0.5) * 0.003,
      z: (Math.random() - 0.5) * 0.003,
    });
  }

  const ambGeo = new THREE.BufferGeometry();
  ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPositions, 3));

  const ambMat = new THREE.PointsMaterial({
    color: 0xffd102,
    size: 0.03,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const ambParticles = new THREE.Points(ambGeo, ambMat);
  scene.add(ambParticles);

  // ────────────────────────────────────────────
  // CONNECTION LINES between nearby countries
  // ────────────────────────────────────────────
  const linesMat = new THREE.LineBasicMaterial({
    color: 0xffd102,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
  });

  // Create curved arcs between connected countries
  function createArc(start, end, segments) {
    const points = [];
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(start.length() * 1.2); // curve outward

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = new THREE.Vector3();
      p.x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * mid.x + t * t * end.x;
      p.y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * mid.y + t * t * end.y;
      p.z = (1 - t) * (1 - t) * start.z + 2 * (1 - t) * t * mid.z + t * t * end.z;
      points.push(p);
    }
    return points;
  }

  // Connect HQ (Spain) to a few key locations
  const connections = [
    [0, 1],  // España → Brasil
    [0, 6],  // España → México
    [0, 11], // España → Francia
    [0, 14], // España → Portugal
    [0, 16], // España → Singapur
    [0, 24], // España → USA
    [1, 2],  // Brasil → Argentina
    [6, 24], // México → USA
    [11, 12], // Francia → Alemania
  ];

  const linesGroup = new THREE.Group();
  connections.forEach(([a, b]) => {
    const va = latLngToVec3(COUNTRIES[a][0], COUNTRIES[a][1], 1.52);
    const vb = latLngToVec3(COUNTRIES[b][0], COUNTRIES[b][1], 1.52);
    const arcPoints = createArc(va, vb, 30);
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const line = new THREE.Line(arcGeo, linesMat);
    linesGroup.add(line);
  });
  globeGroup.add(linesGroup);

  // ────────────────────────────────────────────
  // MOUSE PARALLAX
  // ────────────────────────────────────────────
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ────────────────────────────────────────────
  // SCROLL STATE
  // ────────────────────────────────────────────
  let scrollProgress = 0;
  const progressBar = document.getElementById('progressBar');

  function updateScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
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
    const dt = clock.getDelta();

    // Smooth mouse
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // ── Globe rotation ──
    const autoRotateSpeed = 0.08;
    globeGroup.rotation.y = t * autoRotateSpeed + mouseX * 0.3;
    globeGroup.rotation.x = mouseY * 0.15;

    // ── Scroll-driven camera ──
    // Hero: 0-0.15 → camera at z=4.5
    // Evolution: 0.15-0.35 → zoom in slightly
    // Ecosystem: 0.35-0.55 → side view
    // Cinema+: 0.55-1 → pull back

    let camZ, camY, camX;
    if (scrollProgress < 0.15) {
      // Hero — full globe view
      camZ = 4.5;
      camY = 0;
      camX = 0;
    } else if (scrollProgress < 0.35) {
      // Evolution — slight zoom
      const p = (scrollProgress - 0.15) / 0.2;
      camZ = 4.5 - p * 1.2;
      camY = p * 0.3;
      camX = 0;
    } else if (scrollProgress < 0.55) {
      // Ecosystem — side angle
      const p = (scrollProgress - 0.35) / 0.2;
      camZ = 3.3 + p * 2;
      camY = 0.3 - p * 0.3;
      camX = p * 1.5;
    } else {
      // Cinema/CTA — pull back, globe fades
      const p = (scrollProgress - 0.55) / 0.45;
      camZ = 5.3 + p * 3;
      camY = 0;
      camX = 1.5 - p * 1.5;
    }

    camera.position.x += (camX - camera.position.x) * 0.03;
    camera.position.y += (camY - camera.position.y) * 0.03;
    camera.position.z += (camZ - camera.position.z) * 0.03;
    camera.lookAt(0, 0, 0);

    // ── Globe opacity based on scroll ──
    const globeOpacity = scrollProgress < 0.5 ? 1 : Math.max(0, 1 - (scrollProgress - 0.5) * 3);
    wireMat.opacity = 0.06 * globeOpacity;
    glowMat.opacity = 0.02 * globeOpacity;
    dotMat.opacity = 0.5 * globeOpacity;
    markerMat.opacity = 0.9 * globeOpacity;
    linesMat.opacity = 0.08 * globeOpacity;
    ambMat.opacity = 0.15 * Math.max(0.3, globeOpacity);

    rings.forEach((ring) => {
      ring.material.opacity = 0.35 * globeOpacity;
    });

    // ── Animate orbital rings ──
    rings.forEach((ring) => {
      const data = ring.userData;
      const positions = ring.geometry.attributes.position.array;
      const base = data.basePositions;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + t * data.speed;
        const radius = Math.sqrt(base[i * 3] * base[i * 3] + base[i * 3 + 2] * base[i * 3 + 2]);
        positions[i * 3] = radius * Math.cos(angle);
        positions[i * 3 + 2] = radius * Math.sin(angle);
      }
      ring.geometry.attributes.position.needsUpdate = true;
    });

    // ── Animate ambient particles ──
    const ambPos = ambParticles.geometry.attributes.position.array;
    for (let i = 0; i < AMB_COUNT; i++) {
      ambPos[i * 3] += ambVelocities[i].x;
      ambPos[i * 3 + 1] += ambVelocities[i].y;
      ambPos[i * 3 + 2] += ambVelocities[i].z;

      // Wrap around
      if (Math.abs(ambPos[i * 3]) > 10) ambPos[i * 3] *= -0.9;
      if (Math.abs(ambPos[i * 3 + 1]) > 10) ambPos[i * 3 + 1] *= -0.9;
      if (Math.abs(ambPos[i * 3 + 2]) > 10) ambPos[i * 3 + 2] *= -0.9;
    }
    ambParticles.geometry.attributes.position.needsUpdate = true;

    // ── Marker pulse ──
    markerMat.size = 0.06 + Math.sin(t * 2) * 0.01;

    renderer.render(scene, camera);
  }

  animate();

  // ────────────────────────────────────────────
  // RESIZE
  // ────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ────────────────────────────────────────────
  // NAV SCROLL
  // ────────────────────────────────────────────
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // ────────────────────────────────────────────
  // MOBILE MENU
  // ────────────────────────────────────────────
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  // ────────────────────────────────────────────
  // SCROLL REVEAL (IntersectionObserver)
  // ────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal-up');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, parseInt(delay));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  // ────────────────────────────────────────────
  // COUNTER ANIMATION
  // ────────────────────────────────────────────
  const counters = document.querySelectorAll('.stat-value[data-target]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => counterObs.observe(el));
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
  // CHAPTER NAVIGATION
  // ────────────────────────────────────────────
  const chapterCards = document.querySelectorAll('.chapter-card');
  const video = document.getElementById('mainVideo');

  if (video && chapterCards.length) {
    chapterCards.forEach((card) => {
      card.addEventListener('click', () => {
        const timestamp = parseFloat(card.dataset.timestamp);
        video.currentTime = timestamp;
        if (video.paused) {
          video.play();
          const overlay = document.getElementById('cinemaOverlay');
          if (overlay) overlay.classList.add('hidden');
        }
      });
    });
  }

  // ────────────────────────────────────────────
  // CINEMA VIDEO PLAYER
  // ────────────────────────────────────────────
  const overlay = document.getElementById('cinemaOverlay');
  const progressEl = document.getElementById('cinemaProgress');
  const progressFill = document.getElementById('cinemaProgressFill');
  const timeDisplay = document.getElementById('timeDisplay');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const fsBtn = document.getElementById('fsBtn');

  if (video && overlay) {
    overlay.addEventListener('click', () => {
      video.play();
      overlay.classList.add('hidden');
    });

    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        if (video.paused) {
          video.play();
          overlay.classList.add('hidden');
        } else {
          video.pause();
        }
      });
    }

    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        const pct = (video.currentTime / video.duration) * 100;
        if (progressFill) progressFill.style.width = pct + '%';
        if (timeDisplay) timeDisplay.textContent = fmt(video.currentTime) + ' / ' + fmt(video.duration);
      }
    });

    video.addEventListener('ended', () => {
      overlay.classList.remove('hidden');
      if (progressFill) progressFill.style.width = '0%';
    });

    video.addEventListener('play', () => {
      if (playPauseBtn) playPauseBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    });

    video.addEventListener('pause', () => {
      if (playPauseBtn) playPauseBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>';
    });

    if (progressEl) {
      progressEl.addEventListener('click', (e) => {
        const rect = progressEl.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        video.currentTime = pct * video.duration;
      });
    }

    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        const frame = document.querySelector('.cinema-frame');
        if (frame) {
          if (frame.requestFullscreen) frame.requestFullscreen();
          else if (frame.webkitRequestFullscreen) frame.webkitRequestFullscreen();
        }
      });
    }
  }

  function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  // ────────────────────────────────────────────
  // SMOOTH SCROLL for anchor links
  // ────────────────────────────────────────────
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
