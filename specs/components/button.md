# Button

Status: implemented
Owner: addiehuang
Last updated: 2026-11-22
Related ADRs: ADR-001 A value becomes a token only when it passes three tests

## Purpose

Lets a maker or an approver in corporate online banking, mostly on a desktop,
commit an action that changes state or data: moving between steps and
confirming a payment in Flow A (create payment), approving or rejecting a
payment in Flow B (approval queue).

A screen has at most one primary button. That rule belongs to the screen, not
to this component, and is not enforced here.

## Must not do

- MUST NOT navigate. Anything that changes the URL is a link (`<a>`), not a
  Button. "Back to payments" in Flow A is a link.
- MUST NOT decide why it cannot be pressed. The disabled state and its reason
  both come from the parent. Button only presents them and links one to the
  other.
- MUST NOT submit a form implicitly. `type` defaults to `button`.
- MUST NOT set its own width, margin or position within the parent. This
  applies to the wrapper that holds the button and its reason as well.
- MUST NOT render the native `disabled` attribute in any state.
- MUST NOT act as a toggle. No `aria-pressed` in this version.
- MUST NOT render an icon, with or without text. Text only in this version.
- MUST NOT attach its own `keydown` or `keyup` handler. The native `button`
  element already handles Enter and Space.
- MUST NOT try to block implicit form submission. Pressing Enter in a text
  field submits the form through its first submit button without going through
  Button's handler, so "a disabled Button does not submit" holds only when the
  activation reaches the button itself. Blocking the rest is the form's
  responsibility.
- MUST NOT add props, states or behaviour that are not listed below.

## API

| Prop | Type | Default | Required | Notes |
|---|---|---|---|---|
| `children` | `string` | | yes | Visible label and accessible name. Text only. |
| `variant` | `'primary' \| 'secondary' \| 'danger'` | `'primary'` | no | No `ghost`. |
| `type` | `'button' \| 'submit'` | `'button'` | no | No `reset`: it has no use in this product, and clearing a whole payment form in one press is itself a risk. |
| `disabled` | `boolean` | `false` | no | Rendered as `aria-disabled`, never as the native attribute. |
| `disabledReason` | `string` | | when `disabled` is `true` | Type-level rule: `disabled: true` without `disabledReason` does not compile. Rendered by Button as visible text inside Button's own wrapper, and linked with `aria-describedby`. |

Events and callbacks:

| Name | Signature | When it fires |
|---|---|---|
| `onClick` | `(event: React.MouseEvent<HTMLButtonElement>) => void` | On activation by pointer, Enter or Space, only when `disabled` is not true. |

Implementation consequence of `aria-disabled`: because the native `disabled`
attribute is not used, the browser still treats a disabled `type="submit"`
button as a submit button. Not calling `onClick` is not enough. The click
handler MUST call `event.preventDefault()` while disabled, or AC-9 fails.

Why Button renders the reason itself: a required `string` rendered by Button
guarantees that the reason is on screen. Passing an id for the parent to render
would only guarantee that an id exists, not that the text does. The reason is
not visually hidden, because sighted users also need to know why the button
cannot be pressed.

Wrapper structure:

- Button always renders a wrapper, whether or not it is disabled, so the DOM
  does not change shape between states. The button and its reason are one unit
  that the parent's layout should not split. The cost: the parent lays out the
  wrapper, not the button, which is why the wrapper sets no width, margin or
  position. When a screen needs a full-width button, the parent stretches the
  wrapper and the button fills it.
- The wrapper is a `span` with `display: inline-flex`, never a `div`. A `div`
  inside a `p` is invalid HTML and the browser silently closes the `p` early.
  A `span` is valid anywhere phrasing content is allowed, and Flow A will place
  buttons near explanatory paragraphs.
- The wrapper stacks vertically: the button first, the reason below it, with a
  gap of `--spacing-xs` (its Figma description: "Gap between a label and its
  control"). Below rather than beside, because beside would be cut off or
  conflict with AC-18 at 320 CSS px, DOM order and reading order should both be
  button then reason, and a reason that wraps onto two lines should not push the
  button sideways.
- The reason text uses `--text-body`, `--color-on-surface` and the normal font
  weight. It is separated from the button label by weight alone: the label is
  `font-medium`.

## States

| State | Trigger | What the user sees | What a screen reader announces |
|---|---|---|---|
| default | Rendered | Primary: `--color-primary` fill, `--color-on-primary` text. Secondary: transparent fill, `--color-outline-strong` border, `--color-on-surface` text. Danger: `--color-danger` fill, `--color-on-danger` text. Cursor: `pointer`. | "<label>, button" |
| hover | Pointer over the button | Primary: fill `--color-primary-hover`. Secondary: fill `--color-surface-variant`. Danger: fill `--color-danger-hover`. While disabled, none of the three variants changes on hover: hover signals "this can be pressed", so giving it to a disabled button would be false. | Nothing new |
| active | Pointer or key held down | Same as hover. No separate pressed style in this version. | Nothing new |
| focus | Keyboard focus | Two-layer focus ring: a 3px `outline` in `--color-focus` with a 2px `outline-offset`, and a 2px `box-shadow` spread in `--color-on-focus` that fills the gap between the button and the outline. | "<label>, button" |
| disabled | `disabled` with `disabledReason` | Same for all three variants: `--color-surface-variant` fill, `--color-on-surface-variant` text, `--color-outline-strong` border, no opacity change. Cursor: `not-allowed`, a second cue for pointer users because the fill is only 1.11:1 against the page. Reason shown as visible text below the button. Still focusable. | "<label>, dimmed, button, <reason>" (VoiceOver wording to be confirmed by hand) |

Disabled looks the same in every variant on purpose: a button that cannot be
pressed should no longer signal how important its action is. The border is
functional, not decorative: `--color-surface-variant` against the page's
`--color-surface` is only 1.11:1, so without the border the button's shape
would disappear and the reason text would have nothing to attach to. Opacity is
not used because it would lower the text contrast as well.

## Acceptance criteria

Unit tests in jsdom:

- AC-1 Button renders exactly one native `button` element, found by role `button` with an accessible name equal to `children`.
- AC-2 With no `type` prop, the element has `type="button"`, and clicking it inside a `form` does not fire the form's submit event.
- AC-3 With `type="submit"`, clicking it inside a `form` fires the form's submit event once.
- AC-4 Clicking the button calls `onClick` exactly once.
- AC-5 With the button focused, pressing Enter calls `onClick` once, and pressing Space calls `onClick` once.
- AC-6 The button can be reached with Tab and left with Shift + Tab, in DOM order, with no `tabindex` attribute on the element.
- AC-7 With `disabled` and `disabledReason`, the element has `aria-disabled="true"` and has no `disabled` attribute.
- AC-8 With `disabled` and `disabledReason`, the button is still reachable with Tab.
- AC-9 With `disabled` and `disabledReason`, clicking, pressing Enter and pressing Space do not call `onClick`, and with `type="submit"` inside a `form` they do not fire the submit event.
- AC-10 With `disabled` and `disabledReason`, the reason text is present in the document and is the button's accessible description, through `aria-describedby`.
- AC-11 Without `disabled`, the element has neither `aria-disabled` nor `aria-describedby`, and no reason text is rendered.

Type checks, enforced by `pnpm typecheck` (not by `pnpm test`):

- AC-12 `<Button disabled>` without `disabledReason` is a type error, asserted with `@ts-expect-error`.
- AC-13 Passing a number or a JSX element as `children` is a type error, each case asserted with `@ts-expect-error`.

Real browser, in the Storybook test project:

- AC-14 The rendered button's height and width are each at least the computed value of `--spacing-target` (44px at the default font size).
- AC-15 While the button has keyboard focus, both layers of the focus ring are present: the computed `outline` is 3px wide, its colour equals the computed value of `--color-focus` and its `outline-offset` is 2px; the computed `box-shadow` has a 2px spread and its colour equals the computed value of `--color-on-focus`. The 3px and 2px are written as literals on purpose: they have no token (see ADR-001), and the one place they are defined is what this criterion guards.
- AC-16 With `disabled`, for each of the three variants, the computed background colour equals `--color-surface-variant`, the text colour equals `--color-on-surface-variant`, the border colour equals `--color-outline-strong`, and the computed opacity is 1.
- AC-17 With `disabled`, the reason text is visible: its bounding box has a non-zero width and height, lies entirely inside the viewport, and lies inside the bounding box of every ancestor whose computed `overflow` is not `visible`.
- AC-18 At a viewport 320 CSS px wide (equivalent to 400% zoom on a 1280 px window), with a label long enough to need more than one line: the button's height is greater than the computed value of `--spacing-target`, the button's `scrollWidth` is not greater than its `clientWidth` (no label text is cut off), and the document's `scrollWidth` is not greater than its `clientWidth` (no horizontal scroll).
- AC-19 Every story has zero axe violations.
- AC-20 In the default state, the computed background, text and border colours of each variant equal the computed values of their tokens: primary `--color-primary` and `--color-on-primary`; secondary a transparent background, `--color-on-surface` and `--color-outline-strong`; danger `--color-danger` and `--color-on-danger`. This guards the token architecture at component level: a wrong token with enough contrast would pass axe and look right to the eye.
- AC-21 While the pointer hovers the button, the computed background colour of each variant equals its hover token: primary `--color-primary-hover`, secondary `--color-surface-variant`, danger `--color-danger-hover`. With `disabled`, hovering does not change the computed background colour of any variant. The computed `cursor` is `pointer` when enabled and `not-allowed` when disabled.

## Keyboard

Pattern: W3C ARIA Authoring Practices Guide, Button Pattern,
https://www.w3.org/WAI/ARIA/apg/patterns/button/ (plain button only, not the
toggle button variant). All of this comes from the native `button` element; no
key handling is written.

| Key | Result |
|---|---|
| Tab | Moves focus to the button, including when disabled |
| Shift + Tab | Moves focus to the previous focusable element |
| Enter | Activates the button, unless disabled |
| Space | Activates the button, unless disabled |
| Escape | No effect. A containing dialog handles Escape itself. |

## Accessibility

- Accessible name comes from: the text content (`children`)
- Description and error are linked with: `aria-describedby`, pointing at the
  rendered `disabledReason` text, only while disabled
- Invalid state is marked with: not applicable
- Disabled state is marked with: `aria-disabled="true"`, never the native
  `disabled` attribute, so the button stays focusable and its reason can be read
- Live region: not applicable
- Checked by hand, in `docs/a11y/button.md`: the focus ring is actually
  distinguishable on all three variants and on coloured fills. AC-15 proves both
  layers exist; only a person can judge that they can be seen.
- Target WCAG 2.2 criteria: 2.4.7 Focus Visible, 2.4.13 Focus Appearance (AAA),
  2.5.5 Target Size (AAA, 44 by 44), 1.4.3 Contrast (Minimum), 1.4.11 Non-text
  Contrast, 1.4.10 Reflow

## Required or chosen

| Decision | Basis |
|---|---|
| Visible focus ring with enough contrast | Required: WCAG 2.4.7, 2.4.13 |
| 44px minimum target | Required by the project's AAA target: WCAG 2.5.5 |
| Text and border contrast | Required: WCAG 1.4.3, 1.4.11. Measured: disabled text 5.22:1; disabled border 3.33:1 against its own fill and 3.69:1 against the page; white on `--color-danger-hover` 12.44:1. Secondary's border, `--color-outline-strong`, is 3.69:1 against the surface, the thinnest margin above 3:1: recalculate it whenever a primitive colour changes. |
| Long labels wrap rather than truncate | Required: WCAG 1.4.10. Truncation would also make the visible text differ from the accessible name. This is why the height is `min-h-target`, not a fixed height. |
| A disabled button exposes its reason to a screen reader | Required by Flow B's maker-checker rule (a maker cannot approve their own payment). The rule itself lives in Flow B; Button does not know who created a payment. |
| Three variants, one size, no pressed style, no icons | Design choice |
| Secondary uses a border, not a fill | Design choice |
| Disabled looks the same in all variants, without opacity | Design choice, constrained by the contrast requirements above |
| `aria-disabled` instead of native `disabled` | Design choice, made so that the reason can be reached and read |
| Focus ring widths live in one `@utility focus-ring` in `globals.css`, not in tokens | Design choice, recorded in ADR-001. The utility is shared across the site; Button is its first user. |
| `font-medium` (500) from Tailwind's built-in scale | Design choice. Font weight is neither a colour nor a spacing value, so the token rule does not cover it. |
| Wrapper is an always-rendered `span`, reason below the button | `span`: required for valid HTML inside a `p`. Always rendered and stacked below: design choice. |
| Reason text in `--text-body` and `--color-on-surface`, not caption and `--color-on-surface-variant` | Design choice of visual hierarchy, not accessibility: both pass 4.5:1 (15.98:1 and 5.79:1). `--color-on-surface-variant` is described as "Secondary text: hints, captions, metadata", and a maker-checker reason is the main message, not a hint. |
| `cursor: not-allowed` while disabled | Design choice, a second cue alongside the reason text |

## Stories

Eight stories. Hover is checked by AC-21 with a pointer hover in the Storybook
test project. Active cannot be captured in a static story and is checked by
hand. One disabled story per variant is enough to show that the
three look the same.

| Story | Shows |
|---|---|
| Primary | primary, default |
| PrimaryFocus | primary, focused by a play function |
| PrimaryDisabled | primary, disabled with a reason |
| Secondary | secondary, default |
| SecondaryDisabled | secondary, disabled with a reason |
| Danger | danger, default |
| DangerDisabled | danger, disabled with a reason |
| LongLabelReflow | a long label at a 320 CSS px viewport |

## Tokens used

- `--color-primary`
- `--color-primary-hover`
- `--color-on-primary`
- `--color-danger`
- `--color-danger-hover`
- `--color-on-danger`
- `--color-on-surface`
- `--color-surface-variant`
- `--color-on-surface-variant`
- `--color-outline-strong`
- `--color-focus` (through the `focus-ring` utility)
- `--color-on-focus` (through the `focus-ring` utility)
- `--spacing-target` (`min-h-target`, `min-w-target`)
- `--spacing-md` (horizontal padding; vertical size comes from `min-h-target`)
- `--spacing-xs` (gap between the button and its reason)
- `--radius-sm` (its Figma description: "4px. Inputs, buttons, badges.")
- `--text-body`

## Open questions

- [ ] The Dialog close button may need an icon-only button. Decide when
      Dialog is built whether to extend Button or build a separate IconButton.
- [ ] Preventing double submission and a waiting state are deferred to Flow A
      (issue #11), when there is a real submit action. The mock payments API
      (issue #9) already rejects duplicates on the server. That decision covers
      what a sighted user sees, how the state is announced (support for
      `aria-busy` on a button is weak), how reduced motion is handled, and how
      it combines with `disabled`.
- [ ] In Flow B's approval queue every row may have its own "Approve" button.
      With text-only `children`, a screen reader hears the same name on every
      row unless the visible label names the payment. Decide when the queue
      table is built: longer visible labels, or a separate accessible-name
      prop.
