# Sources

Every technical claim in this package is grounded in public RustChain repository material.

## 1 CPU = 1 vote + antiquity-weighted rewards
- `node/rip_200_round_robin_1cpu1vote.py`
- https://github.com/Scottcjn/Rustchain/blob/main/node/rip_200_round_robin_1cpu1vote.py
- Relevant concept: deterministic round-robin consensus, `1 CPU = 1 Vote`, antiquity multipliers for rewards.

## Protocol summary
- `docs/PROTOCOL.md`
- https://github.com/Scottcjn/Rustchain/blob/main/docs/PROTOCOL.md
- Relevant concept: `1 CPU = 1 vote` for baseline participation; hardware antiquity changes reward weight; attestation proves the machine is real enough to participate.

## Proof-of-Antiquity identity model
- `specs/RIP_POA_SPEC_v1.0.md`
- https://github.com/Scottcjn/Rustchain/blob/main/specs/RIP_POA_SPEC_v1.0.md
- Relevant concept: Proof-of-Antiquity ties identity to physical hardware rather than energy expenditure or capital alone.

## Hardware fingerprinting / virtualization
- `docs/whitepaper/hardware-fingerprinting.md`
- https://github.com/Scottcjn/Rustchain/blob/main/docs/whitepaper/hardware-fingerprinting.md
- Relevant concept: the design rewards physical hardware while discounting or rejecting virtualized environments that can scale cheaply.

## Quick-start command
- `README_JA.md` and project README materials
- https://github.com/Scottcjn/Rustchain
- Command used in the package: `python3 -m pip install clawrtc`

## Accuracy note
This package intentionally avoids unsupported profit, energy-use, benchmark, security-guarantee, and token-price claims.