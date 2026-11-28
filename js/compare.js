/**
 * compare.js — Voyager 1 vs Voyager 2 comparison table, "who is
 * farther" visualization, and distance-between-the-two-spacecraft
 * calculation using a simplified 3D geometric model (astronomy.js).
 */
const V1_LONGITUDE_DEG = 60;
const V2_LONGITUDE_DEG = 99;

function compareField(obj, lang, prefix = '') {
  const isKid = document.documentElement.hasAttribute('data-repo-root');
  if (prefix) {
    if (isKid && obj[prefix + '_' + lang + '_kid']) return obj[prefix + '_' + lang + '_kid'];
    return obj[prefix + '_' + lang] || obj[prefix + '_en'] || '';
  }
  if (isKid && obj[lang + '_kid']) return obj[lang + '_kid'];
  return obj[lang] || obj.en || '';
}

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
    [t('compare.row.status'), compareField(v1.status, lang), compareField(v2.status, lang)],
    [t('compare.row.instruments'), activeCount(v1), activeCount(v2)],
    [t('compare.row.direction'), compareField(v1.direction, lang, 'note'), compareField(v2.direction, lang, 'note')]
  ];
  const frag = document.createDocumentFragment();
  rows.forEach(([label, c1, c2]) => {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = label;
    const td1 = document.createElement('td');
    td1.textContent = c1;
    const td2 = document.createElement('td');
    td2.textContent = c2;
    tr.append(th, td1, td2);
    frag.appendChild(tr);
  });
  body.replaceChildren(frag);
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
        <span>${compareField(nearer.name, lang)}</span>
      </div>
      <div class="farther-bar farther-bar--far" style="width:${pctFar}%; --accent:${farther.color}">
        <span>${compareField(farther.name, lang)}</span>
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
