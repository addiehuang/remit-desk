---
name: spec
description: Draft a specification for a component or a flow from the project template, then list its gaps. Use when the author types /spec followed by a component or flow name.
disable-model-invocation: true
---

# /spec

Steps 1 to 3 of the component cycle. You draft, the author decides.

## Before you write anything

Read, in this order:

1. `AGENTS.md`
2. `specs/_template.md`
3. Every file in `docs/decisions/` whose title touches this component
4. Two or three existing specs in `specs/`, if any exist, to match their level
   of detail

## Then ask the author

Ask these questions in one message and wait for the answers. Do not draft
before they arrive, and do not answer them yourself.

1. Which user, in which moment, and in which flow does this appear?
2. What must this component explicitly NOT do?
3. Which existing component is the nearest neighbour, and how does this one
   differ?
4. Which W3C ARIA Authoring Practices pattern applies, if any?
5. Is there a regulatory or domain rule behind this, or is it a design choice?
6. Does anything here need an ADR of its own?

If the author's answer to question 5 names a rule, say in your draft which part
is required and which part is a choice. That distinction is the point of the
document.

## Write the draft

Copy `specs/_template.md` to `specs/components/<kebab-name>.md` for a component
or `specs/flows/<kebab-name>.md` for a flow. Fill it in.

Rules for the draft:

- `Status: draft`. Only the author changes it to `ready`.
- Keep "Must not do" above "API". The order is deliberate.
- Number the acceptance criteria AC-1, AC-2 and so on, with no gaps.
- Write each acceptance criterion so that a test can decide it. "The error is
  clear" cannot be tested. "The error message is linked to the input with
  aria-describedby" can.
- For a flow, replace the "API" section with "Steps and screens". The tests for
  a flow are Playwright keyboard journeys, not unit tests.
- Name the tokens the implementation will read. Never a raw colour value.
- English only, UK spelling, no em dashes.

## Finish with a gap list

End your reply with a numbered list of everything you were unsure about:
ambiguous criteria, states you suspect are missing, decisions that look like
they belong in an ADR. Do not fix them. The author picks which ones go in.

## Stop and ask the author when

- An answer to the six questions above has not arrived
- Filling in the template would require you to invent a domain or regulatory
  rule
- The component seems to need a decision that no existing ADR covers

## Do not

- Do not write any implementation, test or story file
- Do not set `Status: ready`
- Do not create or modify an ADR; suggest one and let the author run `/adr`
- Do not commit
