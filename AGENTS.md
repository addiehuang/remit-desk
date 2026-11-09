<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Language

- Everything committed MUST be in English (UK spelling): code, comments, docs, specs, ADRs, test names, commit messages, branch names, PR titles and bodies. `pnpm lang:check` enforces this for files.
- You MAY reply to the author in their own language in chat.
- Do NOT use em dashes (U+2014) in English prose. Use a comma, a colon, parentheses or a full stop instead. En dashes (U+2013) are allowed only in numeric and date ranges, such as 9–11 Nov.

## Styling

- Colours MUST come from a theme variable: a Tailwind utility such as `bg-background`, or `var(--color-*)` in CSS.
- You MUST NOT write a hex code, `rgb()`, `hsl()` or `oklch()` value anywhere under `src`. `pnpm lint` enforces this.

## Components

- Pages under `src/app` MUST NOT use a native `button`, `input`, `select` or `textarea`. Use the design system component, or build it under `src/components` first.
- Interactive behaviour MUST sit on a real interactive element. A `div` or `span` carrying `onClick` is not acceptable.
- Every component MUST have a spec in `specs/components/` before implementation starts.

## Tests

- While `.claude/lock-tests` exists the tests are the fixed answer key. You MUST NOT edit a test file, and you MUST NOT remove the lock. Change the implementation instead.
- If an acceptance criterion looks wrong, stop and tell the author rather than editing the test.
