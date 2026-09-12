# Storyboard — Why RustChain Rewards Old Hardware Without Giving It More Votes

## Format
- 16:9, 1080p
- Target runtime: 3:30–4:00
- Visual language: clean technical explainer, dark UI, restrained motion

## Shot plan

### 0:00–0:15 — Hook
Split screen: vintage PowerPC machine on left, modern x86 workstation on right. Large text: **OLD HARDWARE CAN EARN MORE — BUT NOT VOTE MORE.**

### 0:15–0:40 — Separate the two ideas
Show two horizontal lanes: `Consensus participation` and `Reward weight`. Animate `1 CPU = 1 vote` into the first lane; animate `Antiquity multiplier` into the second.

### 0:40–1:10 — Attestation first
Diagram: machine → attestation → hardware fingerprint → accepted / discounted-rejected. Include a VM icon peeling away from a physical-machine icon. Caption: **Physical hardware must be attested before antiquity matters.**

### 1:10–1:40 — One CPU, one baseline vote
Show two verified machines, each feeding exactly one token into a consensus box. Do not show unequal vote arrows.

### 1:40–2:10 — Reward weighting
Keep the same two machines, but move to a separate reward panel. Display equal baseline participation, then visually apply an antiquity-weight badge only to payout/reward weight.

### 2:10–2:40 — Why anti-emulation matters
Show a fake text field `claimed_arch = G4` rejected as insufficient. Replace with multi-check physical fingerprint flow. Caption: **A label is not proof.**

### 2:40–3:10 — Compare models
Three-column diagram:
- PoW → computational expenditure
- PoS → capital at risk
- Proof-of-Antiquity → physical hardware identity + verified age used in reward logic

### 3:10–3:30 — Mental model
Animate three blocks in sequence:
`Prove the machine` → `1 CPU = 1 vote` → `Weight rewards by verified antiquity`

### 3:30–end — Start here
Terminal capture typing:
`python3 -m pip install clawrtc`
Then show RustChain GitHub repository URL and the protocol docs folder.

## Capture notes
- Use repository text snippets only for short citations; do not fabricate benchmark numbers.
- Avoid saying VMs are "impossible" to spoof. Use "discounted or rejected" / "designed to detect virtualization and emulation" language.
- Keep voting power and reward weighting visually separated throughout.