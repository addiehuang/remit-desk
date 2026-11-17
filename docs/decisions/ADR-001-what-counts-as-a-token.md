# ADR-001: A value becomes a token only when it passes three tests

Date: 2026-11-14
Status: proposed

## Context

The token pipeline turns `tokens/figma-export.json` into `src/styles/tokens.css`.
Primitives sit outside `@theme`, so they define no utilities. Semantic roles sit
inside it, so each one becomes a Tailwind utility. Every new component raises
the same question: should this value be a token, or should it stay local?
Without a rule the answer drifts, and the token set grows faster than one
person can maintain it.

Several forces shape the answer:

- **Tailwind 4 namespaces.** A token only pays for itself if it produces a
  utility. Colour, spacing, radius and text each have a theme namespace.
  Outline width does not, so a focus ring width held as a token could only be
  reached through `var()`: one more layer of indirection with nothing in return.
- **Deliberate friction in the build script.** `NAMESPACE` in
  `scripts/tokens-lib.mjs` recognises exactly four groups (`color`, `space`,
  `radius`, `text`) and throws on any other. Adding a semantic group is a code
  change, not a Figma change. That friction is intended.
- **Target size.** WCAG 2.2 sets the floor at 24 by 24 CSS pixels (2.5.8,
  level AA). This project chooses to go beyond it and meet 2.5.5 (level AAA,
  44 by 44) on every control. Because the 44px applies to every control, it
  should be one value with one source.
- **Stopping hard-coded values.** The lint that bans colour literals, and the
  planned lint that bans arbitrary pixel values, only work if there is a theme
  value to use instead. The pixel lint was already deferred once (9 Nov 2026)
  for exactly this reason.
- **Maintenance cost.** Every colour token is a Figma variable plus the
  contrast pairs that must be re-measured when a colour changes. There are at
  least 18 pairs today, and each new colour adds several more.

## Decision

A value becomes a token only when it is a design decision repeated across
several components, it changes layout or colour rather than how one component
draws its own internals, and Tailwind 4 has a theme namespace to hold it;
anything that fails one of these tests is a local value that lives in exactly
one place, with its reason written beside it.

The test is these three questions, not a list of categories. Today it admits
four categories: colour, space, radius and text. Motion is left out on purpose,
because the project has no transitions yet. Z-index is left out because
Tailwind has no namespace for it.

Two applications are recorded here because the Button spec depends on them:

- **Target size** passes all three tests and becomes `space/target = 44`,
  exposed as `--spacing-target` and used through `min-h-target` and
  `min-w-target`.
- **Focus ring widths** fail the third test. The ring (a 3px outer ring in
  `--color-focus` and a 2px inner gap in `--color-on-focus`) is defined once,
  as `@utility focus-ring` in `globals.css`. Its colours still come from
  tokens; only the two widths are local.

## Options considered

Focus ring widths:

| Option | Benefit | Cost | Verdict |
|---|---|---|---|
| One `@utility focus-ring` in `globals.css` holding 3px and 2px | Defined once for the whole site, no script change, no pixel values in components | The one place where Figma and code can drift apart unchecked | chosen |
| Add the widths to the `space` group | Passes the token rule on paper | Spacing means layout, and a focus ring lays nothing out, so the names lose their meaning | rejected because it misuses the namespace |
| Open a new `focus-width` group | Every number stays in the pipeline | Needs a `NAMESPACE` change, and Tailwind has no outline width namespace, so it produces no utility | rejected because it adds indirection with no utility to show for it |
| Change the ring to 4px plus 4px and reuse `--spacing-xs` | Adds nothing new | Lets the tooling dictate the visual design, and an 8px ring is too heavy on a 44px control | rejected because the tool should not choose the design |

Target size:

| Option | Benefit | Cost | Verdict |
|---|---|---|---|
| Add `space/target = 44` | Every control meets 2.5.5 AAA, and later TextInput, Select and DataTable row heights can reuse it | One Figma change and one re-export | chosen |
| Reuse the 40px of `min-h-xl` | Costs nothing | 4px short, so it fails 2.5.5 AAA | rejected because it misses the project's own target |

## Consequences

- Easier: the agent and the author have one test to apply instead of a habit.
  Components contain no pixel values for spacing, radius, type or focus, which
  makes a later arbitrary value lint possible.
- Easier: target size is a single value, so every future control inherits the
  AAA target for free.
- Harder: the focus ring is the only part of the pipeline with no automatic
  reconciliation. `tokens:check` compares the Figma export with `tokens.css`;
  it does not read Figma variable descriptions. If someone changes the ring to
  4px in Figma, no check fails. Only a person looking at Storybook would notice.
- Harder: "should this be a token?" becomes a judgement each time rather than a
  reflex. The tests can also be gamed: anyone who claims a value "repeats" can
  argue it into the token set. The second and third tests are the guard, so a
  reviewer should press on those rather than on repetition alone.
- Follow-up needed: the lint that bans arbitrary pixel values MUST be added
  only after `@utility focus-ring` exists in `globals.css`, and MUST apply only
  to `.ts` and `.tsx` files. In any other order, or with a wider scope, the lint
  blocks its own solution.
- Follow-up needed: `@utility focus-ring` does not exist yet. Button is its
  first user and should add it.

## Rule for AGENTS.md

```
- Colours, spacing, radius and type sizes MUST come from a theme variable: a utility such as `bg-primary`, `p-md`, `min-h-target`, `rounded-md` or `text-body`, or the matching `var(--color-*)` or `var(--spacing-*)` in CSS. An arbitrary value such as `p-[17px]` is not acceptable in a `.ts` or `.tsx` file.
- The focus indicator MUST be applied with the `focus-ring` utility. You MUST NOT write an outline or ring width inside a component.
```
