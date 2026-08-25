/**
 * solarsystem.js — schematic 2D/3D solar-system visualization.
 * This is an educational schematic, NOT a precision ephemeris: planets
 * are placed along a fixed reference heading, and each Voyager is drawn
 * along its NASA-published escape heading (north/south of the ecliptic)
 * at a radius derived from its calculated current distance. The "3D"
 * mode is a CSS perspective tilt of the same 2D drawing, with drag-to-
 * rotate — a visual aid, not a true 3D ephemeris renderer.
 */
const PLANETS = [
  { name_en: 'Earth', name_zh: '地球', name_es: 'Tierra', name_ja: '地球', au: 1 },
  { name_en: 'Jupiter', name_zh: '木星', name_es: 'Júpiter', name_ja: '木星', au: 5.2 },
  { name_en: 'Saturn', name_zh: '土星', name_es: 'Saturno', name_ja: '土星', au: 9.5 },
  { name_en: 'Uranus', name_zh: '天王星', name_es: 'Urano', name_ja: '天王星', au: 19.2 },
  { name_en: 'Neptune', name_zh: '海王星', name_es: 'Neptuno', name_ja: '海王星', au: 30.1 }
];
const HELIOPAUSE_AU = 120;
const PLANET_ANGLE_DEG = -15;
const V1_ANGLE_DEG = -55;
const V2_ANGLE_DEG = 55;

let solarState = { view: '2d', scaleMode: 'log', rotY: 0, rotX: 18 };
const SOLAR_ROT_X_MIN = -10, SOLAR_ROT_X_MAX = 60;

function ssRadius(au, canvasMax, mode) {
  if (mode === 'log') {
    const maxLog = Math.log10(HELIOPAUSE_AU * 1.6 + 1);
    return (Math.log10(au + 1) / maxLog) * canvasMax;
  }
  const maxAU = HELIOPAUSE_AU * 1.6;
  return Math.min(canvasMax, (au / maxAU) * canvasMax);
}

function polar(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function drawSolarSystem() {
  const canvas = document.getElementById('solar-canvas');
  if (!canvas || !VOYAGER_DATA.voyager1) return;
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.parentElement.clientWidth || 320;
  const cssH = Math.max(320, Math.min(560, cssW * 0.62));
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  const cx = cssW / 2, cy = cssH / 2;
  const maxR = Math.max(20, Math.min(cssW, cssH) / 2 - 30);
  const lang = getLang();
  const v1 = VOYAGER_DATA.voyager1, v2 = VOYAGER_DATA.voyager2;
  const e1 = currentEstimate(v1), e2 = currentEstimate(v2);

  ctx.strokeStyle = 'rgba(120,170,220,0.25)';
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.arc(cx, cy, ssRadius(HELIOPAUSE_AU, maxR, solarState.scaleMode), 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(180,210,255,0.55)';
  ctx.font = '11px "Space Mono", monospace';
  ctx.fillText(t('solar.legendHeliopause'), cx + ssRadius(HELIOPAUSE_AU, maxR, solarState.scaleMode) * 0.6, cy - 8);

  const sunPos = { x: cx, y: cy };
  const grad = ctx.createRadialGradient(sunPos.x, sunPos.y, 0, sunPos.x, sunPos.y, 14);
  grad.addColorStop(0, '#fff3c4');
  grad.addColorStop(1, '#ffb84f');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(sunPos.x, sunPos.y, 9, 0, Math.PI * 2);
  ctx.fill();

  PLANETS.forEach((p) => {
    const r = ssRadius(p.au, maxR, solarState.scaleMode);
    const pos = polar(cx, cy, r, PLANET_ANGLE_DEG);
    ctx.fillStyle = '#8fb4e0';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(220,235,255,0.8)';
    ctx.font = '10px "Space Mono", monospace';
    ctx.fillText(p['name_' + lang], pos.x + 6, pos.y - 6);
  });

  function drawVoyager(v, est, angle) {
    const r = ssRadius(est.au, maxR, solarState.scaleMode);
    const pos = polar(cx, cy, r, angle);
    ctx.strokeStyle = v.color;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(sunPos.x, sunPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = v.color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = v.color;
    ctx.font = 'bold 11px "Space Mono", monospace';
    ctx.fillText(v.name[lang], pos.x + 8, pos.y + 4);
    return pos;
  }
  drawVoyager(v1, e1, V1_ANGLE_DEG);
  drawVoyager(v2, e2, V2_ANGLE_DEG);
}

function applySolarViewTransform() {
  const wrap = document.getElementById('solar-canvas-wrap');
  if (!wrap) return;
  const isMobile = window.innerWidth < 768;
  if (solarState.view === '3d' && !isMobile) {
    wrap.style.transform = `perspective(900px) rotateX(${solarState.rotX}deg) rotateY(${solarState.rotY}deg)`;
  } else {
    wrap.style.transform = 'none';
  }
}

/**
 * The schematic canvas above is our own simplified, non-precision
 * visualization. This loads NASA/JPL's actual "Eyes on the Solar System"
 * 3D tool (eyes.nasa.gov) in an iframe — the real thing, with a real
 * spacecraft model and full mouse-drag orbit controls — but only once
 * the visitor asks for it, since it's a heavy third-party WebGL app we
 * don't want to force onto every single page load.
 */
function initEyesEmbed() {
  const container = document.getElementById('eyes-embed');
  const btn = document.getElementById('eyes-embed-load');
  if (!container || !btn) return;
  btn.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://eyes.nasa.gov/apps/solar-system/';
    iframe.title = 'NASA Eyes on the Solar System';
    iframe.loading = 'lazy';
    iframe.allow = 'fullscreen';
    iframe.className = 'eyes-embed__iframe';
    container.innerHTML = '';
    container.appendChild(iframe);
  }, { once: true });
}

function initSolarSystemControls() {
  initEyesEmbed();
  const view2d = document.getElementById('solar-view-2d');
  const view3d = document.getElementById('solar-view-3d');
  const scaleReal = document.getElementById('solar-scale-real');
  const scaleLog = document.getElementById('solar-scale-log');
  const resetBtn = document.getElementById('solar-reset');
  const wrap = document.getElementById('solar-canvas-wrap');

  view2d?.addEventListener('click', () => { solarState.view = '2d'; view2d.classList.add('active'); view3d.classList.remove('active'); applySolarViewTransform(); });
  view3d?.addEventListener('click', () => {
    if (window.innerWidth < 768) return;
    solarState.view = '3d'; view3d.classList.add('active'); view2d.classList.remove('active'); applySolarViewTransform();
  });
  scaleReal?.addEventListener('click', () => { solarState.scaleMode = 'real'; scaleReal.classList.add('active'); scaleLog.classList.remove('active'); drawSolarSystem(); });
  scaleLog?.addEventListener('click', () => { solarState.scaleMode = 'log'; scaleLog.classList.add('active'); scaleReal.classList.remove('active'); drawSolarSystem(); });
  resetBtn?.addEventListener('click', () => { solarState.rotY = 0; solarState.rotX = 18; applySolarViewTransform(); });

  if (wrap) {
    let dragging = false, lastX = 0, lastY = 0;
    wrap.addEventListener('pointerdown', (e) => {
      if (solarState.view !== '3d') return;
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      wrap.classList.add('is-dragging');
      wrap.setPointerCapture?.(e.pointerId);
    });
    window.addEventListener('pointerup', () => { dragging = false; wrap.classList.remove('is-dragging'); });
    window.addEventListener('pointercancel', () => { dragging = false; wrap.classList.remove('is-dragging'); });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      solarState.rotY += (e.clientX - lastX) * 0.3;
      solarState.rotX = Math.min(SOLAR_ROT_X_MAX, Math.max(SOLAR_ROT_X_MIN, solarState.rotX - (e.clientY - lastY) * 0.3));
      lastX = e.clientX;
      lastY = e.clientY;
      applySolarViewTransform();
    });

    // Keyboard equivalent of the drag gesture, for people who can't (or
    // don't want to) drag with a mouse/touch — arrow keys nudge the same
    // rotX/rotY the pointer handlers above control.
    const KEY_STEP_DEG = 8;
    wrap.addEventListener('keydown', (e) => {
      if (solarState.view !== '3d') return;
      let handled = true;
      if (e.key === 'ArrowLeft') solarState.rotY -= KEY_STEP_DEG;
      else if (e.key === 'ArrowRight') solarState.rotY += KEY_STEP_DEG;
      else if (e.key === 'ArrowUp') solarState.rotX = Math.min(SOLAR_ROT_X_MAX, solarState.rotX + KEY_STEP_DEG);
      else if (e.key === 'ArrowDown') solarState.rotX = Math.max(SOLAR_ROT_X_MIN, solarState.rotX - KEY_STEP_DEG);
      else handled = false;
      if (handled) {
        e.preventDefault(); // stop arrow keys from also scrolling the page
        applySolarViewTransform();
      }
    });
  }
  window.addEventListener('resize', () => { drawSolarSystem(); applySolarViewTransform(); });
}

document.addEventListener('langchange', drawSolarSystem);
