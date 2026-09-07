#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(process.argv[2] || 'capability-lab/evidence');
const validator = path.resolve('capability-lab/scripts/validate-agent-lab-supply.mjs');
const out = path.resolve(process.argv[3] || 'capability-lab/agent-lab-supply-queue.md');

if (!fs.existsSync(root)) {
  fs.mkdirSync(root, { recursive: true });
}

const records = fs.readdirSync(root)
  .filter((name) => name.endsWith('.json') && !name.includes('example'))
  .sort();

const ready = [];
const rejected = [];

for (const name of records) {
  const file = path.join(root, name);
  try {
    execFileSync(process.execPath, [validator, file], { stdio: 'pipe' });
    const record = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (record.supply_state === 'SUPPLY_READY') ready.push(record);
  } catch (error) {
    rejected.push({ file: name, error: error.stderr?.toString().trim() || error.message });
  }
}

const lines = [
  '# Agent Lab Supply Queue',
  '',
  '> Generated from verified Capability Lab evidence. Only `SUPPLY_READY` records appear here.',
  '',
  `Ready: **${ready.length}**`,
  `Invalid records excluded: **${rejected.length}**`,
  ''
];

if (ready.length === 0) {
  lines.push('No verified reusable knowledge is ready for Agent Lab yet.', '');
} else {
  for (const record of ready) {
    lines.push(
      `## ${record.id}`,
      '',
      `- Source: ${record.source_repo}`,
      `- Problem: ${record.problem}`,
      `- Result: ${record.result}`,
      `- Capability gain: ${record.capability_gain}`,
      `- Reusable pattern: ${record.reusable_pattern}`,
      `- Agent Lab format: ${record.agent_lab_value.format}`,
      `- Why publish: ${record.agent_lab_value.reason}`,
      `- Evidence: ${record.evidence.map((e) => `${e.type}:${e.ref}`).join(' | ')}`,
      ''
    );
  }
}

fs.writeFileSync(out, `${lines.join('\n')}\n`);
console.log(JSON.stringify({ status: 'PASS', ready: ready.length, invalid: rejected.length, output: out }, null, 2));

if (rejected.length) {
  console.error(JSON.stringify({ invalid_records: rejected }, null, 2));
  process.exitCode = 1;
}
