# code-ops-lab cutover checklist

Status: READY, waiting for GitHub connection to the new account.

Target account
- GitHub handle: code-ops-lab
- Contact: codeops.contact@gmail.com

Create on target
- Repository: code-ops-lab
- Visibility: public unless a private repo is explicitly preferred
- Default branch: main

Bootstrap policy
- No scheduled jobs at first
- Manual workflow only
- No automatic external comments, claims, issues, or PR submissions
- Security-sensitive work excluded
- Secrets are never copied from Vector; recreate only the minimum required secret on the target

Move set
- revenue-mesh/README.md
- revenue-mesh/config.json
- revenue-mesh/scan.mjs
- .github/workflows/revenue-mesh-radar.yml

Keep in Vector
- social publishing
- Bluesky buyer matching
- PostHog evidence
- checkout / distribution / product routes
- revenue-pump workflows
- capability-lab until separately reviewed

Cutover
1. Connect ChatGPT GitHub to code-ops-lab.
2. Create target repository.
3. Copy the move set.
4. Run the target workflow manually once.
5. Verify output and permissions.
6. Enable schedule only after verification.
7. Disable the Vector copy.
8. Observe for several runs.
9. Remove Vector copy only after stable operation.

Rollback
- Re-enable the Vector workflow.
- Disable the target workflow.
- Do not delete the source copy until target stability is proven.
