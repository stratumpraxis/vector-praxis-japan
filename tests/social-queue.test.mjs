import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(import.meta.dirname, '..');
const script = path.join(repoRoot, 'scripts', 'social-queue.mjs');

function queueFixture() {
  return {
    version: 1,
    campaign: 'regression-test',
    destination: 'https://example.com/offer',
    policy: {brand: 'Vector Praxis Japan', disabled_platforms: []},
    items: [{
      id: 'due-instagram-1', platform: 'instagram', copy: 'Approved copy',
      hashtags: ['AI'], utm: {utm_source: 'instagram'}, status: 'READY',
      approval: 'USER_APPROVED', scheduled_at: '2026-01-01T00:00:00Z',
      external_post_id: null
    }]
  };
}

async function fixturePaths() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'vector-social-queue-'));
  const queuePath = path.join(dir, 'social-queue.json');
  const handoffDir = path.join(dir, 'handoffs');
  await fs.writeFile(queuePath, `${JSON.stringify(queueFixture(), null, 2)}\n`);
  return {dir, queuePath, handoffDir};
}

async function runPublisher(paths, webhook) {
  try {
    await execFileAsync(process.execPath, [script], {
      cwd: repoRoot,
      env: {
        ...process.env,
        SOCIAL_QUEUE_PATH: paths.queuePath,
        SOCIAL_HANDOFF_DIR: paths.handoffDir,
        SOCIAL_HANDOFF_PATH_PREFIX: 'handoffs',
        ...(webhook ? {SOCIAL_PUBLISH_WEBHOOK_URL: webhook} : {SOCIAL_PUBLISH_WEBHOOK_URL: ''})
      }
    });
    return {code: 0};
  } catch (error) {
    return {code: error.code, stdout: error.stdout, stderr: error.stderr};
  }
}

async function readResult(paths) {
  return {
    queue: JSON.parse(await fs.readFile(paths.queuePath, 'utf8')),
    handoff: JSON.parse(await fs.readFile(path.join(paths.handoffDir, 'due-instagram-1.json'), 'utf8'))
  };
}

async function withServer(handler, action) {
  const server = http.createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const {port} = server.address();
    return await action(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test('missing webhook fails visibly and persists HANDOFF_REQUIRED evidence', async () => {
  const paths = await fixturePaths();
  const result = await runPublisher(paths);
  const state = await readResult(paths);
  assert.equal(result.code, 2);
  assert.equal(state.queue.items[0].status, 'HANDOFF_REQUIRED');
  assert.equal(state.handoff.evidence.status, 'READY_BUT_NOT_CONNECTED');
  assert.equal(state.handoff.blocker, 'publisher_not_connected');
  assert.ok(state.handoff.next_owner);
  assert.ok(state.handoff.next_action);
});

test('HTTP 410 fails visibly and persists cooldown plus blocker evidence', async () => {
  const paths = await fixturePaths();
  await withServer((request, response) => { response.writeHead(410); response.end('gone'); }, async (url) => {
    const result = await runPublisher(paths, url);
    const state = await readResult(paths);
    assert.equal(result.code, 2);
    assert.equal(state.queue.items[0].status, 'HANDOFF_REQUIRED');
    assert.equal(state.queue.publisher_state.http_status, 410);
    assert.equal(state.handoff.evidence.http_status, 410);
    assert.equal(state.handoff.blocker, 'publisher_http_410');
  });
});

test('external_post_id without public_url is never PUBLISHED and persists evidence', async () => {
  const paths = await fixturePaths();
  await withServer((request, response) => {
    response.writeHead(200, {'content-type': 'application/json'});
    response.end(JSON.stringify({external_post_id: 'provider-123', status: 'sent'}));
  }, async (url) => {
    const result = await runPublisher(paths, url);
    const state = await readResult(paths);
    assert.equal(result.code, 2);
    assert.equal(state.queue.items[0].status, 'HANDOFF_REQUIRED');
    assert.notEqual(state.queue.items[0].status, 'PUBLISHED');
    assert.equal(state.handoff.blocker, 'publisher_public_url_missing');
    assert.equal(state.handoff.evidence.external_post_id, 'provider-123');
    assert.equal(state.handoff.evidence.public_url, null);
    assert.match(state.handoff.next_action, /before any retry/);
    assert.match(state.handoff.next_action, /only then mark PUBLISHED/);
  });
});
