# Capability Lab Evidence Records

This directory stores machine-readable evidence records for tested capabilities.

Rules:
- untested discoveries do not belong here as `SUPPLY_READY`
- objective evidence is mandatory
- customer/private information must be redacted before Agent Lab eligibility
- `SUPPLY_READY` requires `VERIFIED`, evidence, reusable pattern, and redaction PASS
- Agent Lab editorial content is downstream and is not stored here

Validate a record:

```bash
node capability-lab/scripts/validate-agent-lab-supply.mjs capability-lab/evidence/<record>.json
```

Build the downstream queue:

```bash
node capability-lab/scripts/build-agent-lab-supply.mjs
```
