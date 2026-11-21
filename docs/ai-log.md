# AI log

One line per mistake an AI agent made in this repository, and which gate caught
it. The point is not to keep score. The point is that a mistake caught twice
should become a rule, and a mistake no gate caught should become a new gate.

Gates, from cheapest to most expensive:

| Gate | Runs | Catches |
|---|---|---|
| hook | the moment a file is written | lint and type errors, test-file edits |
| lint | on demand and in CI | forbidden patterns in source |
| typecheck | on demand and in CI | type errors |
| unit | on demand and in CI | behaviour against acceptance criteria |
| storybook | on demand and in CI | render failures, axe violations |
| e2e | on demand and in CI, with Playwright in a real browser | broken keyboard journeys, browser-only behaviour in app and Storybook checks |
| ci | every push and pull request | anything that only fails on a clean machine |
| agent | while an agent writes or reviews work, its own or another agent's | wrong claims and broken instructions, before any person sees them |
| human | manual review and acceptance | wrong decisions, bad wording, screen reader output |

## Entries

Rows are numbered in the order they are recorded. The date is when the mistake was made, so it can be earlier than the row above.

| # | Date | What the agent did | Gate that caught it | Became a rule? |
|---|---|---|---|---|
| 1 | 2026-11-06 | Wrote two smoke tests to verify the test setup after being asked to write no tests. Announced it beforehand and removed them afterwards. Judged reasonable, but recorded as the baseline for "agent adds work that was not requested". | human | not yet |
| 2 | 2026-11-09 | Added the accessibility rule set by spreading the whole `jsxA11y.flatConfigs.strict` object into the flat config. ESLint refused to load any config at all, because `eslint-config-next` had already registered the `jsx-a11y` plugin and flat config forbids defining a plugin name twice. Taking only `.rules` fixed it. | lint | yes, AGENTS.md "Tools and APIs" (added with entry 3); also a comment in `eslint.config.mjs` |
| 3 | 2026-11-11 | Stated that the Figma Plugin API could rename the document file (`figma.root.name = 'Remit Desk'`) without checking the API, and put that call in the same `use_figma` script as the deletion of the stray "Number" variable (VariableID:28:12) from the Semantic collection. The rename threw "Setting the document name is currently not supported", and because Figma runs each script as one transaction, the deletion that had already succeeded was rolled back too. Found with a read-only check; the deletion was re-run as its own script, and the file was renamed by hand. | human | yes, AGENTS.md "Tools and APIs" |
| 4 | 2026-11-21 | Wrote the first manual script for Button telling the tester to look for an `onClick` entry in the Storybook Actions panel (Keyboard 5 and 9, VoiceOver 6), without checking the stories. The story meta has no `args: { onClick: fn() }`, so the panel never logs anything, and a tester could have marked a working button as Fail. Caught before the manual pass by another agent, which clicked the button in a headless browser and took a screenshot of the empty panel; the keyboard rows are now automated, and VoiceOver 6 uses a console listener. | agent | yes, covered by AGENTS.md "Tools and APIs" (added with entry 3) |
| 5 | 2026-11-07 | Wrote the `/a11y-script` skill template with the VoiceOver start shortcut as "VO + Cmd + F5"; the real shortcut is Cmd + F5. Found on 2026-11-21 by the agent running the skill, which used the correct shortcut in `docs/a11y/button.md`. The skill file is not fixed yet. | agent | yes, covered by AGENTS.md "Tools and APIs" (added with entry 3) |
| 6 | 2026-11-22 | Wrote the States 3 test in `e2e/storybook/button.a11y.spec.ts` to read the computed background once, straight after `mouse.down`. The test fails at random (1 in 15 in a repeat run, on a different variant each time), probably because WebKit sometimes applies the hover style a moment later. Confirmed as a test problem by the repeat run and by checking Safari by hand. Fix: a retrying assertion (`toHaveCSS`), tracked in #31. | e2e | not yet |
| 7 | 2026-11-22 | Shortened a console command in the manual-pass guidance to `window.addEventListener(...)`. It looked runnable, was pasted as written, and Safari threw SyntaxError. | human | not yet |

## Counts by gate

| Gate | Caught |
|---|---|
| hook | 0 |
| lint | 1 |
| typecheck | 0 |
| unit | 0 |
| storybook | 0 |
| e2e | 1 |
| ci | 0 |
| agent | 2 |
| human | 3 |

A rising count on the cheap gates is good news: the mistake was caught before
it cost anything. A rising count on `human` means a gate is missing.
