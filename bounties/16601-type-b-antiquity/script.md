# Script — Why RustChain Rewards Old Hardware Without Giving It More Votes

**Target runtime:** ~3:30–4:00

What if an old PowerPC machine could earn more for being old — without getting more control over consensus?

That distinction is the core idea behind RustChain’s Proof-of-Antiquity model.

RustChain’s protocol describes baseline participation as **one CPU equals one vote**. The vote itself is not multiplied just because a machine is older. Instead, hardware antiquity changes the **reward weight** after the machine has been attested as real physical hardware.

That matters because two ideas that are easy to blur together — voting power and payout weight — are intentionally separated.

First, the network needs evidence that a miner is actually running on physical hardware. RustChain’s hardware-fingerprinting design uses multiple checks to make virtualization or emulation harder to pass off as a vintage machine. The public protocol documentation describes attestation as the mechanism that proves the machine is real enough to participate, while the hardware-fingerprinting documentation explains that virtualized environments are discounted or rejected because they can be scaled cheaply without corresponding physical cost.

Once a machine passes attestation, baseline consensus participation follows the one-CPU-one-vote rule. Older verified hardware can then receive an antiquity multiplier on rewards.

So imagine two honest machines that both qualify to participate: a newer x86 system and an older PowerPC system. They do not become two votes versus five votes just because one machine is older. Each attesting CPU contributes baseline participation, while the reward calculation can favor the older verified device.

That is the economic bet behind Proof-of-Antiquity: treat hardware age as a scarce physical property worth rewarding, while avoiding a direct conversion of age into extra voting control.

There is also an anti-emulation reason for doing this carefully. If a network simply trusted a self-reported label like “PowerPC G4,” anyone could spin up virtual machines and claim vintage multipliers. RustChain therefore ties the antiquity concept to physical attestation and hardware fingerprints rather than trusting a text field alone.

This gives the system a very different shape from traditional proof-of-work or proof-of-stake. Proof-of-work ties influence to computational expenditure. Proof-of-stake ties it to capital at risk. RustChain’s public Proof-of-Antiquity specification instead ties identity to physical hardware, then uses verified hardware age as part of the reward logic.

The important caveat is that this is not magic hardware detection. It is an attestation system with specific checks, assumptions, and implementation details. The useful mental model is simpler: **prove the machine, give each CPU baseline participation, then weight rewards by verified antiquity.**

If you want to inspect it yourself, the code and protocol docs are public in the RustChain repository. The project’s quick-start path begins with:

`python3 -m pip install clawrtc`

Then you can inspect the miner and attestation flow directly rather than relying on a marketing summary.

So the one-line takeaway is this: **RustChain does not make old hardware more powerful by giving it more votes. It makes verified old hardware more valuable by changing the reward weight after attestation.**