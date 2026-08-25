/**
 * astronomy.js
 * Shared physical constants and calculation helpers.
 * All "current" distances are ESTIMATED by projecting forward from an
 * official NASA baseline (date + distance) using the official escape
 * rate (AU/year). This is explicitly a calculated estimate, not live
 * NASA telemetry. See DATA & METHODOLOGY section on the site.
 */
const AU_KM = 149597870.7;
const C_KM_S = 299792.458;
const MS_PER_DAY = 86400000;
const DAYS_PER_YEAR = 365.25;

/**
 * Shared data-provenance classification, used to tag every figure shown
 * on the site with where it came from (see DATA & METHODOLOGY section).
 * Keep this in sync with the mirrored `DataClassification` type in
 * scripts/fetch-horizons.ts so both sides of the pipeline agree on the
 * same vocabulary.
 *   OFFICIAL   — reported directly by NASA/JPL (incl. JPL Horizons ephemeris)
 *   CALCULATED — deterministic math on official figures (unit conversions, light-time)
 *   ESTIMATED  — projected from an official baseline + rate (not live telemetry)
 *   HISTORICAL — fixed historical facts from mission records
 */
const DATA_CLASSIFICATION = Object.freeze({
  OFFICIAL: 'official',
  CALCULATED: 'calculated',
  ESTIMATED: 'estimated',
  HISTORICAL: 'historical'
});

function daysBetween(dateA, dateB) {
  return (dateB.getTime() - dateA.getTime()) / MS_PER_DAY;
}

/**
 * Project a spacecraft's distance from Earth forward from its NASA baseline.
 * @param {object} baseline - { date, distanceFromEarthKm }
 * @param {number} escapeRateAUyr
 * @param {Date} now
 * @returns {{ km: number, au: number, elapsedDays: number }}
 */
function estimateCurrentDistance(baseline, escapeRateAUyr, now) {
  const baseDate = new Date(baseline.date + 'T00:00:00Z');
  const elapsedDays = Math.max(0, daysBetween(baseDate, now));
  const elapsedYears = elapsedDays / DAYS_PER_YEAR;
  const addedKm = escapeRateAUyr * AU_KM * elapsedYears;
  const km = baseline.distanceFromEarthKm + addedKm;
  return { km, au: km / AU_KM, elapsedDays };
}

function kmToAU(km) {
  return km / AU_KM;
}

function auToKm(au) {
  return au * AU_KM;
}

function signalDelayHours(km, roundTrip) {
  const seconds = km / C_KM_S;
  const hours = seconds / 3600;
  return roundTrip ? hours * 2 : hours;
}

/**
 * Very simplified 3D heliocentric position model.
 * Each Voyager is modeled as moving radially outward from the Sun at a
 * FIXED ecliptic latitude (its known escape-trajectory angle) and a fixed
 * ecliptic longitude, using the NASA-published direction description.
 * This is a geometric approximation for educational visualization —
 * NOT a precision JPL Horizons ephemeris.
 */
function heliocentricPosition(distanceAU, eclipticAngleDeg, hemisphere, longitudeDeg) {
  const lat = (hemisphere === 'south' ? -1 : 1) * eclipticAngleDeg * (Math.PI / 180);
  const lon = longitudeDeg * (Math.PI / 180);
  const x = distanceAU * Math.cos(lat) * Math.cos(lon);
  const y = distanceAU * Math.cos(lat) * Math.sin(lon);
  const z = distanceAU * Math.sin(lat);
  return { x, y, z };
}

function distanceBetweenPoints(p1, p2) {
  const dx = p1.x - p2.x, dy = p1.y - p2.y, dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function localeCode(locale) {
  if (locale === 'zh') return 'zh-TW';
  if (locale === 'es') return 'es-ES';
  if (locale === 'ja') return 'ja-JP';
  return 'en-US';
}

function formatKm(km, locale) {
  return Math.round(km).toLocaleString(localeCode(locale)) + ' km';
}

function formatAU(au) {
  return au.toFixed(1) + ' AU';
}

function formatBillionKm(km, locale) {
  const b = km / 1e9;
  const units = { zh: ' 十億公里', es: ' mil millones de km', ja: ' 十億km' };
  return b.toFixed(3) + (units[locale] || ' billion km');
}

function formatHours(hours, locale) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (locale === 'zh') return `${h} 小時 ${m} 分`;
  if (locale === 'es') return `${h} h ${m} min`;
  if (locale === 'ja') return `${h} 時間 ${m} 分`;
  return `${h}h ${m}m`;
}

// Node-only export (unit tests). No-op in the browser, where `module` is undefined.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AU_KM, C_KM_S, MS_PER_DAY, DAYS_PER_YEAR, DATA_CLASSIFICATION,
    daysBetween, estimateCurrentDistance, kmToAU, auToKm,
    signalDelayHours, heliocentricPosition, distanceBetweenPoints,
    localeCode, formatKm, formatAU, formatBillionKm, formatHours
  };
}
