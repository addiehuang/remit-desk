# <Component or flow name>

Status: draft | ready | implemented
Owner: <your name>
Last updated: <YYYY-MM-DD>
Related ADRs: <ADR-00n, or none>

## Purpose

One or two sentences. What problem does this solve for which user, in which
part of the product? If you cannot name the user and the moment, the component
is not ready to specify.

## Must not do

Boundaries come first, on purpose. The agent reads this file top to bottom, so
the limits should be the first thing it sees, before it learns what to build.

- MUST NOT <behaviour that is out of scope>
- MUST NOT <behaviour that belongs to the parent or to another component>
- MUST NOT add props, states or behaviour that are not listed below

## API

| Prop | Type | Default | Required | Notes |
|---|---|---|---|---|
| | | | | |

Events and callbacks:

| Name | Signature | When it fires |
|---|---|---|
| | | |

## States

| State | Trigger | What the user sees | What a screen reader announces |
|---|---|---|---|
| default | | | |
| focus | | | |
| error | | | |
| disabled | | | |

## Acceptance criteria

Number every criterion. One criterion maps to one test. Write each one so that
a machine can decide whether it passes, not so that a human can agree with it
in principle.

- AC-1 <observable behaviour>
- AC-2 <observable behaviour>
- AC-3 <observable behaviour>

## Keyboard

Summarise from the W3C ARIA Authoring Practices Guide. Name the pattern you are
following and link to it.

| Key | Result |
|---|---|
| Tab | |
| Shift + Tab | |
| Enter | |
| Space | |
| Escape | |

## Accessibility

- Accessible name comes from: <label, aria-label, aria-labelledby>
- Description and error are linked with: aria-describedby
- Invalid state is marked with: aria-invalid
- Live region: <yes, with aria-live=polite, or not applicable>
- Target WCAG criteria: <for example 1.4.10 Reflow, 2.4.7 Focus Visible>

## Tokens used

List the CSS variables this component reads. No raw colour values or arbitrary
pixel values anywhere in the implementation.

- --<token-name>

## Open questions

Anything you have not decided yet. An empty list means the spec is ready.

- [ ] <question>
