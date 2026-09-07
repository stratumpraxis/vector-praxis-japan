import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { scoreCapability, validateRegistry, shouldStopExploration } from '../capability-lab/external-capability-scoring.mjs';

const registry = JSON.parse(fs.readFileSync(new URL('../capability-lab/external-capability-registry.json', import.meta.url), 'utf8'));

const SCORE_KEYS = [
  'external_reach','signal_quality','revenue_distance','automation','owner_burden',
  'free_sustainability','safety_policy','reliability','return_path','market_synergy'
];

const risk = {
  free_tier_change: 'LOW', api_shutdown: 'LOW', terms_change: 'LOW', vendor_lock_in: 'LOW',
  authentication: 'LOW', rate_limit: 'LOW', schema_change: 'LOW'
};

function baseCapability(overrides = {}) {
  return {
    id: 'cap',
    state: 'AVAILABLE',
    overlap: 'NEW_SENSOR',
    classes: ['EYES'],
    polling_mode: 'ON_DEMAND',
    signal_change_speed: 'MEDIUM',
    expected_revenue_utility: 8,
    maintenance_burden: 2,
    revenue_evidence_score: 0,
    dependency_risks: risk,
    evidence: [],
    scores: Object.fromEntries(SCORE_KEYS.map((key) => [key, 8])),
    ...overrides
  };
}

test('seed external capability registry is structurally valid', () => {
  const result = validateRegistry(registry);
  assert.equal(result.status, 'PASS', result.errors.join('\n'));
});

test('AVAILABLE and CONNECTED are not counted as usable MARKET capabilities', () => {
  assert.equal(scoreCapability(baseCapability({ state: 'AVAILABLE' })).usable, false);
  assert.equal(scoreCapability(baseCapability({ state: 'CONNECTED', evidence: ['connection-config'] })).usable, false);
});

test('CONNECTED or stronger state cannot exist without Evidence', () => {
  const result = scoreCapability(baseCapability({ state: 'CONNECTED', evidence: [] }));
  assert.ok(result.errors.includes('connected_or_higher_requires_evidence'));
});

test('VERIFIED requires last_verified_at', () => {
  const result = scoreCapability(baseCapability({ state: 'VERIFIED', evidence: ['real-read'] }));
  assert.ok(result.errors.includes('verified_or_higher_requires:last_verified_at'));
});

test('high score does not make FULL_DUPLICATE a promotion candidate', () => {
  const result = scoreCapability(baseCapability({
    overlap: 'FULL_DUPLICATE',
    scores: Object.fromEntries(SCORE_KEYS.map((key) => [key, 10]))
  }));
  assert.equal(result.capability_score, 100);
  assert.equal(result.recommendation, 'KILL_OR_IGNORE');
});

test('unsafe action capability cannot become PRIORITY_VERIFY on score alone', () => {
  const scores = Object.fromEntries(SCORE_KEYS.map((key) => [key, 10]));
  scores.safety_policy = 4;
  const result = scoreCapability(baseCapability({ classes: ['MOUTH_HANDS'], scores }));
  assert.equal(result.recommendation, 'SAFETY_HOLD');
});

test('maintenance burden blocks AVAILABLE promotion even when structurally attractive', () => {
  const result = scoreCapability(baseCapability({ expected_revenue_utility: 4, maintenance_burden: 7 }));
  assert.equal(result.budget_pass, false);
  assert.equal(result.recommendation, 'AVAILABLE_HOLD');
});

test('high-frequency polling requires a fast-changing signal', () => {
  const result = scoreCapability(baseCapability({ polling_mode: 'HIGH_FREQUENCY_POLLING', signal_change_speed: 'SLOW' }));
  assert.ok(result.errors.includes('high_frequency_polling_requires_fast_signal'));
});

test('registry forbids duplicate capability ids', () => {
  const duplicate = { ...registry.capabilities[0] };
  const result = validateRegistry({ capabilities: [duplicate, duplicate] });
  assert.equal(result.status, 'FAIL');
  assert.ok(result.errors.some((error) => error.startsWith('duplicate:id:')));
});

test('exploration stops when a winner route exists', () => {
  const result = shouldStopExploration({ winner_route_active: true, expected_revenue_utility: 9, maintenance_burden: 1 });
  assert.equal(result.stop, true);
  assert.ok(result.reasons.includes('AMPLIFY_WINNER'));
});
