import fs from 'node:fs';
import zlib from 'node:zlib';

const required = [
  'index.html','styles.css','app.js','measurement-contract.js','revenue-config.js',
  'ingest-lever.mjs','ingest-workable.mjs','build-public-jobs.mjs','enrich-lifecycle.mjs',
  'observability.mjs','social-growth-engine.mjs','data/verified-jobs.json',
  '.github/workflows/gwr-scheduled-refresh-deploy.yml',
  '.github/workflows/gwr-social-growth.yml',
  '.github/workflows/gwr-world-work-data-deploy.yml'
];
for (const p of required) if (!fs.existsSync(p)) throw new Error('missing required file: '+p);

const forbiddenRoots=['incubator','app','distribution','revenue-mesh','capability-lab'];
for (const p of forbiddenRoots) if (fs.existsSync(p)) throw new Error('cross-project root present: '+p);

const textFiles=[
  'README.md',
  '.github/workflows/gwr-scheduled-refresh-deploy.yml',
  '.github/workflows/gwr-social-growth.yml',
  'agent-lab-handoff.mjs','publishing-handoff.mjs','observability.mjs','social-growth-engine.mjs'
];
const forbidden=[
  'ref: incubator/global-work-radar',
  'HEAD:incubator/global-work-radar',
  '--production-branch=incubator/global-work-radar',
  '--branch=incubator/global-work-radar',
  'stratumpraxis.com',
  'vector-praxis-japan'
];
for (const p of textFiles) {
  const s=fs.readFileSync(p,'utf8');
  for (const token of forbidden) if (s.includes(token)) throw new Error(`legacy dependency ${token} in ${p}`);
}
for (const p of ['data/staging-lever.json','data/workable-current.json','data/workable-market.json','data/verified-jobs.json','data/gwr-social-growth-candidates.json']) {
  JSON.parse(fs.readFileSync(p,'utf8'));
}
JSON.parse(zlib.gunzipSync(fs.readFileSync('data/workable-state.json.gz')).toString('utf8'));
console.log('GWR_INDEPENDENCE_AUDIT=PASS');
