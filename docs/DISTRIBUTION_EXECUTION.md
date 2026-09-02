# Vector Praxis — Distribution Execution Rules

## Primary objective

Move an approved Vector content asset through distribution to a verified public result. Do not stop at planning, generation, or a green workflow run.

## 1. Blocked tool is not a blocked campaign

When one publisher, connector, API, or automation route is blocked:

1. Complete every still-executable step.
2. Persist the exact blocker and evidence.
3. Create a handoff payload containing the already-approved post content and destination.
4. Mark only that item `HANDOFF_REQUIRED` so it does not stall the rest of the queue.
5. Route the blocked step to the next capable execution environment (for example Codex, Claude, Replit, or another connected publisher).
6. Resume from the blocked step. Do not redesign or restart the campaign.

A missing connector is a routing problem, not permission to abandon the task.

## 2. Mandatory handoff contract

Every handoff must preserve:

- `INPUT` — source asset, platform, approved copy, destination URL, schedule.
- `ACTION` — what was attempted.
- `RESULT` — what actually happened.
- `EVIDENCE` — HTTP status, workflow run, external post ID, public URL, or other proof.
- `BLOCKER` — the smallest concrete reason execution stopped.
- `NEXT OWNER` — the next capable agent/tool/environment.
- `NEXT ACTION` — the first executable action for that owner.

The user must not be used as the manual message bus between agents.

## 3. History-first execution

Before asking for priorities or creating a new structure, inspect:

1. recent Vector progress,
2. existing assets,
3. connected/previously working distribution routes,
4. the latest successful execution path,
5. the current blocker.

Reuse a proven route before adding a new repository, workflow, service, or architecture.

## 4. Definition of done

For a social distribution item, `DONE` requires evidence of the real-world result where the platform permits it:

`approved asset -> publish attempt -> external post ID/public URL -> verification -> state persisted -> measurement-ready`

If public publishing is blocked, the acceptable intermediate state is `HANDOFF_REQUIRED` with a complete executable handoff payload. It is not `DONE`.

## 5. Safety and duplicate controls

- Respect disabled platforms and account suspensions.
- Do not retry a known unsafe route blindly.
- Do not mark an item published without publisher evidence.
- Do not reuse identical copy when policy forbids it.
- Do not merge or deploy a workaround that bypasses rights, safety, or platform restrictions.
