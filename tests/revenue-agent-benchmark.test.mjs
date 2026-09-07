import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const benchmark = JSON.parse(fs.readFileSync('capability-lab/revenue-agent-benchmark.json', 'utf8'));

test('revenue agent benchmark weights sum to 100', () => {
  const total = benchmark.tasks.reduce((sum, task) => sum + task.weight, 0);
  assert.equal(total, 100);
  assert.equal(benchmark.weights_total, 100);
});

test('every benchmark task requires objective evidence', () => {
  for (const task of benchmark.tasks) {
    assert.ok(Array.isArray(task.required_evidence));
    assert.ok(task.required_evidence.length >= 2, `${task.id} needs multiple evidence sources`);
  }
});

test('verified human purchase is live-only and rejects synthetic proof', () => {
  const task = benchmark.tasks.find((entry) => entry.id === 'verified_human_purchase');
  assert.ok(task);
  assert.equal(task.mode, 'live_only');
  assert.match(task.hard_rule, /test-mode payment/i);
  assert.match(task.hard_rule, /owner purchase/i);
  assert.match(task.hard_rule, /crawler session/i);
  assert.match(task.hard_rule, /agent-created payment/i);
});

test('agent self-report cannot score as evidence', () => {
  assert.match(benchmark.scoring_rule, /self-reports score zero/i);
});

test('production promotion requires sandbox evidence and regression protection', () => {
  assert.match(benchmark.production_rule, /sandbox tasks/i);
  assert.match(benchmark.production_rule, /regression/i);
});
