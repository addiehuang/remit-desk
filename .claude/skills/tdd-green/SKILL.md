---
name: tdd-green
description: Implement a component until the locked tests pass, write one story per state, and prove the tests still have teeth. Use when the author types /tdd-green followed by a component or flow name.
disable-model-invocation: true
---

# /tdd-green

Steps 6 to 8 of the component cycle. The tests are the exam paper and they are
locked. You cannot change them.

## Refuse to start when

- `.claude/lock-tests` does not exist. The tests have not been reviewed and
  locked, so there is nothing trustworthy to implement against.
- The tests are not currently failing.

## Implement

Read the spec and the tests. Write the smallest implementation that satisfies
the tests and does not exceed the spec.

Rules:

- Build only what the acceptance criteria and the "API" section describe.
  Anything else is scope you invented.
- Use native HTML elements wherever they already provide the behaviour. Reach
  for ARIA only when no native element does the job. A `button` beats a `div`
  with a role, every time.
- For a component with hard keyboard and focus behaviour, use React Aria as
  decided in the ADRs, rather than writing focus traps by hand.
- Read tokens through CSS variables. Never a raw colour value, never an
  arbitrary pixel value.
- TypeScript strict. No `any`, no non-null assertions to silence the compiler.
- English only, UK spelling, no em dashes.

Run `pnpm test:unit --run` as you go. The hook will report lint and type errors
as you write; fix them as they appear.

## Then write the stories

`src/components/<Name>/<Name>.stories.tsx`, one story per row of the spec's
"States" table. These run in the `storybook` project, in a real browser, and
every story is scanned by axe.

- Name each story after the state: `Default`, `Focus`, `Error`, `Disabled`.
- A story shows one state. Do not combine several into one story; the axe scan
  and the visual check both work per story.
- Add the usage guidance to the component's docs block: when to use it, when
  not to, and the accessibility notes from the spec.

Run the full suite:

```
pnpm test --run
```

Both projects must be green, with zero axe violations.

## Prove the tests still have teeth

Confirm the test files are unchanged:

```
git diff --stat -- '*.test.tsx' 'e2e/'
```

This must be empty. If it is not, you edited the exam paper. Say so plainly and
restore the files.

Then pick one line of your implementation whose removal should break exactly
one test, and tell the author which line it is and which test should go red.
Do not break it yourself. The author does it by hand, watches the test fail,
and puts the line back. That two-minute check is the only evidence the test
suite is not decoration.

## Stop and ask the author when

- The same test has failed three times and your fixes are not converging. Do
  not keep patching. Say what you think the spec or the test has wrong.
- Passing a test would need a prop, a state or a behaviour the spec does not
  list. Describe what is missing and let the author update the spec.
- A test looks wrong to you. Say which one and why, and stop. You may not edit
  it.

## Do not

- Do not edit, delete, skip or weaken any test, including with `.skip`,
  `.todo`, `only`, a changed assertion or a relaxed matcher
- Do not add features, props or states that the spec does not list
- Do not remove `.claude/lock-tests`
- Do not commit
