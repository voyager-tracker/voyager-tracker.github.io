/**
 * fetch-horizons.ts
 *
 * Replaces the old "hand-typed NASA baseline + client-side linear
 * extrapolation" data source with a real, daily-refreshed baseline pulled
 * straight from the NASA JPL Horizons System (the same tool JPL itself
 * uses for precision ephemerides).
 *
 * What this does NOT change: the frontend (js/astronomy.js /
 * js/tracker.js) still does a short linear extrapolation between runs of
 * this script using `escapeRateAUyr`, so the on-page "live" number keeps
 * ticking between daily updates. What changes is that the anchor point
 * (`baseline`) it extrapolates from is now real, current Horizons data
 * instead of a stale, manually-entered figure (see the "→→→ baseline
 * drift" bug: Voyager 2's baseline had been stuck on 2017-11-05 while
 * Voyager 1's was 2026-04-17).
 *
 * ---- API notes (worth reading before touching this file) -------------
 * Endpoint: https://ssd.jpl.nasa.gov/api/horizons.api
 *   NOT https://ssd-api.jpl.nasa.gov/... — that host 404s. The `ssd-api.`
 *   subdomain is used by JPL's *other* SBDB/CAD/etc. APIs, but Horizons
 *   itself lives under plain `ssd.jpl.nasa.gov`. Verified by hand against
 *   the live API before writing this file.
 * No API key required.
 * Body codes: Voyager 1 = '-31', Voyager 2 = '-32'.
 *
 * VECTORS vs OBSERVER — why this script uses VECTORS:
 *   OBSERVER mode answers "what would an observer at CENTER see", and
 *   applies light-time / stellar-aberration corrections by default. That
 *   is the right tool if you want "what does the Deep Space Network see
 *   right now", but it's the wrong tool for "distance from the Sun" (the
 *   Sun isn't an observing station, and the site's own Methodology
 *   section already deliberately separates "distance" from "signal
 *   delay" as two different numbers derived from one geometric position).
 *   VECTORS mode with VEC_CORR='NONE' returns the raw geometric state
 *   vector (position + velocity) with no such correction, which is
 *   exactly the "true right-now position" the site's existing model
 *   already assumes. Distance and speed then fall out as simple vector
 *   magnitudes — no extra geometry needed, unlike OBSERVER's derived
 *   range/range-rate quantities which still need light-time reasoning
 *   to interpret correctly for this use case.
 * ------------------------------------------------------------------------
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const HORIZONS_ENDPOINT = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const AU_KM = 149597870.7;
const C_KM_S = 299792.458;
const SEC_PER_YEAR = 365.25 * 86400;

// Kept in sync by hand with DATA_CLASSIFICATION in js/astronomy.js — both
// sides of the pipeline (this ingestion script and the browser frontend)
// must agree on the same four-way vocabulary for tagging data provenance.
type DataClassification = 'official' | 'calculated' | 'estimated' | 'historical';
const DATA_CLASSIFICATION = {
  OFFICIAL: 'official',
  CALCULATED: 'calculated',
  ESTIMATED: 'estimated',
  HISTORICAL: 'historical'
} satisfies Record<string, DataClassification>;

interface SpacecraftTarget {
  id: 'voyager1' | 'voyager2';
  horizonsCommand: '-31' | '-32';
  jsonFileName: string;
}

const TARGETS: SpacecraftTarget[] = [
  { id: 'voyager1', horizonsCommand: '-31', jsonFileName: 'voyager1.json' },
  { id: 'voyager2', horizonsCommand: '-32', jsonFileName: 'voyager2.json' }
];

// The kids edition (kid/) has no data/ of its own — it fetches this same
// directory directly (see data-repo-root on kid/**/index.html), so there
// is exactly one copy to write.
const DATA_DIR = resolve('data');

interface StateVector {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
}

interface DerivedState {
  distanceKm: number;
  distanceAU: number;
  speedKmS: number;
  radialAUyr: number;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function queryVectors(command: string, center: string, date: string): Promise<StateVector> {
  const params = new URLSearchParams({
    format: 'text',
    COMMAND: `'${command}'`,
    OBJ_DATA: `'NO'`,
    MAKE_EPHEM: `'YES'`,
    EPHEM_TYPE: `'VECTORS'`,
    CENTER: `'${center}'`,
    VEC_CORR: `'NONE'`,
    OUT_UNITS: `'KM-S'`,
    START_TIME: `'${date}'`,
    STOP_TIME: `'${addDays(date, 1)}'`,
    STEP_SIZE: `'1d'`,
    VEC_TABLE: `'2'`
  });

  const url = `${HORIZONS_ENDPOINT}?${params.toString()}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) {
    throw new Error(`Horizons HTTP ${res.status} for COMMAND=${command} CENTER=${center}`);
  }
  const text = await res.text();
  return parseVectorsBlock(text, command, center);
}

/**
 * Horizons' plain-text output wraps the data table between literal
 * `$$SOE` / `$$EOE` markers. Inside, each requested timestamp produces a
 * date line followed by an "X = ... Y = ... Z = ..." line and a
 * "VX= ... VY= ... VZ= ..." line. We only asked for one real instant
 * (START_TIME), so we take the first entry and ignore the STOP_TIME echo.
 */
function parseVectorsBlock(text: string, command: string, center: string): StateVector {
  const soe = text.match(/\$\$SOE([\s\S]*?)\$\$EOE/);
  if (!soe) {
    throw new Error(
      `Horizons response for COMMAND=${command} CENTER=${center} has no $$SOE/$$EOE block ` +
      `(API output format may have changed). First 300 chars: ${text.slice(0, 300)}`
    );
  }
  const block = soe[1];
  const m = block.match(
    /X\s*=\s*([-+0-9.Ee]+)\s*Y\s*=\s*([-+0-9.Ee]+)\s*Z\s*=\s*([-+0-9.Ee]+)[\s\S]*?VX\s*=\s*([-+0-9.Ee]+)\s*VY\s*=\s*([-+0-9.Ee]+)\s*VZ\s*=\s*([-+0-9.Ee]+)/
  );
  if (!m) {
    throw new Error(
      `Could not parse X/Y/Z/VX/VY/VZ out of Horizons vectors block for COMMAND=${command} CENTER=${center}. ` +
      `Block was: ${block.slice(0, 300)}`
    );
  }
  const [x, y, z, vx, vy, vz] = m.slice(1).map(Number);
  if ([x, y, z, vx, vy, vz].some((n) => !Number.isFinite(n))) {
    throw new Error(`Parsed non-finite vector component for COMMAND=${command} CENTER=${center}`);
  }
  return { x, y, z, vx, vy, vz };
}

function derive(v: StateVector): DerivedState {
  const distanceKm = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
  const speedKmS = Math.sqrt(v.vx ** 2 + v.vy ** 2 + v.vz ** 2);
  const radialKmS = (v.x * v.vx + v.y * v.vy + v.z * v.vz) / distanceKm;
  const radialAUyr = (radialKmS * SEC_PER_YEAR) / AU_KM;
  return { distanceKm, distanceAU: distanceKm / AU_KM, speedKmS, radialAUyr };
}

interface FetchedSpacecraft {
  target: SpacecraftTarget;
  earth: DerivedState;
  sun: DerivedState;
}

/**
 * Sanity checks (per project requirements): reject anything that looks
 * like a parsing/unit mistake rather than real physics, and NEVER let a
 * bad fetch overwrite good existing data.
 *   - distances must be positive, finite, and in a plausible range for
 *     an interstellar spacecraft (60–400 AU — generous on both sides so
 *     this script keeps working for years without being re-tuned).
 *   - heliocentric speed must be in a plausible range for Voyager
 *     (5–30 km/s — real values are ~15–17 km/s; wide margin on purpose).
 *   - distance from the Sun must not have DECREASED since the last
 *     stored baseline (both spacecraft are on a one-way hyperbolic
 *     escape trajectory) beyond a tiny floating-point tolerance.
 *   - the day-over-day change must roughly match the previously stored
 *     escape rate — catches unit errors (e.g. km vs AU) that would
 *     otherwise still "look" like a plausible standalone number.
 */
function sanityCheck(
  id: string,
  fresh: FetchedSpacecraft,
  previousBaselineAU: number,
  previousEscapeRateAUyr: number,
  elapsedDays: number
): void {
  const { earth, sun } = fresh;
  for (const [label, s] of [['earth', earth], ['sun', sun]] as const) {
    if (!Number.isFinite(s.distanceAU) || s.distanceAU <= 0) {
      throw new Error(`[${id}] non-positive/non-finite distance from ${label}: ${s.distanceAU}`);
    }
    if (s.distanceAU < 60 || s.distanceAU > 400) {
      throw new Error(`[${id}] distance from ${label} (${s.distanceAU.toFixed(1)} AU) is outside the plausible 60-400 AU range`);
    }
  }
  if (sun.speedKmS < 5 || sun.speedKmS > 30) {
    throw new Error(`[${id}] heliocentric speed (${sun.speedKmS.toFixed(2)} km/s) is outside the plausible 5-30 km/s range`);
  }
  const floorTolerance = 0.02; // AU — absorbs same-day re-runs / tiny numerical noise
  if (sun.distanceAU < previousBaselineAU - floorTolerance) {
    throw new Error(
      `[${id}] new heliocentric distance (${sun.distanceAU.toFixed(3)} AU) is LESS than the previous baseline ` +
      `(${previousBaselineAU.toFixed(3)} AU) — Voyager cannot move closer to the Sun on its escape trajectory`
    );
  }
  const expectedChangeAU = previousEscapeRateAUyr * (Math.max(elapsedDays, 0) / 365.25);
  const actualChangeAU = sun.distanceAU - previousBaselineAU;
  const toleranceAU = Math.max(expectedChangeAU * 5, 0.05);
  if (Math.abs(actualChangeAU - expectedChangeAU) > toleranceAU) {
    throw new Error(
      `[${id}] day-over-day distance change (${actualChangeAU.toFixed(4)} AU over ${elapsedDays.toFixed(1)} days) ` +
      `is wildly out of line with the expected ~${expectedChangeAU.toFixed(4)} AU from the stored escape rate ` +
      `— refusing to write (possible unit/parsing bug)`
    );
  }
}

function loadJson(dir: string, fileName: string): any {
  return JSON.parse(readFileSync(resolve(dir, fileName), 'utf8'));
}

interface BaselineFields {
  date: string;
  distanceFromEarthKm: number;
  distanceFromEarthAU: number;
  distanceFromSunAU: number;
  signalDelayOneWayHours: number;
  source: string;
  sourceUrl: string;
  note_en: string;
  note_zh: string;
  note_es: string;
  note_ja: string;
}

function renderBaselineBlock(b: BaselineFields): string {
  return [
    '  "baseline": {',
    `    "date": "${b.date}",`,
    `    "distanceFromEarthKm": ${b.distanceFromEarthKm},`,
    `    "distanceFromEarthAU": ${b.distanceFromEarthAU},`,
    `    "distanceFromSunAU": ${b.distanceFromSunAU},`,
    `    "signalDelayOneWayHours": ${b.signalDelayOneWayHours},`,
    `    "source": "${b.source}",`,
    `    "sourceUrl": "${b.sourceUrl}",`,
    `    "note_en": "${b.note_en}",`,
    `    "note_zh": "${b.note_zh}",`,
    `    "note_es": "${b.note_es}",`,
    `    "note_ja": "${b.note_ja}"`,
    '  },'
  ].join('\n');
}

/**
 * Rewrites only the `escapeRateAUyr` / `speedKmS` scalar lines and the
 * whole `baseline` object in place, byte-for-byte preserving every other
 * line in the file (name/launch/instruments/etc.) — a JSON.parse +
 * JSON.stringify round-trip would "work" but reformats the entire file
 * (JSON.stringify has no memory of the original whitespace), producing a
 * huge, noisy diff for what is conceptually a 3-field update.
 */
function updateDataFile(dir: string, fileName: string, escapeRateAUyr: number, speedKmS: number, baseline: BaselineFields): void {
  const filePath = resolve(dir, fileName);
  const original = readFileSync(filePath, 'utf8');

  let updated = original
    .replace(/"escapeRateAUyr":\s*-?[\d.]+,/, `"escapeRateAUyr": ${escapeRateAUyr},`)
    .replace(/"speedKmS":\s*-?[\d.]+,/, `"speedKmS": ${speedKmS},`);

  const baselineBlockRegex = /  "baseline": \{[\s\S]*?\n  \},/;
  if (!baselineBlockRegex.test(updated)) {
    throw new Error(`Could not locate a "baseline": { ... }, block to replace in ${filePath}`);
  }
  updated = updated.replace(baselineBlockRegex, renderBaselineBlock(baseline));

  writeFileSync(filePath, updated, 'utf8');
}

async function fetchSpacecraft(target: SpacecraftTarget, date: string): Promise<FetchedSpacecraft> {
  const [earthVec, sunVec] = await Promise.all([
    queryVectors(target.horizonsCommand, '500@399', date),
    queryVectors(target.horizonsCommand, '500@10', date)
  ]);
  return { target, earth: derive(earthVec), sun: derive(sunVec) };
}

function buildBaselineNote(date: string, command: string) {
  return {
    note_en: `Geometric state vector from JPL Horizons (no light-time correction), target ${command}, epoch ${date} 00:00 TDB.`,
    note_zh: `取自 NASA JPL Horizons 之幾何狀態向量（未做光行時間修正），目標代號 ${command}，時間點為 ${date} 00:00 TDB。`,
    note_es: `Vector de estado geométrico de JPL Horizons (sin corrección por tiempo de luz), objetivo ${command}, época ${date} 00:00 TDB.`,
    note_ja: `JPL Horizonsによる幾何学的状態ベクトル（光行時間補正なし）、ターゲット ${command}、時刻 ${date} 00:00 TDB。`
  };
}

async function main(): Promise<void> {
  const dateArg = process.argv.find((a) => a.startsWith('--date='));
  const date = dateArg ? dateArg.split('=')[1] : new Date().toISOString().slice(0, 10);

  console.log(`Fetching JPL Horizons vectors for epoch ${date} 00:00 TDB…`);

  const results: FetchedSpacecraft[] = [];
  for (const target of TARGETS) {
    const primaryDir = 'data';
    const existing = loadJson(primaryDir, target.jsonFileName);
    const previousBaselineAU: number = existing.baseline.distanceFromSunAU;
    const previousEscapeRateAUyr: number = existing.escapeRateAUyr;
    const previousDate: string = existing.baseline.date;
    const elapsedDays = (new Date(date + 'T00:00:00Z').getTime() - new Date(previousDate + 'T00:00:00Z').getTime()) / 86_400_000;

    const fresh = await fetchSpacecraft(target, date);
    sanityCheck(target.id, fresh, previousBaselineAU, previousEscapeRateAUyr, elapsedDays);
    results.push(fresh);
    console.log(
      `  ✓ ${target.id}: ${fresh.earth.distanceAU.toFixed(3)} AU from Earth, ` +
      `${fresh.sun.distanceAU.toFixed(3)} AU from Sun, ${fresh.sun.speedKmS.toFixed(3)} km/s heliocentric`
    );
  }

  // All fetches + sanity checks passed — now (and only now) write files.
  for (const { target, earth, sun } of results) {
    const baseline: BaselineFields = {
      date,
      distanceFromEarthKm: Math.round(earth.distanceKm),
      distanceFromEarthAU: Number(earth.distanceAU.toFixed(3)),
      distanceFromSunAU: Number(sun.distanceAU.toFixed(3)),
      signalDelayOneWayHours: Number((earth.distanceKm / C_KM_S / 3600).toFixed(2)),
      source: 'NASA JPL Horizons API',
      sourceUrl: 'https://ssd.jpl.nasa.gov/horizons/',
      ...buildBaselineNote(date, target.horizonsCommand)
    };
    updateDataFile(DATA_DIR, target.jsonFileName, Number(sun.radialAUyr.toFixed(3)), Number(sun.speedKmS.toFixed(1)), baseline);
  }

  console.log(`Done. Updated baseline (${DATA_CLASSIFICATION.OFFICIAL}) for ${date} in: ${DATA_DIR}`);
}

main().catch((err) => {
  console.error('Horizons fetch failed — leaving existing data/*.json untouched.');
  console.error(err instanceof Error ? (err.stack ?? err.message) : err);
  process.exitCode = 1;
});
