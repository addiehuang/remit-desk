## What changed

<One paragraph. What does this pull request add or change, and why now?>

Spec: `specs/<path>.md`
ADRs: <ADR-00n, or none>

## Preview

Deployment: <preview URL, or "not deployed">
Storybook: <preview URL, or "not deployed">

## Video

<Short screen recording of the keyboard journey, or "not applicable">

## Design system questions

Every pull request answers these four. They are the questions that follow a
live component exercise, so answering them here is the practice.

**Keyboard.** How is this operated without a mouse? Which keys, in which order,
and where does focus go?

**Accessibility.** What is the accessible name, how are description and error
linked, and what does a screen reader announce? Which WCAG criteria apply?

**Documentation.** Where is this documented, and what does the documentation
tell a consumer about when to use it and when not to?

**Versioning.** Is this a breaking change for anyone already using the
component? What would a consumer have to change?

## Acceptance

- [ ] Every acceptance criterion in the spec has a test
- [ ] Tests were reviewed by a human before the implementation was written
- [ ] One test was deliberately broken and went red, then was restored
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test --run` pass locally
- [ ] `pnpm lang:check` passes
- [ ] Keyboard-only walkthrough completed by a human
- [ ] Screen reader walkthrough completed and recorded in `docs/a11y/`
- [ ] Zoomed to 400% with no horizontal scrolling
- [ ] Checked with reduced motion enabled
- [ ] `docs/ai-log.md` updated if an agent made a mistake
