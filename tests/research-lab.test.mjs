import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { validateRegistry, validateVisibilityPrompts } from '../scripts/research-gate.mjs';
import { scoreVisibility } from '../scripts/ai-visibility-score.mjs';

const registry = JSON.parse(fs.readFileSync(new URL('../research-lab/capabilities.json', import.meta.url), 'utf8'));
const visibilityConfig = JSON.parse(fs.readFileSync(new URL('../research-lab/evals/ai-visibility.prompts.json', import.meta.url), 'utf8'));

test('research capability registry passes evidence gate', () => {
  assert.deepEqual(validateRegistry(registry), []);
});

test('AI visibility prompts are neutral and target-unaware', () => {
  assert.deepEqual(validateVisibilityPrompts(visibilityConfig), []);
});

test('promoted capabilities cannot pass without evidence and regression refs', () => {
  const broken = structuredClone(registry);
  broken.candidates[0].stage = 'promoted';
  broken.candidates[0].evidence_refs = [];
  broken.candidates[0].regression_refs = [];

  const errors = validateRegistry(broken);
  assert.ok(errors.some((error) => error.includes('evidence_refs')));
  assert.ok(errors.some((error) => error.includes('regression_refs')));
});

test('AI visibility scoring separates mention from owned citation', () => {
  const results = [
    {
      prompt_id: visibilityConfig.prompts[0].id,
      provider: 'provider-a',
      model: 'model-a',
      answer: 'Global Work Radar is one option.',
      citations: []
    },
    {
      prompt_id: visibilityConfig.prompts[1].id,
      provider: 'provider-b',
      model: 'model-b',
      answer: 'Here are several job search approaches.',
      citations: ['https://global-work-radar.pages.dev/']
    }
  ];

  const summary = scoreVisibility(results, visibilityConfig);
  assert.equal(summary.total_results, 2);
  assert.equal(summary.mention_count, 1);
  assert.equal(summary.mention_rate, 50);
  assert.equal(summary.owned_citation_count, 1);
  assert.equal(summary.owned_citation_rate, 50);
  assert.equal(summary.by_provider['provider-a'].mention_rate, 100);
  assert.equal(summary.by_provider['provider-b'].owned_citation_rate, 100);
});
