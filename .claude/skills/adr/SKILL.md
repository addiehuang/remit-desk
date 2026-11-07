---
name: adr
description: Draft an architecture decision record from the project template, propose the AGENTS.md rule it implies, and run a confidentiality check. Use when the author types /adr followed by a short decision slug.
disable-model-invocation: true
---

# /adr

Step 1 of the component cycle, whenever a decision appears that someone will
later ask about. One decision, one record.

## Before you write

Read `docs/decisions/_template.md` and every existing ADR, so numbering and
tone stay consistent. Find the next free number.

## Ask the author

Ask these in one message and wait.

1. What is the decision, in one sentence in the present tense?
2. What forces it? Regulation, research, platform limits, time, team skills.
3. Which options did you consider, and why did you reject each one?
4. What does this make harder? Name at least one cost.
5. Should this constrain the agent on every future task, or is it a one-off?

Question 4 is not optional. A record with no cost listed reads as a decision
that was never really weighed, and that is exactly what a reviewer probes.

## Write the draft

`docs/decisions/ADR-00n-<kebab-slug>.md`, from the template.

- `Status: proposed`. The author moves it to `accepted`.
- Put the reasoning here. AGENTS.md gets the conclusion only.
- Separate what a rule requires from what the team chose. If a regulation sets
  the floor and the design goes beyond it, say which part is which.
- English only, UK spelling, no em dashes.

## Propose the AGENTS.md rule

If the answer to question 5 was yes, quote the single line you would add to
AGENTS.md, in `MUST` / `SHOULD` / `MAY` form, and say which section it belongs
in.

Then stop and ask before editing AGENTS.md. That file is the agent's rule book
and the author owns every line in it. Keeping it near 150 lines is a standing
constraint, so if the new rule overlaps an existing one, propose a replacement
rather than an addition.

## Confidentiality check

This repository is public and this is a personal project. Before you finish,
re-read your draft and report on each of these:

- No employer or client name, product name or internal project name
- No screenshots, figures, metrics or copy taken from client work
- No internal URLs, ticket numbers or system names
- Domain knowledge is written as a general principle in the author's own words,
  not as a description of any organisation's implementation

If anything in the author's answers would breach this, do not write it. Say
which part you left out and why.

## Do not

- Do not edit AGENTS.md without explicit approval
- Do not set `Status: accepted`
- Do not write more than one decision per record
- Do not commit
