/* ============================================================
   KOREXA — MAIN JAVASCRIPT
   Three.js Hero · 3D card tilt · Swipeable testimonials
   Scroll reveals · Performance-optimized for mobile
   ============================================================ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

// ──────────────────────────────────────────────────────
// UTILITY: Detect if device supports hover (pointer device)
// This drives desktop vs mobile behavior throughout
// ──────────────────────────────────────────────────────
const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const isMobile = window.innerWidth <= 768;
const isDesktop = !isMobile;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let heroThreeInitialized = false;
let aboutThreeInitialized = false;
let threeScenesBootstrapped = false;
let heroTypingStarted = false;

function runAfterWindowLoad(callback) {
  if (document.readyState === 'complete') {
    callback();
    return;
  }

  window.addEventListener('load', callback, { once: true });
}

function revealHeroGradientFallback() {
  const mesh = document.querySelector('.hero-gradient-mesh');
  if (mesh) {
    mesh.style.opacity = '1';
  }
}

function getElementSize(element, fallbackHeight) {
  const rect = element.getBoundingClientRect();
  const parent = element.parentElement;
  const width = Math.max(
    Math.round(rect.width),
    element.clientWidth,
    parent ? parent.clientWidth : 0,
    1
  );
  const height = Math.max(
    Math.round(rect.height),
    element.clientHeight,
    parent ? parent.clientHeight : 0,
    fallbackHeight
  );

  return { width, height };
}

function bootstrapThreeScenes() {
  if (threeScenesBootstrapped || isMobile || prefersReducedMotion) {
    if (isMobile || prefersReducedMotion) {
      revealHeroGradientFallback();
    }
    return;
  }

  threeScenesBootstrapped = true;

  runAfterWindowLoad(() => {
    window.requestAnimationFrame(() => {
      initHeroThreeJS(THREE);
      initAboutThreeJS(THREE);
    });
  });
}

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
if (hasHover) {
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
function initHeroThreeJS(Three) {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !Three || isMobile || prefersReducedMotion || heroThreeInitialized) return;

  const { width, height } = getElementSize(canvas, 520);
  if (width < 2 || height < 2) {
    revealHeroGradientFallback();
    return;
  }

  let renderer;
  try {
    renderer = new Three.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = Three.SRGBColorSpace;
    renderer.toneMapping = Three.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
  } catch (e) {
    console.warn('WebGL not supported or disabled. Falling back to CSS mesh.', e);
    revealHeroGradientFallback();
    return;
  }

  heroThreeInitialized = true;

  const scene = new Three.Scene();
  scene.fog = new Three.FogExp2(0x090511, 0.024);

  const camera = new Three.PerspectiveCamera(48, width / height, 0.1, 1000);
  camera.position.set(0.15, 0.08, 7.4);

  // ── PARTICLE FIELD
  scene.add(new Three.AmbientLight(0xffffff, 0.48));

  const warmLight = new Three.PointLight(0xff7a2f, 3.1, 28, 2);
  warmLight.position.set(-2.4, 1.6, 4.5);
  scene.add(warmLight);

  const cyanLight = new Three.PointLight(0x33d6ff, 2.3, 26, 2);
  cyanLight.position.set(3.8, -1.8, 3.6);
  scene.add(cyanLight);

  const violetLight = new Three.PointLight(0x7b4dff, 2.1, 24, 2);
  violetLight.position.set(1.6, 2.8, -1.8);
  scene.add(violetLight);

  const heroGroup = new Three.Group();
  heroGroup.position.set(3.15, 0.12, -1.2);
  heroGroup.scale.setScalar(1.28);
  scene.add(heroGroup);

  const particleCount = 2400;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const brandColors = [
    new Three.Color('#FF6B35'),
    new Three.Color('#FFB347'),
    new Three.Color('#F7C948'),
    new Three.Color('#BF00FF'),
    new Three.Color('#00F5FF')
  ];

  for (let i = 0; i < particleCount; i++) {
    const spread = 3 + Math.random() * 7.5;
    const angle = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * spread + (Math.random() - 0.5) * 5.5;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    const c = brandColors[Math.floor(Math.random() * brandColors.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const particleGeo = new Three.BufferGeometry();
  particleGeo.setAttribute('position', new Three.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new Three.BufferAttribute(colors, 3));
  const particleMat = new Three.PointsMaterial({
    size: 0.11,
    opacity: 0.78,
    transparent: true,
    vertexColors: true,
    sizeAttenuation: true,
    blending: Three.AdditiveBlending,
    depthWrite: false
  });
  const particleField = new Three.Points(particleGeo, particleMat);
  scene.add(particleField);

  const emberCount = 220;
  const emberPositions = new Float32Array(emberCount * 3);
  const emberColors = new Float32Array(emberCount * 3);

  for (let i = 0; i < emberCount; i++) {
    const radius = 1 + Math.random() * 2.8;
    const angle = (i / emberCount) * Math.PI * 10;
    emberPositions[i * 3] = Math.cos(angle) * radius;
    emberPositions[i * 3 + 1] = (Math.random() - 0.5) * 2.8;
    emberPositions[i * 3 + 2] = Math.sin(angle) * radius;

    const emberColor = i % 2 === 0 ? new Three.Color('#FFB347') : new Three.Color('#00F5FF');
    emberColors[i * 3] = emberColor.r;
    emberColors[i * 3 + 1] = emberColor.g;
    emberColors[i * 3 + 2] = emberColor.b;
  }

  const emberGeo = new Three.BufferGeometry();
  emberGeo.setAttribute('position', new Three.BufferAttribute(emberPositions, 3));
  emberGeo.setAttribute('color', new Three.BufferAttribute(emberColors, 3));
  const emberMat = new Three.PointsMaterial({
    size: 0.16,
    opacity: 0.55,
    transparent: true,
    vertexColors: true,
    blending: Three.AdditiveBlending,
    depthWrite: false
  });
  const emberField = new Three.Points(emberGeo, emberMat);
  heroGroup.add(emberField);

  const core = new Three.Mesh(
    new Three.IcosahedronGeometry(1.15, 1),
    new Three.MeshStandardMaterial({
      color: 0xff8a3d,
      emissive: 0xf46b2a,
      emissiveIntensity: 0.95,
      roughness: 0.26,
      metalness: 0.22,
      flatShading: true,
      transparent: true,
      opacity: 0.92
    })
  );
  heroGroup.add(core);

  const shell = new Three.Mesh(
    new Three.TorusKnotGeometry(1.85, 0.26, 180, 28),
    new Three.MeshStandardMaterial({
      color: 0x8f63ff,
      emissive: 0x3f2cff,
      emissiveIntensity: 0.55,
      roughness: 0.32,
      metalness: 0.78,
      wireframe: true,
      transparent: true,
      opacity: 0.68
    })
  );
  heroGroup.add(shell);

  const halo = new Three.Mesh(
    new Three.TorusGeometry(2.55, 0.045, 16, 180),
    new Three.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.54,
      blending: Three.AdditiveBlending
    })
  );
  halo.rotation.x = Math.PI * 0.42;
  halo.rotation.z = 0.35;
  heroGroup.add(halo);

  const haloSecondary = new Three.Mesh(
    new Three.TorusGeometry(3.15, 0.026, 12, 150),
    new Three.MeshBasicMaterial({
      color: 0xffa54a,
      transparent: true,
      opacity: 0.34,
      blending: Three.AdditiveBlending
    })
  );
  haloSecondary.rotation.x = Math.PI * 0.62;
  haloSecondary.rotation.y = 0.55;
  heroGroup.add(haloSecondary);

  const orbLeft = new Three.Mesh(
    new Three.OctahedronGeometry(0.62, 1),
    new Three.MeshStandardMaterial({
      color: 0x2bd8ff,
      emissive: 0x0f8fb2,
      emissiveIntensity: 0.92,
      roughness: 0.24,
      metalness: 0.6,
      transparent: true,
      opacity: 0.94
    })
  );
  orbLeft.position.set(-4.9, -0.7, -2.2);
  orbLeft.scale.setScalar(1.45);
  scene.add(orbLeft);

  const orbRight = new Three.Mesh(
    new Three.IcosahedronGeometry(0.78, 0),
    new Three.MeshStandardMaterial({
      color: 0xffb347,
      emissive: 0xff7a2f,
      emissiveIntensity: 0.88,
      roughness: 0.38,
      metalness: 0.58,
      flatShading: true,
      transparent: true,
      opacity: 0.9
    })
  );
  orbRight.position.set(5.15, 1.45, -2.3);
  orbRight.scale.setScalar(1.72);
  scene.add(orbRight);

  const ribbon = new Three.Mesh(
    new Three.TorusGeometry(1.6, 0.08, 12, 100),
    new Three.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      blending: Three.AdditiveBlending
    })
  );
  ribbon.position.set(-3.35, 2.15, -3.05);
  ribbon.rotation.x = Math.PI * 0.35;
  ribbon.rotation.y = 0.85;
  ribbon.scale.setScalar(1.45);
  scene.add(ribbon);

  // ── FLOATING 3D POINT-BASED OBJECTS (Bypasses Chrome/Windows GL_LINES bug)
  const matOrange = new Three.MeshBasicMaterial({
    color: 0xFF6B35,
    wireframe: true,
    transparent: true,
    opacity: 0.56
  });
  const matCyan = new Three.MeshBasicMaterial({
    color: 0x00F5FF,
    wireframe: true,
    transparent: true,
    opacity: 0.5
  });
  const matPurple = new Three.MeshBasicMaterial({
    color: 0xBF00FF,
    wireframe: true,
    transparent: true,
    opacity: 0.48
  });

  // Use higher segment counts for points so the shapes are dense and recognizable
  const torus = new Three.Mesh(new Three.TorusGeometry(1.45, 0.34, 24, 120), matOrange);
  torus.position.set(-5.15, 1.05, -3.4);
  torus.scale.setScalar(1.18);
  scene.add(torus);

  const ico = new Three.Mesh(new Three.IcosahedronGeometry(1.02, 1), matCyan);
  ico.position.set(4.9, -0.85, -3.2);
  ico.scale.setScalar(1.22);
  scene.add(ico);

  const box = new Three.Mesh(new Three.BoxGeometry(1.45, 1.45, 1.45, 6, 6, 6), matPurple);
  box.position.set(2.35, 2.15, -3.6);
  box.scale.setScalar(1.08);
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
    const nextSize = getElementSize(canvas, 520);
    if (nextSize.width < 2 || nextSize.height < 2) return;
    renderer.setSize(nextSize.width, nextSize.height, false);
    camera.aspect = nextSize.width / nextSize.height;
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
  if ('IntersectionObserver' in window && heroSection) {
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
    const tickSpeed = isIdle ? 0.0022 : 0.0064;
    t += tickSpeed;

    // Mouse parallax camera — smooth lerp
    currentX += (targetX - currentX) * 0.028;
    currentY += (targetY - currentY) * 0.028;
    camera.position.x = currentX * 0.58 + 0.12;
    camera.position.y = -currentY * 0.26 + 0.08;
    camera.lookAt(1.55, 0.02, -1.25);

    // Rotate + float wireframe objects (smooth, background-level motion)
    particleField.rotation.y = t * 0.08;
    particleField.rotation.x = Math.sin(t * 0.22) * 0.06;
    emberField.rotation.y = -t * 0.55;
    emberField.rotation.x = Math.sin(t * 0.4) * 0.18;

    heroGroup.rotation.y = t * 0.18 + currentX * 0.08;
    heroGroup.rotation.x = Math.sin(t * 0.3) * 0.08 - currentY * 0.05;
    heroGroup.position.y = 0.1 + Math.sin(t * 0.75) * 0.14;

    core.rotation.x = t * 0.34;
    core.rotation.y = t * 0.48;
    shell.rotation.x = t * 0.18;
    shell.rotation.y = t * 0.3;
    halo.rotation.z += 0.0024;
    haloSecondary.rotation.z -= 0.0016;

    orbLeft.rotation.x += 0.0032;
    orbLeft.rotation.y -= 0.0026;
    orbLeft.position.y = -0.7 + Math.sin(t * 1.1) * 0.3;

    orbRight.rotation.x -= 0.0024;
    orbRight.rotation.y += 0.003;
    orbRight.position.y = 1.45 + Math.sin(t * 0.92 + 1.4) * 0.24;

    ribbon.rotation.z += 0.0028;
    objects.forEach((o, i) => {
      o.mesh.rotation.x += o.rx;
      o.mesh.rotation.y += o.ry;
      o.mesh.position.y += Math.sin(t + i * 1.8) * 0.0012;
    });

    // Subtle breathing — narrow range, slow
    particleMat.opacity = 0.64 + Math.sin(t * 0.45) * 0.08;
    emberMat.opacity = 0.42 + Math.sin(t * 0.95) * 0.08;
    warmLight.intensity = 2.9 + Math.sin(t * 0.9) * 0.32;
    cyanLight.intensity = 2.1 + Math.sin(t * 0.8 + 1.2) * 0.24;

    renderer.render(scene, camera);
  }
  render();
}

// ──────────────────────────────────────────────────────
// 5. THREE.JS — ABOUT SECTION 3D PHONE (Desktop only)
// ──────────────────────────────────────────────────────
function initAboutThreeJS(Three) {
  const canvas = document.getElementById('about-canvas');
  if (!canvas || !Three || isMobile || prefersReducedMotion || aboutThreeInitialized) return;

  const { width: W, height: H } = getElementSize(canvas, 450);

  let renderer;
  try {
    renderer = new Three.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);
  } catch (e) {
    console.warn('WebGL not supported for About scene.', e);
    return;
  }

  aboutThreeInitialized = true;

  const scene = new Three.Scene();
  const camera = new Three.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.set(0, 0, 6);

  // Lighting
  scene.add(new Three.AmbientLight(0xffffff, 0.4));
  const dLight = new Three.DirectionalLight(0xFF6B35, 1.5);
  dLight.position.set(3, 3, 3);
  scene.add(dLight);
  const dLight2 = new Three.DirectionalLight(0x00F5FF, 0.7);
  dLight2.position.set(-3, -2, 2);
  scene.add(dLight2);

  // Phone model group
  const group = new Three.Group();
  scene.add(group);

  // Phone body
  const phoneMat = new Three.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.8, roughness: 0.2 });
  const phoneBody = new Three.Mesh(new Three.BoxGeometry(1.8, 3.2, 0.12), phoneMat);
  group.add(phoneBody);

  // Screen
  const screenMat = new Three.MeshStandardMaterial({ color: 0x0d0d1a, metalness: 0, roughness: 0.3 });
  const screen = new Three.Mesh(new Three.BoxGeometry(1.5, 2.7, 0.01), screenMat);
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
    const mat = new Three.MeshBasicMaterial({ color: ui.color, transparent: true, opacity: ui.opacity });
    const mesh = new Three.Mesh(new Three.BoxGeometry(ui.w * 1.4, ui.h, 0.005), mat);
    mesh.position.set(-(0.5 - ui.w * 0.7) * 0.5, 1.05 - ui.y * 3.5, 0.075);
    group.add(mesh);
  });

  // Orbiting sphere
  const orbitSphere = new Three.Mesh(
    new Three.SphereGeometry(0.14, 14, 14),
    new Three.MeshStandardMaterial({
      color: 0xFF6B35, metalness: 0.6, roughness: 0.2,
      emissive: 0xFF6B35, emissiveIntensity: 0.3
    })
  );
  scene.add(orbitSphere);

  // Ring around phone
  const ring = new Three.Mesh(
    new Three.TorusGeometry(2.2, 0.015, 8, 60),
    new Three.MeshBasicMaterial({ color: 0xFF6B35, transparent: true, opacity: 0.15 })
  );
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  // Resize handler
  window.addEventListener('resize', () => {
    const nextSize = getElementSize(canvas, 450);
    renderer.setSize(nextSize.width, nextSize.height, false);
    camera.aspect = nextSize.width / nextSize.height;
    camera.updateProjectionMatrix();
  }, { passive: true });

  // Mouse tracking
  let mouseX = 0, mouseY = 0, curMX = 0, curMY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  // Visibility observer — pause when off-screen
  let isAboutVisible = true;
  const aboutSection = canvas.closest('.about');
  if ('IntersectionObserver' in window && aboutSection) {
    const aboutObs = new IntersectionObserver(entries => {
      isAboutVisible = entries[0].isIntersecting;
    }, { threshold: 0 });
    aboutObs.observe(aboutSection);
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

bootstrapThreeScenes();

// ──────────────────────────────────────────────────────
// 6. HERO ENTRANCE ANIMATIONS
// ──────────────────────────────────────────────────────
function startHeroTyping() {
  if (heroTypingStarted) return;

  const typingEl = document.getElementById('hero-typing-text');
  const caretEl = document.getElementById('hero-typing-caret');
  if (!typingEl) return;

  const phrases = (typingEl.dataset.phrases || '')
    .split('|')
    .map(item => item.trim())
    .filter(Boolean);

  if (phrases.length === 0) return;

  heroTypingStarted = true;

  if (prefersReducedMotion || isMobile || phrases.length === 1) {
    typingEl.textContent = phrases[0];
    if (caretEl) caretEl.style.opacity = '0.7';
    return;
  }

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  typingEl.textContent = '';

  function tick() {
    const phrase = phrases[phraseIndex];

    if (isDeleting) {
      charIndex = Math.max(charIndex - 1, 0);
    } else {
      charIndex = Math.min(charIndex + 1, phrase.length);
    }

    typingEl.textContent = phrase.slice(0, charIndex);

    let delay = isDeleting ? 34 : 62;

    if (!isDeleting && charIndex === phrase.length) {
      isDeleting = true;
      delay = 1500;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 320;
    }

    window.setTimeout(tick, delay);
  }

  window.setTimeout(tick, 280);
}

function triggerHeroEntrance() {
  const elements = [
    { el: document.getElementById('hero-badge'), delay: 200 },
    { el: document.getElementById('hero-title'), delay: 350 },
    { el: document.getElementById('hero-sub'), delay: 500 },
    { el: document.getElementById('hero-ctas'), delay: 700 },
    { el: document.getElementById('hero-stats'), delay: 900 }
  ];

  elements.forEach((item) => {
    if (!item.el) return;
    const delay = prefersReducedMotion ? 0 : item.delay;
    setTimeout(() => {
      item.el.style.animation = `heroFadeInUp 0.9s cubic-bezier(0.23, 1, 0.32, 1) forwards`;
    }, delay);
  });

  const typingDelay = prefersReducedMotion ? 0 : 900;
  setTimeout(() => {
    startHeroTyping();
  }, typingDelay);

  // Animated counters (after stats appear)
  const counterDelay = prefersReducedMotion ? 0 : 2000;
  setTimeout(() => {
    document.querySelectorAll('.stat-number').forEach((el, idx) => {
      setTimeout(() => {
        animateCounter(el);
      }, idx * 100);
    });
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
  const duration = 2000; // 2 second animation
  const step = target / (duration / 30);
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth acceleration
    const easeOutQuad = 1 - (1 - progress) * (1 - progress);
    current = target * easeOutQuad;
    
    const label = el.nextElementSibling?.textContent || '';
    el.textContent = Math.floor(current) + (label.includes('%') ? '%' : '+');
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      el.textContent = target + (label.includes('%') ? '%' : '+');
    }
  };
  
  animate();
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
if (hasHover && !prefersReducedMotion) {
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
if (hasHover && !prefersReducedMotion) {
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
        if (!el.value) { isValid = false; el.classList.add('error'); }
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
