/**
 * compare.js — Voyager 1 vs Voyager 2 comparison table, "who is
 * farther" visualization, and distance-between-the-two-spacecraft
 * calculation using a simplified 3D geometric model (astronomy.js).
 * Longitude values below are illustrative headings (not precise RA/Dec)
 * used only to visually separate the two divergent trajectories.
 */
/* Illustrative ecliptic-longitude headings only (not precise RA/Dec),
   chosen so the resulting angular separation (~90°) roughly matches
   NASA's general description of the two divergent escape trajectories. */
const V1_LONGITUDE_DEG = 60;
const V2_LONGITUDE_DEG = 99;

function renderCompare() {
  const body = document.getElementById('compare-table-body');
  if (!body || !VOYAGER_DATA.voyager1) return;
  const lang = getLang();
  const v1 = VOYAGER_DATA.voyager1, v2 = VOYAGER_DATA.voyager2;
  const e1 = currentEstimate(v1), e2 = currentEstimate(v2);
  const activeCount = (v) => v.instruments.active.length + ' / ' + v.instruments.totalExperiments;
  const rows = [
    [t('compare.row.launch'), v1.launch.date, v2.launch.date],
    [t('compare.row.distanceEarth'), formatAU(e1.au), formatAU(e2.au)],
    [t('compare.row.distanceSun'), formatAU(e1.au), formatAU(e2.au)],
    [t('compare.row.speed'), `${v1.speedKmS} ${t('unit.kmS')}`, `${v2.speedKmS} ${t('unit.kmS')}`],
    [t('compare.row.signalDelay'), formatHours(e1.delayOneWay, lang), formatHours(e2.delayOneWay, lang)],
    [t('compare.row.interstellar'), v1.interstellar.date, v2.interstellar.date],
    [t('compare.row.status'), v1.status[lang + '_kid'] || v1.status[lang], v2.status[lang + '_kid'] || v2.status[lang]],
    [t('compare.row.instruments'), activeCount(v1), activeCount(v2)],
    [t('compare.row.direction'), v1.direction['note_' + lang + '_kid'] || v1.direction['note_' + lang], v2.direction['note_' + lang + '_kid'] || v2.direction['note_' + lang]]
  ];
  body.innerHTML = rows.map((r) => `<tr><th scope="row">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
}

function renderFartherViz() {
  const container = document.getElementById('farther-viz');
  if (!container || !VOYAGER_DATA.voyager1) return;
  const lang = getLang();
  const v1 = VOYAGER_DATA.voyager1, v2 = VOYAGER_DATA.voyager2;
  const e1 = currentEstimate(v1), e2 = currentEstimate(v2);
  const farther = e1.au >= e2.au ? v1 : v2;
  const nearer = farther === v1 ? v2 : v1;
  const total = Math.max(e1.au, e2.au);
  const pctFar = 92;
  const pctNear = Math.max(8, (Math.min(e1.au, e2.au) / total) * 92);
  container.innerHTML = `
    <div class="farther-track">
      <div class="farther-label farther-label--earth">${t('farther.earth')}</div>
      <div class="farther-bar farther-bar--near" style="width:${pctNear}%; --accent:${nearer.color}">
        <span>${nearer.name[lang]}</span>
      </div>
      <div class="farther-bar farther-bar--far" style="width:${pctFar}%; --accent:${farther.color}">
        <span>${farther.name[lang]}</span>
      </div>
    </div>
    <p class="farther-line">${farther === VOYAGER_DATA.voyager1 ? t('farther.v1Line') : t('farther.v2Line')}</p>
    <p class="farther-diff">${t('farther.diff')}: ${formatAU(Math.abs(e1.au - e2.au))}</p>
  `;
}

function renderDistanceBetween() {
  const container = document.getElementById('between-values');
  if (!container || !VOYAGER_DATA.voyager1) return;
  const lang = getLang();
  const v1 = VOYAGER_DATA.voyager1, v2 = VOYAGER_DATA.voyager2;
  const e1 = currentEstimate(v1), e2 = currentEstimate(v2);
  const p1 = heliocentricPosition(e1.au, v1.direction.eclipticAngleDeg, v1.direction.hemisphere, V1_LONGITUDE_DEG);
  const p2 = heliocentricPosition(e2.au, v2.direction.eclipticAngleDeg, v2.direction.hemisphere, V2_LONGITUDE_DEG);
  const distAU = distanceBetweenPoints(p1, p2);
  const distKm = auToKm(distAU);
  const distLightHours = (distKm / C_KM_S) / 3600;
  container.innerHTML = `
    <div class="between-stat"><span>${t('between.km')}</span><strong>${formatBillionKm(distKm, lang)}</strong></div>
    <div class="between-stat"><span>${t('between.au')}</span><strong>${formatAU(distAU)}</strong></div>
    <div class="between-stat"><span>${t('between.lighthours')}</span><strong>${distLightHours.toFixed(1)} h</strong></div>
  `;
}

function renderCompareAll() {
  renderCompare();
  renderFartherViz();
  renderDistanceBetween();
}

document.addEventListener('langchange', renderCompareAll);
