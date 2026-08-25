/**
 * data.js — loads the data layer (NASA-sourced JSON) and exposes it as
 * window.VOYAGER_DATA. Falls back to a cached snapshot, then to an
 * inline last-resort copy, so the UI never shows a blank page.
 */
const VOYAGER_DATA = {
  voyager1: null,
  voyager2: null,
  mission: null,
  sources: null,
  gallery: null,
  usingFallback: false,
  usingCache: false
};

const INLINE_FALLBACK = {
  voyager1: {
    id: 'voyager1', name: { en: 'Voyager 1', zh: '航海家1號' },
    launch: { date: '1977-09-05', vehicle: 'Titan IIIE-Centaur', site_en: 'Cape Canaveral, Florida', site_zh: '美國佛羅里達州卡納維爾角' },
    massKg: 733, escapeRateAUyr: 3.5, speedKmS: 16.9, speedKmH: 61000,
    direction: { eclipticAngleDeg: 35, hemisphere: 'north', note_en: 'About 35° north of the ecliptic plane.', note_zh: '位於黃道面以北約35度。' },
    interstellar: { date: '2012-08-25' },
    baseline: { date: '2026-04-17', distanceFromEarthKm: 25900000000, distanceFromEarthAU: 173.1, distanceFromSunAU: 173.1, signalDelayOneWayHours: 24.0, source: 'NASA Science', sourceUrl: 'https://science.nasa.gov/mission/voyager/' },
    status: { en: 'Extended Mission — Interstellar Space', zh: '延伸任務中 — 位於星際空間' },
    instruments: { totalExperiments: 11, active: [], inactive: [] },
    trajectory: [], color: '#4fd1ff'
  },
  voyager2: {
    id: 'voyager2', name: { en: 'Voyager 2', zh: '航海家2號' },
    launch: { date: '1977-08-20', vehicle: 'Titan IIIE-Centaur', site_en: 'Cape Canaveral, Florida', site_zh: '美國佛羅里達州卡納維爾角' },
    massKg: 721.9, escapeRateAUyr: 3.1, speedKmS: 15.4, speedKmH: 55000,
    direction: { eclipticAngleDeg: 48, hemisphere: 'south', note_en: 'About 48° south of the ecliptic plane.', note_zh: '位於黃道面以南約48度。' },
    interstellar: { date: '2018-11-05' },
    baseline: { date: '2017-11-05', distanceFromEarthKm: 17378000000, distanceFromEarthAU: 116.167, distanceFromSunAU: 116.167, signalDelayOneWayHours: 16.1, source: 'NASA Science', sourceUrl: 'https://science.nasa.gov/mission/voyager/' },
    status: { en: 'Extended Mission — Interstellar Space', zh: '延伸任務中 — 位於星際空間' },
    instruments: { totalExperiments: 11, active: [], inactive: [] },
    trajectory: [], color: '#ffb84f'
  },
  mission: { goldenRecord: {}, paleBlueDot: {}, deepSpaceNetwork: { stations: [] }, missionUpdates: [] },
  sources: {
    official: [{ name: 'NASA Voyager Mission', url: 'https://science.nasa.gov/mission/voyager/' }],
    supplementary: [{ name: 'Wikipedia — Voyager 1', url: 'https://en.wikipedia.org/wiki/Voyager_1' }]
  },
  gallery: []
};

const SITE_ROOT = document.documentElement.getAttribute('data-site-root') || './';

async function fetchJson(path) {
  const res = await fetch(SITE_ROOT + path, { cache: 'no-cache' });
  if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + path);
  return res.json();
}

async function loadVoyagerData() {
  try {
    const [v1, v2, mission, sources, gallery] = await Promise.all([
      fetchJson('data/voyager1.json'),
      fetchJson('data/voyager2.json'),
      fetchJson('data/mission.json'),
      fetchJson('data/sources.json'),
      fetchJson('data/gallery.json')
    ]);
    VOYAGER_DATA.voyager1 = v1;
    VOYAGER_DATA.voyager2 = v2;
    VOYAGER_DATA.mission = mission;
    VOYAGER_DATA.sources = sources;
    VOYAGER_DATA.gallery = gallery;
    return VOYAGER_DATA;
  } catch (primaryErr) {
    console.warn('Primary data load failed, trying cached snapshot:', primaryErr);
    try {
      const cached = await fetchJson('data/latest-known.json');
      VOYAGER_DATA.voyager1 = { ...INLINE_FALLBACK.voyager1, ...cached.voyager1 };
      VOYAGER_DATA.voyager2 = { ...INLINE_FALLBACK.voyager2, ...cached.voyager2 };
      VOYAGER_DATA.mission = INLINE_FALLBACK.mission;
      VOYAGER_DATA.sources = INLINE_FALLBACK.sources;
      VOYAGER_DATA.gallery = INLINE_FALLBACK.gallery;
      VOYAGER_DATA.usingCache = true;
      showDataLinkBanner();
      return VOYAGER_DATA;
    } catch (cacheErr) {
      console.error('Cached snapshot also failed, using inline fallback:', cacheErr);
      Object.assign(VOYAGER_DATA, INLINE_FALLBACK);
      VOYAGER_DATA.usingFallback = true;
      showDataLinkBanner();
      return VOYAGER_DATA;
    }
  }
}

function showDataLinkBanner() {
  const banner = document.getElementById('data-link-banner');
  if (!banner) return;
  banner.hidden = false;
  const titleKey = VOYAGER_DATA.usingCache ? 'error.cached' : 'error.dataLink';
  banner.querySelector('[data-i18n]')?.setAttribute('data-i18n', titleKey);
  applyTranslations(getLang());
}
