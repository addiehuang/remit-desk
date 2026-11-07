---
name: a11y-script
description: Generate a manual keyboard and screen reader test script with the result column left blank for the author to fill in. Use when the author types /a11y-script followed by a component or flow name.
disable-model-invocation: true
---

# /a11y-script

Prepares step 10 of the component cycle. Automated scanning catches the static
problems. This script covers what it cannot: what a screen reader actually
announces, and whether the focus order makes sense to a person.

## Write the script

Create `docs/a11y/<kebab-name>.md`. Build it from the spec's "Keyboard",
"States" and "Accessibility" sections.

Structure:

```
# <Name>: manual accessibility check

Spec: specs/components/<kebab-name>.md
Tested by:
Date:
Build: <preview URL or local>

## Keyboard only, no screen reader

| # | Action | Expected | Actual | Pass |
|---|---|---|---|---|
| 1 | Tab into the component | Focus ring visible on ... | | |

## VoiceOver on Safari, macOS

Start: VO + Cmd + F5. Navigate: VO + right arrow. Interact: VO + Shift + down.

| # | Action | Expected announcement | Actual announcement | Pass |
|---|---|---|---|---|
| 1 | Navigate to the field | "<label>, text field" then the hint | | |

## NVDA on Firefox, Windows

| # | Action | Expected announcement | Actual announcement | Pass |
|---|---|---|---|---|
| 1 | | | | |

## Zoom and contrast

| # | Check | Expected | Actual | Pass |
|---|---|---|---|---|
| 1 | Zoom to 400% | No horizontal scrolling, WCAG 1.4.10 | | |
| 2 | Reduced motion enabled | Transitions do not run | | |
| 3 | Windows forced colours | Focus ring, borders and states still visible | | |

## Findings

| # | What happened | Severity | Issue or PR |
|---|---|---|---|

## Verdict

Pass | Pass with findings | Fail
```

Rules:

- Leave "Actual", "Pass", "Findings" and "Verdict" blank. The author fills them
  in by hand. Never pre-fill a result, and never write "pass" anywhere.
- One row per keyboard key in the spec's keyboard table, and one row per state
  in the states table.
- Write the expected announcement as the words you expect to hear, in order:
  accessible name, role, state, description. "Amount, text field, required,
  enter an amount in pounds".
- Include the actual VoiceOver and NVDA key combinations. The author should not
  have to look them up.
- English only, UK spelling, no em dashes.

## Finish

Tell the author roughly how long the script will take and which rows matter
most for this component. Then stop.

## Do not

- Do not fill in any result, verdict or finding
- Do not run or simulate a screen reader; you cannot hear one
- Do not claim a component is accessible because axe found nothing
- Do not commit
