import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const builder = path.resolve('capability-lab/scripts/build-agent-lab-supply.mjs');

function makeTemp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'agent-lab-supply-'));
}

test('Publishing handoff JSON is ignored by Agent Lab supply builder', () => {
  const dir = makeTemp();
  const out = path.join(dir, 'queue.md');
  fs.writeFileSync(path.join(dir, 'publishing-handoff-20260907-example.json'), '{}');

  const run = spawnSync(process.execPath, [builder, dir, out], { encoding: 'utf8' });

  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /"invalid": 0/);
  assert.match(fs.readFileSync(out, 'utf8'), /Ready: \*\*0\*\*/);
});

test('Malformed capability record still fails closed', () => {
  const dir = makeTemp();
  const out = path.join(dir, 'queue.md');
  fs.writeFileSync(path.join(dir, 'capability-20260907-invalid.json'), '{}');

  const run = spawnSync(process.execPath, [builder, dir, out], { encoding: 'utf8' });

  assert.equal(run.status, 1);
  assert.match(run.stderr, /invalid_records/);
  assert.match(run.stderr, /capability-20260907-invalid\.json/);
});
