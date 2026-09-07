#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node capability-lab/scripts/validate-agent-lab-supply.mjs <record.json>');
  process.exit(2);
}

const record = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
const errors = [];

const allowedExecution = new Set(['IMPLEMENTED', 'EXECUTED', 'VERIFIED']);
const allowedResults = new Set(['SUCCESS', 'FAILURE', 'MIXED']);
const allowedFormats = new Set([
  'public_field_note',
  'premium_field_note',
  'template',
  'failure_note',
  'success_pattern'
]);
const allowedSupplyStates = new Set(['HOLD', 'SUPPLY_READY', 'REJECT']);
const evidenceTypes = new Set([
  'test',
  'trace',
  'artifact',
  'benchmark',
  'external_side_effect',
  'regression'
]);

for (const field of ['id', 'source_repo', 'source_url', 'problem', 'project_target', 'execution_state', 'result', 'capability_gain', 'reusable_pattern', 'redaction_check', 'supply_state']) {
  if (record[field] === undefined || record[field] === null || record[field] === '') errors.push(`missing:${field}`);
}

if (!allowedExecution.has(record.execution_state)) errors.push('invalid:execution_state');
if (!allowedResults.has(record.result)) errors.push('invalid:result');
if (!allowedSupplyStates.has(record.supply_state)) errors.push('invalid:supply_state');

if (!Array.isArray(record.evidence) || record.evidence.length === 0) {
  errors.push('missing:evidence');
} else {
  for (const [index, item] of record.evidence.entries()) {
    if (!item || !evidenceTypes.has(item.type) || !item.ref) errors.push(`invalid:evidence[${index}]`);
  }
}

if (!record.risks || !record.risks.license || !record.risks.security || !record.risks.operational) {
  errors.push('missing:risks');
}

if (!record.agent_lab_value || typeof record.agent_lab_value.eligible !== 'boolean' || !record.agent_lab_value.reason) {
  errors.push('missing:agent_lab_value');
} else if (record.agent_lab_value.eligible && !allowedFormats.has(record.agent_lab_value.format)) {
  errors.push('invalid:agent_lab_value.format');
}

const isSupplyReady = record.supply_state === 'SUPPLY_READY';
if (isSupplyReady) {
  if (record.execution_state !== 'VERIFIED') errors.push('gate:SUPPLY_READY_requires_VERIFIED');
  if (record.redaction_check !== 'PASS') errors.push('gate:SUPPLY_READY_requires_redaction_PASS');
  if (record.agent_lab_value?.eligible !== true) errors.push('gate:SUPPLY_READY_requires_eligible_true');
  if (!Array.isArray(record.evidence) || record.evidence.length === 0) errors.push('gate:SUPPLY_READY_requires_evidence');
}

if (errors.length) {
  console.error(JSON.stringify({ status: 'FAIL', file, errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'PASS',
  file,
  supply_state: record.supply_state,
  result: record.result,
  format: record.agent_lab_value?.format ?? null
}, null, 2));
