/**
 * app.js — application bootstrap: starfield, loading sequence, nav,
 * data load orchestration, and live-update intervals.
 */
(function starfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stars = [];

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = cssW < 768 ? 150 : 400;
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * cssW,
      y: Math.random() * cssH,
      r: Math.random() * 1.3 + 0.2,
      tw: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.15 + 0.02
    }));
  }

  function draw() {
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = '#040711';
    ctx.fillRect(0, 0, cssW, cssH);
    stars.forEach((s) => {
      const alpha = reduceMotion ? 0.7 : 0.4 + 0.6 * Math.abs(Math.sin(s.tw));
      ctx.fillStyle = `rgba(200,220,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (!reduceMotion) s.tw += s.speed;
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

function initNav() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  toggle?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menu.classList.remove('open')));
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
  }, { threshold: 0.15 });
  targets.forEach((el) => io.observe(el));
}

async function runLoadingSequence() {
  const screen = document.getElementById('loading-screen');
  const line = document.getElementById('loading-line');
  if (!screen || !line) return;
  const steps = ['loading.init', 'loading.v1', 'loading.v2', 'loading.estimated', 'loading.ready'];
  for (const key of steps) {
    line.textContent = t(key);
    await new Promise((r) => setTimeout(r, 380));
  }
  screen.classList.add('hidden');
  setTimeout(() => screen.remove(), 700);
}

async function bootstrap() {
  initNav();
  initSolarSystemControls();
  // i18n must be loaded (and applied) before the loading sequence starts
  // narrating steps via t(), and before renderAll() calls t() while
  // building cards/tables — both would otherwise show raw i18n keys.
  await initI18n();
  applyTranslations(getLang());
  const [loadResult] = await Promise.all([
    loadVoyagerData(),
    runLoadingSequence()
  ]);
  renderAll();
  applySolarViewTransform();
  initScrollReveal();

  setInterval(tickOdometers, 1000);
  setInterval(() => {
    if (typeof renderFartherViz === 'function') renderFartherViz();
    if (typeof renderDistanceBetween === 'function') renderDistanceBetween();
    if (typeof drawSolarSystem === 'function') drawSolarSystem();
  }, 5000);
}

document.addEventListener('DOMContentLoaded', bootstrap);
