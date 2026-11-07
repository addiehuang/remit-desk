---
name: tdd-red
description: Turn a ready specification into failing tests, one per acceptance criterion, and confirm they all fail for the right reason. Use when the author types /tdd-red followed by a component or flow name.
disable-model-invocation: true
---

# /tdd-red

Step 4 of the component cycle. You write the tests. The author reviews them
before a single line of implementation exists.

## Refuse to start when

- The spec does not exist
- The spec's `Status` is not `ready`
- `.claude/lock-tests` exists, which means a green phase is in progress

Say which of these is the case and stop.

## Write the tests

For a component: `src/components/<Name>/<Name>.test.tsx`, using Vitest and
Testing Library. These run in the `unit` project, in jsdom.

For a flow: `e2e/<kebab-name>.spec.ts`, using Playwright, as a keyboard-only
journey.

Rules:

- One `test` block per acceptance criterion. Name it with the criterion number
  first: `test('AC-1: formats the value on blur', ...)`.
- Every acceptance criterion gets a test. If a criterion cannot be tested as
  written, say so in your reply rather than inventing a weaker version of it.
- Find elements by accessible role and name. `getByRole('textbox', { name:
  /amount/i })`, not `getByTestId`. This is deliberate: a query that cannot
  find the element by its accessible name has already found an accessibility
  bug.
- Drive the component the way a user does, with `userEvent`, not by calling
  props directly.
- Assert on what the user perceives: visible text, accessible name, announced
  state. Not on internal state or class names.
- Do not write the implementation. Import the component from the path it will
  live at and let the import fail.
- English only, UK spelling, no em dashes.

## Confirm the red

Run the unit project only:

```
pnpm test:unit --run
```

Every test must fail. Then read the failures and check that they fail for the
right reason. A test that fails because the file does not exist yet is fine. A
test that fails because you wrote the query wrong is a broken test that would
pass for the wrong reason later.

## Self-check against these five points

Report each one explicitly in your reply. Do not claim a point you have not
checked.

1. Count: how many acceptance criteria does the spec have, and how many tests
   did you write? The numbers must match, and the gaps must be named.
2. Reason: does every test fail because the behaviour is missing, rather than
   because the test itself is wrong?
3. Queries: is every element found by role and accessible name?
4. Independence: does any test depend on another test having run first? It must
   not.
5. Tautologies: is there a test that would pass against an empty component? If
   so it asserts nothing. Name it.

## Hand back to the author

End with: the five-point report, the list of criteria you could not test, and
this instruction.

```
Review the tests yourself, then:
  git add <test paths> && git commit -m "test: add failing tests for <Name>"
  touch .claude/lock-tests
```

## Do not

- Do not write, create or edit any implementation or story file
- Do not make any test pass
- Do not commit
- Do not create `.claude/lock-tests` yourself; the author locks the tests after
  reviewing them
