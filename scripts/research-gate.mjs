import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, 'research-lab', 'capabilities.json');
const PROMPTS_PATH = path.join(ROOT, 'research-lab', 'evals', 'ai-visibility.prompts.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function validateRegistry(registry) {
  const errors = [];
  const allowedStages = new Set(registry.stages || []);
  const ids = new Set();

  if (registry.version !== 1) errors.push('capabilities.json version must be 1');
  if (!Array.isArray(registry.candidates) || registry.candidates.length === 0) {
    errors.push('capabilities.json must contain at least one candidate');
    return errors;
  }

  for (const candidate of registry.candidates) {
    const prefix = candidate.id || candidate.name || '<unknown>';
    const required = [
      'id',
      'name',
      'source',
      'preliminary_score',
      'stage',
      'capability',
      'integration_mode',
      'license_status',
      'security_status',
      'targets',
      'evidence_refs',
      'regression_refs',
      'kill_condition'
    ];

    for (const field of required) {
      if (!(field in candidate)) errors.push(`${prefix}: missing ${field}`);
    }

    if (ids.has(candidate.id)) errors.push(`${prefix}: duplicate id`);
    ids.add(candidate.id);

    if (!allowedStages.has(candidate.stage)) errors.push(`${prefix}: invalid stage ${candidate.stage}`);
    if (!Number.isFinite(candidate.preliminary_score) || candidate.preliminary_score < 0 || candidate.preliminary_score > 100) {
      errors.push(`${prefix}: preliminary_score must be between 0 and 100`);
    }
    if (!String(candidate.source || '').startsWith('https://')) errors.push(`${prefix}: source must be an https URL`);
    if (!Array.isArray(candidate.targets) || candidate.targets.length === 0) errors.push(`${prefix}: targets must be non-empty`);
    if (!Array.isArray(candidate.evidence_refs)) errors.push(`${prefix}: evidence_refs must be an array`);
    if (!Array.isArray(candidate.regression_refs)) errors.push(`${prefix}: regression_refs must be an array`);

    if (candidate.stage === 'promoted') {
      if (candidate.license_status !== 'verified') errors.push(`${prefix}: promoted capability requires verified license status`);
      if (['verify', 'unknown', 'blocked'].includes(candidate.security_status)) {
        errors.push(`${prefix}: promoted capability requires resolved security status`);
      }
      if (candidate.evidence_refs.length === 0) errors.push(`${prefix}: promoted capability requires evidence_refs`);
      if (candidate.regression_refs.length === 0) errors.push(`${prefix}: promoted capability requires regression_refs`);
    }
  }

  return errors;
}

export function validateVisibilityPrompts(config) {
  const errors = [];
  const ids = new Set();
  const aliases = (config.target?.aliases || []).map((value) => value.toLowerCase());

  if (!Array.isArray(config.prompts) || config.prompts.length === 0) {
    return ['ai visibility config must contain prompts'];
  }

  for (const item of config.prompts) {
    if (!item.id || !item.prompt || !item.locale || !item.intent) errors.push(`${item.id || '<unknown>'}: incomplete prompt record`);
    if (ids.has(item.id)) errors.push(`${item.id}: duplicate prompt id`);
    ids.add(item.id);

    const text = String(item.prompt || '').toLowerCase();
    for (const alias of aliases) {
      if (alias && text.includes(alias)) {
        errors.push(`${item.id}: prompt leaks target alias '${alias}'`);
      }
    }
  }

  return errors;
}

export function runGate({ registryPath = REGISTRY_PATH, promptsPath = PROMPTS_PATH } = {}) {
  const registryErrors = validateRegistry(readJson(registryPath));
  const promptErrors = validateVisibilityPrompts(readJson(promptsPath));
  return [...registryErrors, ...promptErrors];
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) {
  const errors = runGate();
  if (errors.length) {
    console.error('Research gate: FAIL');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('Research gate: PASS');
}
