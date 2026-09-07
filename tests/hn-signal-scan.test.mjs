import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyItem } from '../scripts/hn-signal-scan.mjs';

const now = 1_800_000_000;

test('agent pain maps to an existing multi-agent asset', () => {
  const result = classifyItem({
    id: 1,
    type: 'story',
    title: 'Ask HN: How are you controlling multiple AI agents in production?',
    text: 'Our agent workflow keeps losing handoffs between Claude and Codex.',
    score: 35,
    descendants: 18,
    time: now - 3600
  }, now);
  assert.equal(result.route_id, 'multi-agent-governance');
  assert.equal(result.existing_asset_match.name, 'Agent Control Auditor');
  assert.equal(result.handoff_cell, 'Publishing Revenue Cell');
});

test('workflow automation pain maps to ROI Calculator', () => {
  const result = classifyItem({
    id: 2,
    type: 'story',
    title: 'Ask HN: Is workflow automation actually saving your team money?',
    score: 20,
    descendants: 11,
    time: now - 7200
  }, now);
  assert.equal(result.route_id, 'workflow-automation');
  assert.equal(result.existing_asset_match.name, 'AI Automation ROI Calculator');
});

test('unrelated story is ignored rather than forced into a revenue route', () => {
  const result = classifyItem({
    id: 3,
    type: 'story',
    title: 'Ask HN: Favorite hiking trail this year?',
    score: 50,
    descendants: 30,
    time: now - 1800
  }, now);
  assert.equal(result, null);
});
