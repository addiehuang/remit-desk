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
| e2e | on demand and in CI | broken keyboard journeys |
| ci | every push and pull request | anything that only fails on a clean machine |
| human | manual review and acceptance | wrong decisions, bad wording, screen reader output |

## Entries

| # | Date | What the agent did | Gate that caught it | Became a rule? |
|---|---|---|---|---|
| 1 | 2026-11-06 | Wrote two smoke tests to verify the test setup after being asked to write no tests. Announced it beforehand and removed them afterwards. Judged reasonable, but recorded as the baseline for "agent adds work that was not requested". | human | not yet |
| 2 | 2026-11-09 | Added the accessibility rule set by spreading the whole `jsxA11y.flatConfigs.strict` object into the flat config. ESLint refused to load any config at all, because `eslint-config-next` had already registered the `jsx-a11y` plugin and flat config forbids defining a plugin name twice. Taking only `.rules` fixed it. | lint | no, recorded as a comment in `eslint.config.mjs` |
| 3 | 2026-11-11 | Stated that the Figma Plugin API could rename the document file (`figma.root.name = 'Remit Desk'`) without checking the API, and put that call in the same `use_figma` script as the deletion of the stray "Number" variable (VariableID:28:12) from the Semantic collection. The rename threw "Setting the document name is currently not supported", and because Figma runs each script as one transaction, the deletion that had already succeeded was rolled back too. Found with a read-only check; the deletion was re-run as its own script, and the file was renamed by hand. | human | yes, AGENTS.md "Tools and APIs" |

## Counts by gate

| Gate | Caught |
|---|---|
| hook | 0 |
| lint | 1 |
| typecheck | 0 |
| unit | 0 |
| storybook | 0 |
| e2e | 0 |
| ci | 0 |
| human | 2 |

A rising count on the cheap gates is good news: the mistake was caught before
it cost anything. A rising count on `human` means a gate is missing.
