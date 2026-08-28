# AI Work Router — Release Gate

This product must not be merged to production until every gate below is explicitly verified.

- [ ] 1. Functional verification — core inputs, routing, presets, copy, TXT export, responsive behavior
- [ ] 2. Design quality — visual hierarchy, readability, mobile layout, interaction clarity, restrained motion
- [ ] 3. Product value — solves a real workflow problem, avoids duplicating the paid note, produces a usable output
- [ ] 4. First-time buyer clarity — user can understand what to enter, what the result means, and what to do next without prior knowledge
- [ ] 5. Bug and safety audit — no destructive actions, no external transmission from the client tool, stop conditions visible, accessibility basics checked
- [ ] 6. Sales path — product positioning, price, delivery, CTA, checkout, post-purchase instructions, attribution/analytics defined
- [ ] 7. Final QA — build/lint/test status reviewed, copy checked, mobile checked, no unsupported claims
- [ ] 8. Production merge — only after 1–7 are complete

## Research requirements before release

- Market and competitor research
- Public traction/revenue proxies where exact revenue is unavailable
- User pain and complaint research
- Reverse-design from unmet needs
- Adversarial review: advocate vs skeptic
- Safety and claims review

If any gate fails, return to the relevant stage instead of merging.
