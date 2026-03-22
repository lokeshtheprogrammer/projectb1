/* ============================================================
   KOREXA — MAIN JAVASCRIPT
   Three.js Hero · 3D card tilt · Swipeable testimonials
   Scroll reveals · Performance-optimized for mobile
   ============================================================ */

'use strict';

// ──────────────────────────────────────────────────────
// UTILITY: Detect if device supports hover (pointer device)
// This drives desktop vs mobile behavior throughout
// ──────────────────────────────────────────────────────
const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const isMobile = !isDesktop;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ──────────────────────────────────────────────────────
// 1. LOADING SCREEN (PUBG-Style Percentage Loader)
// Premium minimal design with smooth easing
// ──────────────────────────────────────────────────────
// Lock page scroll immediately so no content peeks under the loader
document.body.classList.add('loader-active');

window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const percentEl = document.getElementById('pubg-percent');
  const progressBar = document.getElementById('pubg-progress-bar');
  const progressContainer = document.getElementById('pubg-progress-container');
  const messageEl = document.getElementById('pubg-message');

  const siteContent = document.getElementById('site-content');
  if (siteContent) {
    siteContent.setAttribute('aria-hidden', 'true');
    siteContent.setAttribute('inert', '');
  }

  if (loader && percentEl && progressBar && messageEl) {
    // Bring focus into the loader for keyboard accessibility
    loader.setAttribute('tabindex', '-1');
    loader.focus();

    const messages = [
      "Initializing system...",
      "Loading assets...",
      "Crafting experience...",
      "Optimizing performance...",
      "Building visuals...",
      "Almost ready..."
    ];

    let currentPercent = 0;
    let lastDisplayedPercent = -1;

    // Smooth easing for cinematic feel
    function easeOutExpo(x) {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    }

    const startTime = performance.now();
    const minDuration = 2400; // Minimum loading time for premium feel

    function updateLoader(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / minDuration, 1);

      // EaseOutExpo: fast start, smooth finish
      const easedProgress = easeOutExpo(progress);

      currentPercent = Math.min(Math.floor(easedProgress * 100), 100);

      // Only update DOM if percentage changed (performance optimization)
      if (currentPercent !== lastDisplayedPercent) {
        percentEl.textContent = currentPercent;
        lastDisplayedPercent = currentPercent;
        // Keep aria-valuenow in sync for screen-reader progressbar role
        if (progressContainer) {
          progressContainer.setAttribute('aria-valuenow', currentPercent);
        }
      }

      // Update progress bar
      progressBar.style.width = currentPercent + '%';

      // Sync message with progress phase
      if (currentPercent < 20) messageEl.textContent = messages[0];
      else if (currentPercent < 38) messageEl.textContent = messages[1];
      else if (currentPercent < 55) messageEl.textContent = messages[2];
      else if (currentPercent < 72) messageEl.textContent = messages[3];
      else if (currentPercent < 90) messageEl.textContent = messages[4];
      else messageEl.textContent = messages[5];

      if (progress < 1) {
        requestAnimationFrame(updateLoader);
      } else {
        // Hold at 100% for a dramatic pause, then cinematic fade-out
        setTimeout(() => {
          loader.classList.add('loaded');

          // Announce to screen readers and reveal site
          const loaderStatus = document.getElementById('loader-status');
          if (loaderStatus) loaderStatus.textContent = 'Page loaded successfully.';

          if (siteContent) {
            siteContent.removeAttribute('aria-hidden');
            siteContent.removeAttribute('inert');
          }

          // Unlock body scroll after transition completes (~900ms)
          setTimeout(() => {
            document.body.classList.remove('loader-active');

            // Return focus to top level
            if (siteContent) siteContent.focus();

            // Trigger hero entrance animations
            if (typeof triggerHeroEntrance === 'function') {
              triggerHeroEntrance();
            }
          }, 950);
        }, 400); // Cinematic pause at 100% before exit
      }
    }

    requestAnimationFrame(updateLoader);

  } else if (loader) {
    // Fallback if PUBG structure is missing
    setTimeout(() => {
      loader.classList.add('loaded');
      setTimeout(() => {
        document.body.classList.remove('loader-active');
        if (typeof triggerHeroEntrance === 'function') triggerHeroEntrance();
      }, 950);
    }, 2500);
  }
});

// ──────────────────────────────────────────────────────
// 2. CUSTOM CURSOR (Desktop only)
// Uses rAF for smooth follower; completely disabled on touch
// ──────────────────────────────────────────────────────
if (isDesktop) {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');

  if (cursor && follower) {
    let mx = -100, my = -100, fx = -100, fy = -100;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    }, { passive: true });

    // Smooth follower using requestAnimationFrame
    (function animateFollower() {
      fx += (mx - fx) * 0.12;
      fy += (my - fy) * 0.12;
      follower.style.left = fx + 'px';
      follower.style.top = fy + 'px';
      requestAnimationFrame(animateFollower);
    })();

    // Enlarge cursor on interactive elements
    const interactiveEls = document.querySelectorAll(
      'a, button, .service-card, .portfolio-card, .testimonial-card, .filter-btn, input, select, textarea'
    );
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovered');
        follower.classList.add('hovered');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovered');
        follower.classList.remove('hovered');
      });
    });
  }
}

// ──────────────────────────────────────────────────────
// 3. NAVIGATION
// ──────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
let menuOpen = false;

// Scroll effect for navbar
let lastScrollY = 0;
let ticking = false;

function updateNavbar() {
  const scrollY = window.scrollY;
  navbar.classList.toggle('scrolled', scrollY > 50);
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateNavbar);
    ticking = true;
  }
}, { passive: true });

// Mobile menu toggle
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('open', menuOpen);
    menuToggle.classList.toggle('active', menuOpen);
    menuToggle.setAttribute('aria-expanded', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';

    // Toggle tabindex for accessibility
    const links = mobileMenu.querySelectorAll('.mobile-nav-link');
    links.forEach(l => l.setAttribute('tabindex', menuOpen ? '0' : '-1'));
  });

  // Close menu on link click
  mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// ──────────────────────────────────────────────────────
// 4. THREE.JS — HERO 3D SCENE (Desktop only)
// On mobile: CSS gradient mesh handles background
// ──────────────────────────────────────────────────────
function initHeroThreeJS() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined' || isMobile || prefersReducedMotion) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  // ── PARTICLE FIELD
  const particleCount = 1500;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const brandColors = [
    new THREE.Color('#FF6B35'),
    new THREE.Color('#FFB347'),
    new THREE.Color('#F7C948'),
    new THREE.Color('#BF00FF'),
    new THREE.Color('#00F5FF')
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    const c = brandColors[Math.floor(Math.random() * brandColors.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.03,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true
  });
  scene.add(new THREE.Points(particleGeo, particleMat));

  // ── FLOATING 3D WIREFRAME OBJECTS
  const wireOrange = new THREE.MeshBasicMaterial({
    color: 0xFF6B35, wireframe: true, transparent: true, opacity: 0.2
  });
  const wireCyan = new THREE.MeshBasicMaterial({
    color: 0x00F5FF, wireframe: true, transparent: true, opacity: 0.18
  });
  const wirePurple = new THREE.MeshBasicMaterial({
    color: 0xBF00FF, wireframe: true, transparent: true, opacity: 0.18
  });

  const torus = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.3, 10, 50), wireOrange);
  torus.position.set(-3.5, 0.5, -2);
  scene.add(torus);

  const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 0), wireCyan);
  ico.position.set(3.5, 0.3, -1.5);
  scene.add(ico);

  const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), wirePurple);
  box.position.set(0, -2.5, -1);
  scene.add(box);

  const objects = [
    { mesh: torus, rx: 0.0015, ry: 0.003 },
    { mesh: ico, rx: 0.002, ry: 0.0018 },
    { mesh: box, rx: 0.0018, ry: 0.0028 }
  ];

  // ── MOUSE PARALLAX (subtle, intentional)
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  document.addEventListener('mousemove', e => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 1.4;
    targetY = (e.clientY / window.innerHeight - 0.5) * 1.4;
  }, { passive: true });

  // ── RESIZE
  const handleResize = () => {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', handleResize, { passive: true });

  // ── RENDER LOOP
  let t = 0;
  let isHeroVisible = true;
  // Idle throttle: slow down when no mouse activity
  let lastMouseTime = Date.now();
  document.addEventListener('mousemove', () => { lastMouseTime = Date.now(); }, { passive: true });

  // Pause rendering when hero is out of view for performance
  const heroSection = document.getElementById('hero');
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => {
      isHeroVisible = entries[0].isIntersecting;
    }, { threshold: 0 });
    heroObserver.observe(heroSection);
  }

  function render() {
    requestAnimationFrame(render);
    if (!isHeroVisible) return; // Skip rendering when off-screen

    // Throttle tick speed when idle (no mouse movement for 5s)
    const isIdle = Date.now() - lastMouseTime > 5000;
    const tickSpeed = isIdle ? 0.004 : 0.008;
    t += tickSpeed;

    // Mouse parallax camera — smooth lerp
    currentX += (targetX - currentX) * 0.028;
    currentY += (targetY - currentY) * 0.028;
    camera.position.x = currentX * 0.35;
    camera.position.y = -currentY * 0.18;
    camera.lookAt(scene.position);

    // Rotate + float wireframe objects (smooth, background-level motion)
    objects.forEach((o, i) => {
      o.mesh.rotation.x += o.rx;
      o.mesh.rotation.y += o.ry;
      o.mesh.position.y += Math.sin(t + i * 1.8) * 0.0008;
    });

    // Subtle breathing — narrow range, slow
    particleMat.opacity = 0.38 + Math.sin(t * 0.3) * 0.12;

    renderer.render(scene, camera);
  }
  render();
}

// Initialize Three.js after the library loads
if (typeof THREE !== 'undefined') {
  initHeroThreeJS();
} else {
  // Wait for deferred script
  window.addEventListener('load', initHeroThreeJS);
}

// ──────────────────────────────────────────────────────
// 5. THREE.JS — ABOUT SECTION 3D PHONE (Desktop only)
// ──────────────────────────────────────────────────────
function initAboutThreeJS() {
  const canvas = document.getElementById('about-canvas');
  if (!canvas || typeof THREE === 'undefined' || isMobile || prefersReducedMotion) return;

  const parent = canvas.parentElement;
  const W = parent.offsetWidth;
  const H = parent.offsetHeight || 450;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.set(0, 0, 6);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const dLight = new THREE.DirectionalLight(0xFF6B35, 1.5);
  dLight.position.set(3, 3, 3);
  scene.add(dLight);
  const dLight2 = new THREE.DirectionalLight(0x00F5FF, 0.7);
  dLight2.position.set(-3, -2, 2);
  scene.add(dLight2);

  // Phone model group
  const group = new THREE.Group();
  scene.add(group);

  // Phone body
  const phoneMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.8, roughness: 0.2 });
  const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.2, 0.12), phoneMat);
  group.add(phoneBody);

  // Screen
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x0d0d1a, metalness: 0, roughness: 0.3 });
  const screen = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.7, 0.01), screenMat);
  screen.position.z = 0.065;
  group.add(screen);

  // Screen UI elements
  const uiElements = [
    { color: 0xFF6B35, opacity: 0.9, h: 0.5, y: 0.04, w: 0.8 },
    { color: 0x333355, opacity: 0.5, h: 0.2, y: 0.2, w: 0.5 },
    { color: 0x333355, opacity: 0.5, h: 0.2, y: 0.3, w: 0.3 },
    { color: 0xFFB347, opacity: 0.7, h: 0.12, y: 0.35, w: 0.2 }
  ];
  uiElements.forEach(ui => {
    const mat = new THREE.MeshBasicMaterial({ color: ui.color, transparent: true, opacity: ui.opacity });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(ui.w * 1.4, ui.h, 0.005), mat);
    mesh.position.set(-(0.5 - ui.w * 0.7) * 0.5, 1.05 - ui.y * 3.5, 0.075);
    group.add(mesh);
  });

  // Orbiting sphere
  const orbitSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 14, 14),
    new THREE.MeshStandardMaterial({
      color: 0xFF6B35, metalness: 0.6, roughness: 0.2,
      emissive: 0xFF6B35, emissiveIntensity: 0.3
    })
  );
  scene.add(orbitSphere);

  // Ring around phone
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.015, 8, 60),
    new THREE.MeshBasicMaterial({ color: 0xFF6B35, transparent: true, opacity: 0.15 })
  );
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  // Resize handler
  window.addEventListener('resize', () => {
    const w2 = parent.offsetWidth;
    const h2 = parent.offsetHeight || 450;
    renderer.setSize(w2, h2);
    camera.aspect = w2 / h2;
    camera.updateProjectionMatrix();
  }, { passive: true });

  // Mouse tracking
  let mouseX = 0, mouseY = 0, curMX = 0, curMY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  // Visibility observer — pause when off-screen
  let isAboutVisible = false;
  if ('IntersectionObserver' in window) {
    const aboutObs = new IntersectionObserver(entries => {
      isAboutVisible = entries[0].isIntersecting;
    }, { threshold: 0 });
    aboutObs.observe(canvas.closest('.about'));
  }

  let t = 0;
  function render() {
    requestAnimationFrame(render);
    if (!isAboutVisible) return;

    t += 0.008; // Slower, more composed
    curMX += (mouseX - curMX) * 0.03;
    curMY += (mouseY - curMY) * 0.03;

    // Gentle sway — mouse drives 60%, auto-sway 40%
    group.rotation.y = curMX * 0.35 + Math.sin(t * 0.3) * 0.06;
    group.rotation.x = -curMY * 0.18 + Math.sin(t * 0.25) * 0.03;

    orbitSphere.position.x = Math.cos(t * 0.5) * 2.2;
    orbitSphere.position.z = Math.sin(t * 0.5) * 2.2;
    orbitSphere.position.y = Math.sin(t * 1.0) * 0.28;

    renderer.render(scene, camera);
  }
  render();
}

if (typeof THREE !== 'undefined') {
  initAboutThreeJS();
} else {
  window.addEventListener('load', initAboutThreeJS);
}

// ──────────────────────────────────────────────────────
// 6. HERO ENTRANCE ANIMATIONS
// ──────────────────────────────────────────────────────
function triggerHeroEntrance() {
  const elements = [
    document.getElementById('hero-badge'),
    document.getElementById('hero-title'),
    document.getElementById('hero-sub'),
    document.getElementById('hero-ctas'),
    document.getElementById('hero-stats')
  ];

  elements.forEach((el, i) => {
    if (!el) return;
    const delay = prefersReducedMotion ? 0 : 200 + i * 180;
    setTimeout(() => {
      el.style.animation = `heroFadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards`;
    }, delay);
  });

  // Animated counters (after stats appear)
  const counterDelay = prefersReducedMotion ? 0 : 1200;
  setTimeout(() => {
    document.querySelectorAll('.stat-number').forEach(el => animateCounter(el));
  }, counterDelay);
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'));
  if (isNaN(target)) return;

  if (prefersReducedMotion) {
    el.textContent = target + '+';
    return;
  }

  let current = 0;
  const step = target / 50;
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      const label = el.nextElementSibling?.textContent || '';
      el.textContent = target + (label.includes('%') ? '%' : '+');
      clearInterval(interval);
    } else {
      el.textContent = Math.floor(current);
    }
  }, 30);
}

// ──────────────────────────────────────────────────────
// 7. SCROLL REVEAL (IntersectionObserver)
// ──────────────────────────────────────────────────────
if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    // Trigger earlier so content is revealed before user reaches it
    { threshold: 0.06, rootMargin: '0px 0px -30px 0px' }
  );

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
  });
} else {
  // If no IntersectionObserver or reduced motion, show everything
  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    el.classList.add('revealed');
  });
}

// ──────────────────────────────────────────────────────
// 8. SERVICE CARD 3D TILT (Desktop only)
// Reduced to max 4° — subtle depth, not distracting
// ──────────────────────────────────────────────────────
if (isDesktop && !prefersReducedMotion) {
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width * 0.5);
      const dy = (e.clientY - cy) / (rect.height * 0.5);
      // Max 4° tilt — intentional depth without vertigo
      card.style.transform = `translateY(-6px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s var(--ease-out), border-color 0.35s ease, box-shadow 0.35s ease';
      card.style.transform = '';
      // Reset transition after leave animation
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
}

// ──────────────────────────────────────────────────────
// 9. PORTFOLIO CARD 3D TILT (Desktop only)
// Max 3° — just enough to feel spatial
// ──────────────────────────────────────────────────────
if (isDesktop && !prefersReducedMotion) {
  document.querySelectorAll('.portfolio-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      card.style.transform = `translateY(-6px) scale(1.005) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s var(--ease-out), border-color 0.35s ease, box-shadow 0.35s ease';
      card.style.transform = '';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
}

// ──────────────────────────────────────────────────────
// 10. PORTFOLIO FILTER
// ──────────────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active tab
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');
    document.querySelectorAll('.portfolio-card').forEach(card => {
      const match = filter === 'all' || card.getAttribute('data-category') === filter;
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = match ? '1' : '0.12';
      card.style.transform = match ? '' : 'scale(0.96)';
      card.style.pointerEvents = match ? '' : 'none';
    });
  });
});

// ──────────────────────────────────────────────────────
// 11. TESTIMONIALS SLIDER
// Touch swipe + auto-play + keyboard accessible
// ──────────────────────────────────────────────────────
(function initTestimonials() {
  const viewport = document.getElementById('testimonials-viewport');
  const track = document.getElementById('testimonials-track');
  const dotsContainer = document.getElementById('slider-dots');
  const prevBtn = document.getElementById('arrow-prev');
  const nextBtn = document.getElementById('arrow-next');

  if (!track || !dotsContainer) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const total = cards.length;
  let current = 0;
  let autoTimer;
  let isDragging = false;
  let startX = 0;
  let trackOffset = 0;

  // Calculate card width including gap
  function getCardWidth() {
    if (cards.length === 0) return 300;
    const cardStyle = getComputedStyle(track);
    const gap = parseInt(cardStyle.gap) || 16;
    return cards[0].offsetWidth + gap;
  }

  // Create dots
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot-btn' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }

  function goTo(idx) {
    current = ((idx % total) + total) % total;
    const cardW = getCardWidth();
    track.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
    track.style.transform = `translateX(-${current * cardW}px)`;

    // Update dots
    dotsContainer.querySelectorAll('.dot-btn').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // Arrow buttons
  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  // Auto-play
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, 4000);
  }
  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
  }
  startAuto();

  // Pause on hover/touch
  if (viewport) {
    viewport.addEventListener('mouseenter', stopAuto);
    viewport.addEventListener('mouseleave', startAuto);
    viewport.addEventListener('touchstart', stopAuto, { passive: true });
    viewport.addEventListener('touchend', () => {
      // Resume auto after 5s idle
      setTimeout(startAuto, 5000);
    }, { passive: true });
  }

  // ── MOUSE DRAG
  track.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.clientX;
    trackOffset = current * getCardWidth();
    track.style.transition = 'none';
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const diff = startX - e.clientX;
    track.style.transform = `translateX(-${trackOffset + diff}px)`;
  });
  document.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - e.clientX;
    if (diff > 60) next();
    else if (diff < -60) prev();
    else goTo(current);
  });

  // ── TOUCH SWIPE
  let touchStartX = 0;
  let touchMoved = false;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    trackOffset = current * getCardWidth();
    track.style.transition = 'none';
    touchMoved = false;
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    const diff = touchStartX - e.touches[0].clientX;
    track.style.transform = `translateX(-${trackOffset + diff}px)`;
    touchMoved = true;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    if (!touchMoved) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 40) next();
    else if (diff < -40) prev();
    else goTo(current);
  });

  // Handle resize — recalculate positions
  window.addEventListener('resize', () => goTo(current), { passive: true });
})();

// ──────────────────────────────────────────────────────
// 12. CONTACT FORM
// ──────────────────────────────────────────────────────
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const btn = document.getElementById('form-submit');
    const success = document.getElementById('form-success');
    if (!btn || !success) return;

    // Submit animation with basic validation
    const nameInp = document.getElementById('inp-name');
    const emailInp = document.getElementById('inp-email');
    const msgInp = document.getElementById('inp-message');
    const serviceInp = document.getElementById('inp-service');

    let isValid = true;
    [nameInp, emailInp, msgInp, serviceInp].forEach(el => {
      if (!el) return;
      if (el.tagName === 'SELECT') {
        if (!value) { isValid = false; el.classList.add('error'); }
        else { el.classList.remove('error'); }
      } else if (!el.value || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value))) {
        isValid = false;
        el.classList.add('error');
      } else {
        el.classList.remove('error');
      }
    });

    if (!isValid) return;

    btn.querySelector('span:first-child').textContent = 'Sending…';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    setTimeout(() => {
      success.classList.add('visible');
      this.reset();
      [nameInp, emailInp, msgInp, serviceInp].forEach(el => el && el.classList.remove('error'));
      btn.querySelector('span:first-child').textContent = 'Send Message';
      btn.disabled = false;
      btn.style.opacity = '';

      // Hide success after 5s
      setTimeout(() => success.classList.remove('visible'), 5000);
    }, 1500);
  });
}

// ──────────────────────────────────────────────────────
// 13. SMOOTH ANCHOR SCROLL
// ──────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ──────────────────────────────────────────────────────
// 14. PARALLAX SECTION GLOWS (Desktop only, non-blocking)
// Subtle drift — half the previous speed
// ──────────────────────────────────────────────────────
if (isDesktop && !prefersReducedMotion) {
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        document.querySelectorAll('.section-glow').forEach((glow, i) => {
          // Halved multiplier: 0.02 + variation — barely perceptible drift
          glow.style.transform = `translateY(${scrollY * (0.02 + i * 0.008)}px)`;
        });
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });
}
