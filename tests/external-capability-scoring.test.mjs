import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { scoreCapability, validateRegistry } from '../capability-lab/external-capability-scoring.mjs';

const registry = JSON.parse(fs.readFileSync(new URL('../capability-lab/external-capability-registry.json', import.meta.url), 'utf8'));

test('seed external capability registry is structurally valid', () => {
  const result = validateRegistry(registry);
  assert.equal(result.status, 'PASS', result.errors.join('\n'));
});

test('CONNECTED or stronger state cannot exist without Evidence', () => {
  const result = scoreCapability({
    id: 'bad-connected',
    state: 'CONNECTED',
    overlap: 'NEW_SENSOR',
    classes: ['EYES'],
    evidence: [],
    scores: Object.fromEntries([
      'external_reach','signal_quality','revenue_distance','automation','owner_burden',
      'free_sustainability','safety_policy','reliability','return_path','market_synergy'
    ].map((key) => [key, 8]))
  });
  assert.ok(result.errors.includes('connected_or_higher_requires_evidence'));
});

test('high score does not make FULL_DUPLICATE a promotion candidate', () => {
  const result = scoreCapability({
    id: 'duplicate',
    state: 'AVAILABLE',
    overlap: 'FULL_DUPLICATE',
    classes: ['EYES'],
    evidence: [],
    scores: Object.fromEntries([
      'external_reach','signal_quality','revenue_distance','automation','owner_burden',
      'free_sustainability','safety_policy','reliability','return_path','market_synergy'
    ].map((key) => [key, 10]))
  });
  assert.equal(result.score, 100);
  assert.equal(result.recommendation, 'KILL_OR_IGNORE');
});

test('unsafe capability cannot become PRIORITY_VERIFY on score alone', () => {
  const scores = {
    external_reach: 10,
    signal_quality: 10,
    revenue_distance: 10,
    automation: 10,
    owner_burden: 10,
    free_sustainability: 10,
    safety_policy: 4,
    reliability: 10,
    return_path: 10,
    market_synergy: 10
  };
  const result = scoreCapability({
    id: 'unsafe-high-score',
    state: 'AVAILABLE',
    overlap: 'NEW_SENSOR',
    classes: ['MOUTH_HANDS'],
    evidence: [],
    scores
  });
  assert.equal(result.score, 94);
  assert.notEqual(result.recommendation, 'PRIORITY_VERIFY');
});

test('registry forbids duplicate capability ids', () => {
  const duplicate = { ...registry.capabilities[0] };
  const result = validateRegistry({ capabilities: [duplicate, duplicate] });
  assert.equal(result.status, 'FAIL');
  assert.ok(result.errors.some((error) => error.startsWith('duplicate:id:')));
});
