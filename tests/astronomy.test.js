const test = require('node:test');
const assert = require('node:assert/strict');
const {
  AU_KM, C_KM_S, DATA_CLASSIFICATION,
  daysBetween, estimateCurrentDistance, kmToAU, auToKm,
  signalDelayHours, heliocentricPosition, distanceBetweenPoints,
  formatAU, formatBillionKm, formatHours
} = require('../js/astronomy.js');

test('auToKm / kmToAU round-trip and match AU_KM', () => {
  assert.equal(auToKm(1), AU_KM);
  assert.equal(kmToAU(AU_KM), 1);
  const au = 143.167;
  assert.ok(Math.abs(kmToAU(auToKm(au)) - au) < 1e-9);
});

test('signalDelayHours: one-way vs round-trip', () => {
  const oneWay = signalDelayHours(AU_KM, false);
  const roundTrip = signalDelayHours(AU_KM, true);
  assert.equal(roundTrip, oneWay * 2);
  // 1 AU of light-travel time is the well-known ~8.3 minutes (~0.1385 h)
  assert.ok(Math.abs(oneWay - 0.1385) < 0.001);
});

test('signalDelayHours matches distance / speed of light', () => {
  const km = 25_632_267_036;
  const expectedHours = km / C_KM_S / 3600;
  assert.ok(Math.abs(signalDelayHours(km, false) - expectedHours) < 1e-9);
});

test('daysBetween counts whole days between two UTC dates', () => {
  const a = new Date('2026-04-17T00:00:00Z');
  const b = new Date('2026-08-25T00:00:00Z');
  assert.equal(daysBetween(a, b), 130);
});

test('estimateCurrentDistance projects forward using escape rate, never backward', () => {
  const baseline = { date: '2026-08-25', distanceFromEarthKm: 25_632_267_036 };
  const sameDay = estimateCurrentDistance(baseline, 3.561, new Date('2026-08-25T00:00:00Z'));
  assert.equal(sameDay.km, baseline.distanceFromEarthKm);

  const oneYearLater = estimateCurrentDistance(baseline, 3.561, new Date('2027-08-25T00:00:00Z'));
  assert.ok(oneYearLater.km > sameDay.km);
  assert.ok(Math.abs(oneYearLater.km - (baseline.distanceFromEarthKm + 3.561 * AU_KM)) < AU_KM * 0.01);

  // A "now" before the baseline date must clamp to 0 elapsed days, not go negative.
  const beforeBaseline = estimateCurrentDistance(baseline, 3.561, new Date('2020-01-01T00:00:00Z'));
  assert.equal(beforeBaseline.elapsedDays, 0);
  assert.equal(beforeBaseline.km, baseline.distanceFromEarthKm);
});

test('heliocentricPosition + distanceBetweenPoints: same point is zero distance', () => {
  const p1 = heliocentricPosition(171.556, 35, 'north', 60);
  const p2 = heliocentricPosition(171.556, 35, 'north', 60);
  assert.equal(distanceBetweenPoints(p1, p2), 0);
});

test('heliocentricPosition: north/south hemisphere mirrors the Z sign', () => {
  const north = heliocentricPosition(100, 40, 'north', 0);
  const south = heliocentricPosition(100, 40, 'south', 0);
  assert.ok(north.z > 0);
  assert.ok(south.z < 0);
  assert.ok(Math.abs(north.z + south.z) < 1e-9);
});

test('formatAU / formatBillionKm / formatHours produce the expected shapes', () => {
  assert.equal(formatAU(171.341), '171.3 AU');
  assert.equal(formatBillionKm(25_632_267_036), '25.632 billion km');
  assert.equal(formatBillionKm(21_417_468_516, 'zh'), '21.417 十億公里');
  assert.equal(formatHours(23.75), '23h 45m');
});

test('DATA_CLASSIFICATION exposes the four expected, stable string keys', () => {
  assert.deepEqual(DATA_CLASSIFICATION, {
    OFFICIAL: 'official',
    CALCULATED: 'calculated',
    ESTIMATED: 'estimated',
    HISTORICAL: 'historical'
  });
});
