/**
 * app.js — application bootstrap: starfield, fast loading handoff, nav,
 * image error fallback, data load orchestration, and live-update intervals.
 */
(function starfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduceMotion = motionQuery.matches;
  let stars = [];
  let rafId = null;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = cssW < 768 ? 140 : 320;
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * cssW,
      y: Math.random() * cssH,
      r: Math.random() * 1.4 + 0.3,
      tw: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.08 + 0.02
    }));
    drawFrame();
  }

  function drawFrame() {
    const cssW = canvas.clientWidth || window.innerWidth;
    const cssH = canvas.clientHeight || window.innerHeight;
    ctx.clearRect(0, 0, cssW, cssH);
    const isKid = document.documentElement.hasAttribute('data-repo-root');
    ctx.fillStyle = isKid ? '#171347' : '#040711';
    ctx.fillRect(0, 0, cssW, cssH);
    stars.forEach((s) => {
      const alpha = reduceMotion ? 0.65 : 0.35 + 0.65 * Math.abs(Math.sin(s.tw));
      ctx.fillStyle = isKid
        ? `rgba(255, 240, 195, ${alpha})`
        : `rgba(200, 220, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (!reduceMotion) s.tw += s.speed;
    });
  }

  function tick() {
    if (reduceMotion || document.hidden) {
      rafId = null;
      return;
    }
    drawFrame();
    rafId = requestAnimationFrame(tick);
  }

  function syncLoop() {
    if (reduceMotion || document.hidden) {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      drawFrame();
    } else if (rafId === null) {
      rafId = requestAnimationFrame(tick);
    }
  }

  motionQuery.addEventListener?.('change', (e) => {
    reduceMotion = e.matches;
    syncLoop();
  });
  document.addEventListener('visibilitychange', syncLoop);
  window.addEventListener('resize', resize);
  resize();
  syncLoop();
})();

function initNav() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  function setMenuOpen(open) {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  toggle.addEventListener('click', () => {
    setMenuOpen(!menu.classList.contains('open'));
  });

  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      setMenuOpen(false);
      toggle.focus();
    }
  });
}

function initStaticImageFallbacks() {
  document.querySelectorAll('img[data-fallback-text]').forEach((img) => {
    img.addEventListener('error', () => {
      const div = document.createElement('div');
      div.className = 'gallery-fallback';
      div.textContent = img.dataset.fallbackText || 'Image unavailable — view on NASA.gov';
      img.replaceWith(div);
    }, { once: true });
  });
}

function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !targets.length) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  targets.forEach((el) => io.observe(el));
}

function dismissLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;
  screen.classList.add('hidden');
  setTimeout(() => screen.remove(), 350);
}

async function bootstrap() {
  initNav();
  initStaticImageFallbacks();
  initSolarSystemControls();
  await initI18n();
  applyTranslations(getLang());
  await loadVoyagerData();
  renderAll();
  applySolarViewTransform();
  initScrollReveal();
  dismissLoadingScreen();

  setInterval(() => {
    if (!document.hidden) tickOdometers();
  }, 1000);
  setInterval(() => {
    if (document.hidden) return;
    if (typeof renderFartherViz === 'function') renderFartherViz();
    if (typeof renderDistanceBetween === 'function') renderDistanceBetween();
    if (typeof drawSolarSystem === 'function') drawSolarSystem();
  }, 5000);
}

document.addEventListener('DOMContentLoaded', bootstrap);
