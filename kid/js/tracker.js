/**
 * tracker.js — live dashboard cards, cosmic odometers, signal delay,
 * power system, mission status, science instruments, mission updates,
 * DSN panel, and the Voyager 1 / Voyager 2 detail blocks.
 * All numbers are derived from astronomy.js using the official NASA
 * baseline stored in data/voyagerN.json — never fabricated telemetry.
 */

const IS_KID_EDITION = document.documentElement.hasAttribute('data-repo-root');
let badgePopoverSeq = 0;

function pickLang(obj, lang, prefix = '') {
  if (!obj) return '';
  if (prefix) {
    if (IS_KID_EDITION && obj[prefix + '_' + lang + '_kid']) return obj[prefix + '_' + lang + '_kid'];
    return obj[prefix + '_' + lang] || obj[prefix + '_en'] || '';
  }
  if (IS_KID_EDITION && obj[lang + '_kid']) return obj[lang + '_kid'];
  return obj[lang] || obj.en || '';
}

function totalExperimentsText(lang, count) {
  if (lang === 'zh') return `${count} 項科學實驗`;
  if (lang === 'es') return `${count} experimentos en total`;
  if (lang === 'ja') return `科学実験 ${count} 項目`;
  return `${count} experiments total`;
}

function communicationText(lang) {
  if (lang === 'zh') return '深空網路（DSN）高增益天線';
  if (lang === 'es') return 'Antena de alta ganancia de la Red del Espacio Profundo (DSN)';
  if (lang === 'ja') return '深宇宙探査網（DSN）高利得アンテナ';
  return 'Deep Space Network (DSN) high-gain antenna';
}

function statusSinceText(lang, dateStr) {
  if (lang === 'zh') return `自 ${dateStr}`;
  if (lang === 'es') return `Desde ${dateStr}`;
  if (lang === 'ja') return `${dateStr} から`;
  return `Since ${dateStr}`;
}

function currentEstimate(v) {
  const now = new Date();
  const dist = estimateCurrentDistance(v.baseline, v.escapeRateAUyr, now);
  const delayOneWay = signalDelayHours(dist.km, false);
  const delayRoundTrip = signalDelayHours(dist.km, true);
  return { ...dist, delayOneWay, delayRoundTrip, now };
}

function sourceBadge(typeKey, source, sourceUrl, date) {
  const label = t('badge.' + typeKey);
  const popId = `badge-pop-${++badgePopoverSeq}`;
  const wrap = document.createElement('div');
  wrap.className = 'data-badge data-badge--' + typeKey;

  const btn = document.createElement('button');
  btn.className = 'badge-pill';
  btn.type = 'button';
  btn.setAttribute('popovertarget', popId);
  btn.textContent = `ⓘ ${label}`;

  const pop = document.createElement('div');
  pop.id = popId;
  pop.className = 'badge-popover';
  pop.setAttribute('popover', 'auto');

  const rows = [
    [t('source.label'), source || 'NASA Science'],
    [t('source.dataType'), label],
    [t('source.lastUpdated'), date || '—']
  ];
  rows.forEach(([k, val]) => {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = `${k}: `;
    p.append(strong, document.createTextNode(val));
    pop.appendChild(p);
  });

  if (sourceUrl) {
    const a = document.createElement('a');
    a.href = sourceUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = 'nasa.gov ↗';
    pop.appendChild(a);
  }

  // Fallback for browsers without native Popover API
  if (!('popover' in HTMLElement.prototype)) {
    btn.addEventListener('click', () => wrap.classList.toggle('open'));
  }

  wrap.append(btn, pop);
  return wrap;
}

function renderTrackerCards() {
  const container = document.getElementById('tracker-cards');
  if (!container) return;
  container.replaceChildren();
  [VOYAGER_DATA.voyager1, VOYAGER_DATA.voyager2].forEach((v) => {
    const lang = getLang();
    const est = currentEstimate(v);
    const card = document.createElement('article');
    card.className = 'tracker-card';
    card.style.setProperty('--accent', v.color);
    card.dataset.voyager = v.id;
    card.innerHTML = `
      <h3 class="tracker-card__title">${pickLang(v.name, lang)}</h3>
      <dl class="tracker-card__stats">
        <div class="stat"><dt>${t('tracker.distanceEarth')}</dt><dd class="js-distance">${formatBillionKm(est.km, lang)} <span class="stat-sub">(${formatAU(est.au)})</span></dd></div>
        <div class="stat"><dt>${t('tracker.speed')}</dt><dd>${v.speedKmS} ${t('unit.kmS')}</dd></div>
        <div class="stat"><dt>${t('tracker.signalDelay')}</dt><dd class="js-signal">${formatHours(est.delayOneWay, lang)}</dd></div>
        <div class="stat"><dt>${t('tracker.direction')}</dt><dd>${pickLang(v.direction, lang, 'note')}</dd></div>
        <div class="stat"><dt>${t('tracker.status')}</dt><dd class="status-pill">${pickLang(v.status, lang)}</dd></div>
      </dl>
      <div class="tracker-card__badges"></div>
      <p class="tracker-card__baseline">${t('tracker.baselineNote')}: ${v.baseline.date} · ${formatAU(v.baseline.distanceFromEarthAU)}</p>
    `;
    card.querySelector('.tracker-card__badges').append(
      sourceBadge(DATA_CLASSIFICATION.OFFICIAL, v.baseline.source, v.baseline.sourceUrl, v.baseline.date),
      sourceBadge(DATA_CLASSIFICATION.ESTIMATED, 'Calculated from NASA baseline', v.baseline.sourceUrl, est.now.toISOString().slice(0, 10))
    );
    container.appendChild(card);
  });
}

function renderOdometers() {
  const container = document.getElementById('odometer-cards');
  if (!container) return;
  container.replaceChildren();
  [VOYAGER_DATA.voyager1, VOYAGER_DATA.voyager2].forEach((v) => {
    const lang = getLang();
    const est = currentEstimate(v);
    const card = document.createElement('div');
    card.className = 'odometer-card';
    card.style.setProperty('--accent', v.color);
    card.innerHTML = `
      <h3>${pickLang(v.name, lang)}</h3>
      <div class="odometer-value js-odo" data-vid="${v.id}">${Math.round(est.km).toLocaleString(localeCode(lang))}</div>
      <div class="odometer-unit">${t('odometer.km')}</div>
    `;
    container.appendChild(card);
  });
}

function tickOdometers() {
  document.querySelectorAll('.js-odo').forEach((el) => {
    const v = VOYAGER_DATA[el.dataset.vid];
    if (!v) return;
    const est = currentEstimate(v);
    el.textContent = Math.round(est.km).toLocaleString(localeCode(getLang()));
  });
  document.querySelectorAll('.tracker-card').forEach((card) => {
    const v = VOYAGER_DATA[card.dataset.voyager];
    if (!v) return;
    const est = currentEstimate(v);
    const lang = getLang();
    const distEl = card.querySelector('.js-distance');
    const sigEl = card.querySelector('.js-signal');
    if (distEl) {
      const sub = document.createElement('span');
      sub.className = 'stat-sub';
      sub.textContent = `(${formatAU(est.au)})`;
      distEl.replaceChildren(document.createTextNode(`${formatBillionKm(est.km, lang)} `), sub);
    }
    if (sigEl) sigEl.textContent = formatHours(est.delayOneWay, lang);
  });
}

function renderSignalDelay() {
  const container = document.getElementById('signal-values');
  if (!container) return;
  container.replaceChildren();
  [VOYAGER_DATA.voyager1, VOYAGER_DATA.voyager2].forEach((v) => {
    const lang = getLang();
    const est = currentEstimate(v);
    const block = document.createElement('div');
    block.className = 'signal-block';
    block.style.setProperty('--accent', v.color);
    block.innerHTML = `
      <h3>${pickLang(v.name, lang)}</h3>
      <p class="signal-row"><span>${t('signal.oneway')}</span><strong>${formatHours(est.delayOneWay, lang)}</strong></p>
      <p class="signal-row"><span>${t('signal.roundtrip')}</span><strong>${formatHours(est.delayRoundTrip, lang)}</strong></p>
    `;
    container.appendChild(block);
  });
}

function renderPowerSystem() {
  const container = document.getElementById('power-cards');
  if (!container) return;
  container.replaceChildren();
  [VOYAGER_DATA.voyager1, VOYAGER_DATA.voyager2].forEach((v) => {
    const lang = getLang();
    const card = document.createElement('div');
    card.className = 'power-card';
    card.style.setProperty('--accent', v.color);
    card.innerHTML = `
      <h3>${pickLang(v.name, lang)}</h3>
      <p>${pickLang(v.power, lang, 'source')}</p>
      <p class="power-decline-tag">${t('badge.' + DATA_CLASSIFICATION.OFFICIAL)} · ~${v.power.declineWattsPerYear} W/yr</p>
    `;
    container.appendChild(card);
  });
}

function renderScienceInstruments() {
  const container = document.getElementById('science-grid');
  if (!container) return;
  container.replaceChildren();
  [VOYAGER_DATA.voyager1, VOYAGER_DATA.voyager2].forEach((v) => {
    const lang = getLang();
    const col = document.createElement('div');
    col.className = 'science-col';
    col.style.setProperty('--accent', v.color);
    const renderItem = (i, cls) => {
      const name = pickLang(i, lang, 'name');
      const note = pickLang(i, lang, 'note');
      return `<li class="instrument ${cls}">${name} <span class="instrument-code">${i.code}</span>${note ? ` <em>(${note})</em>` : ''}</li>`;
    };
    const activeItems = (v.instruments.active || []).map((i) => renderItem(i, 'instrument--active')).join('');
    const inactiveItems = (v.instruments.inactive || []).map((i) => renderItem(i, 'instrument--inactive')).join('');
    col.innerHTML = `
      <h3>${pickLang(v.name, lang)} <span class="science-total">(${totalExperimentsText(lang, v.instruments.totalExperiments)})</span></h3>
      <h4>${t('science.active')}</h4>
      <ul class="instrument-list" role="list">${activeItems}</ul>
      <h4>${t('science.inactive')}</h4>
      <ul class="instrument-list" role="list">${inactiveItems}</ul>
    `;
    container.appendChild(col);
  });
}

function renderMissionStatus() {
  const container = document.getElementById('status-cards');
  if (!container) return;
  container.replaceChildren();
  [VOYAGER_DATA.voyager1, VOYAGER_DATA.voyager2].forEach((v) => {
    const lang = getLang();
    const card = document.createElement('div');
    card.className = 'status-card';
    card.style.setProperty('--accent', v.color);
    card.innerHTML = `
      <h3>${pickLang(v.name, lang)}</h3>
      <p class="status-pill status-pill--lg">${t('status.extended')}</p>
      <p class="status-pill status-pill--lg">${t('status.interstellar')}</p>
      <p class="status-since">${statusSinceText(lang, v.interstellar.date)}</p>
    `;
    container.appendChild(card);
  });
}

function renderMissionUpdates() {
  const container = document.getElementById('updates-list');
  if (!container || !VOYAGER_DATA.mission) return;
  const lang = getLang();
  container.replaceChildren();
  (VOYAGER_DATA.mission.missionUpdates || []).forEach((u) => {
    const item = document.createElement('article');
    item.className = 'update-card';
    item.innerHTML = `
      <time>${u.date}</time>
      <h3>${pickLang(u, lang, 'title')}</h3>
      <p>${pickLang(u, lang, 'summary')}</p>
      <a href="${u.sourceUrl}" target="_blank" rel="noopener noreferrer">${u.source} ↗</a>
    `;
    container.appendChild(item);
  });
}

function renderDSN() {
  const container = document.getElementById('dsn-stations');
  if (!container || !VOYAGER_DATA.mission) return;
  const lang = getLang();
  const dsn = VOYAGER_DATA.mission.deepSpaceNetwork;
  container.replaceChildren();
  (dsn.stations || []).forEach((s) => {
    const el = document.createElement('div');
    el.className = 'dsn-station';
    el.innerHTML = `<span class="dsn-dot" aria-hidden="true"></span><strong>${s.name}</strong><span>${pickLang(s, lang, 'location')}</span>`;
    container.appendChild(el);
  });
}

function renderDetailBlocks() {
  [['detail-v1', VOYAGER_DATA.voyager1], ['detail-v2', VOYAGER_DATA.voyager2]].forEach(([id, v]) => {
    const container = document.getElementById(id);
    if (!container) return;
    const lang = getLang();
    const est = currentEstimate(v);
    container.innerHTML = `
      <h3>${pickLang(v.name, lang)}</h3>
      <dl class="detail-list">
        <div><dt>${t('detail.launchDate')}</dt><dd>${v.launch.date}</dd></div>
        <div><dt>${t('detail.launchVehicle')}</dt><dd>${v.launch.vehicle}</dd></div>
        <div><dt>${t('detail.mass')}</dt><dd>${v.massKg} kg</dd></div>
        <div><dt>${t('detail.speed')}</dt><dd>${v.speedKmS} ${t('unit.kmS')} (${v.escapeRateAUyr} ${t('unit.auYear')})</dd></div>
        <div><dt>${t('detail.distance')}</dt><dd>${formatAU(est.au)}</dd></div>
        <div><dt>${t('detail.power')}</dt><dd>${pickLang(v.power, lang, 'source')}</dd></div>
        <div><dt>${t('detail.communication')}</dt><dd>${communicationText(lang)}</dd></div>
        <div><dt>${t('detail.interstellarEntry')}</dt><dd>${v.interstellar.date}</dd></div>
      </dl>
    `;
  });
}

function renderAll() {
  renderTrackerCards();
  renderOdometers();
  renderSignalDelay();
  renderPowerSystem();
  renderScienceInstruments();
  renderMissionStatus();
  renderMissionUpdates();
  renderDSN();
  renderDetailBlocks();
  if (typeof renderCompareAll === 'function') renderCompareAll();
  if (typeof renderTimeline === 'function') renderTimeline();
  if (typeof renderGallery === 'function') renderGallery();
  if (typeof renderSources === 'function') renderSources();
  if (typeof renderGoldenRecordAndPBD === 'function') renderGoldenRecordAndPBD();
  if (typeof drawSolarSystem === 'function') drawSolarSystem();
}

document.addEventListener('langchange', renderAll);
