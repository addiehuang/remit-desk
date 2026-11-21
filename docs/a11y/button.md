# Button: manual accessibility check

Spec: specs/components/button.md
Tested by: Addie Huang
Date: 2026-11-22
Build: local Storybook, `pnpm storybook`, http://localhost:6006
Environment: macOS 26.5.1, Safari

## Before you start: run the automated checks

Most of the keyboard, state and zoom checks are automated. Run them first, so
the manual pass covers only what needs a person:

```bash
pnpm test:a11y
```

Write the result here:

- Command run: `pnpm test:a11y`
- Result: 105 tests across chromium, firefox and webkit, run several times.
  Most runs: 91 passed, 14 skipped, 0 failed. Some runs: 90 passed, 1 failed,
  because the webkit States 3 test is flaky: see Findings 4. The 14 skipped
  are the forced colours tests, which run in Chromium only. The known forced
  colours finding is marked `test.fail()` and counts as passed: see Findings 1.

| Automated | Where |
|---|---|
| Tab, Shift + Tab, Enter, Space, Escape, on enabled and disabled buttons | `e2e/storybook/button.a11y.spec.ts` (real browsers), AC-4 to AC-9 (unit tests) |
| Focus ring drawn on all six stories, 3px outline, 2px inner ring, 3:1 contrast | `e2e/storybook/button.a11y.spec.ts`, AC-15 |
| Default, hover, active and disabled colours, cursor | AC-16, AC-20, AC-21, `e2e/storybook/button.a11y.spec.ts` (active) |
| Name, role, disabled state and reason in the accessibility tree | `e2e/storybook/button.a11y.spec.ts`, AC-1, AC-7, AC-10 |
| 400% zoom (320 CSS px) with a long label and with the disabled reason | AC-18, `e2e/storybook/button.a11y.spec.ts` |
| Reduced motion: no transition or animation | `e2e/storybook/button.a11y.spec.ts` |
| Forced colours, emulated in Chromium: border and focus ring survive | `e2e/storybook/button.a11y.spec.ts` |
| Zero axe violations | AC-19, every story |

The automated checks prove that each part is there. They cannot tell you
whether it is easy to see, or what a screen reader actually says. That is what
the rows below are for.

## Set up

Open each story on its own, without the Storybook sidebar, so the sidebar does
not sit in the tab order:

- Primary: http://localhost:6006/iframe.html?id=components-button--primary&viewMode=story
- Secondary: http://localhost:6006/iframe.html?id=components-button--secondary&viewMode=story
- Danger: http://localhost:6006/iframe.html?id=components-button--danger&viewMode=story
- PrimaryDisabled: http://localhost:6006/iframe.html?id=components-button--primary-disabled&viewMode=story
- SecondaryDisabled: http://localhost:6006/iframe.html?id=components-button--secondary-disabled&viewMode=story
- DangerDisabled: http://localhost:6006/iframe.html?id=components-button--danger-disabled&viewMode=story

Label in every story: "Approve payment".
Reason in the disabled stories: "You created this payment, so another approver
must approve it."

In Safari, Tab only moves to buttons if "Press Tab to highlight each item on a
webpage" is on: Safari > Settings > Advanced.

The stories do not log `onClick` in the Storybook Actions panel. To see whether
a screen reader activated the button, open the browser console on the story
page and paste this line once per page load:

```js
window.addEventListener("click", (e) => console.log(e.defaultPrevented ? "blocked" : "activated"));
```

"activated" means the press reached `onClick`. "blocked" means the disabled
Button cancelled it.

- Safari: turn on Safari > Settings > Advanced > "Show features for web
  developers", then Develop > Show JavaScript Console (Option + Cmd + C).
- Firefox: Ctrl + Shift + K.

## Focus ring, by sight

| # | Action | Expected | Actual | Pass |
|---|---|---|---|---|
| 1 | Primary story: click the empty page, then press Tab | The two-layer ring (dark outer ring, white inner ring) is easy to see at a glance, from normal viewing distance | Both rings clearly visible at a glance | Pass |
| 2 | Secondary story: click the empty page, then press Tab | Easy to see against the transparent fill and the grey border | Clearly visible against the transparent fill and the border | Pass |
| 3 | Danger story: click the empty page, then press Tab | Easy to see against the red fill. The dark outer ring does not blend into the red. | Clearly visible. The outer ring stands apart from the red fill. | Pass |
| 4 | Each disabled story: click the empty page, then press Tab | Easy to see against the light grey fill | Clearly visible on all three disabled stories | Pass |

## States, by sight

| # | State | Action | Expected | Actual | Pass |
|---|---|---|---|---|---|
| 1 | default | Look at Primary, Secondary and Danger next to the Figma file | They match the design. The three variants are clearly different in importance. | Matches the Figma file. The three variants read as clearly different in importance. | Pass |
| 2 | hover | Move the pointer over each of the three | The change is noticeable without looking for it | The change is noticeable on all three | Pass |
| 3 | disabled | Look at the three disabled stories | It is obvious they cannot be pressed, without reading the reason. The reason clearly belongs to the button above it. | Clearly reads as unavailable. The reason sits with its button. | Pass |

## VoiceOver on Safari, macOS

Start: Cmd + F5 (or press Touch ID three times while holding Cmd). VO means
Control + Option held together. Next item: VO + right arrow. Activate:
VO + Space. Read the current item again: VO + F3. Stop: Cmd + F5.

Turn on the caption panel so you can read what VoiceOver says: VoiceOver
Utility (VO + F8) > Visuals > Caption Panel.

Click inside the story page first so VoiceOver is reading the page, not the
Safari toolbar.

| # | Action | Expected announcement | Actual announcement | Pass |
|---|---|---|---|---|
| 1 | Primary story: VO + right arrow until the button | "Approve payment, button" | "Approve payment, button" | Pass |
| 2 | Primary story: press Tab to the button | "Approve payment, button" | "Approve payment, button" | Pass |
| 3 | Primary story: on the button, press VO + Space | The console logs "activated" once. VoiceOver says nothing new, or repeats "Approve payment, button". | The console logged "activated" once, after a reload with the listener pasted once. VoiceOver said nothing new. | Pass |
| 4 | Secondary and Danger stories: press Tab to the button | "Approve payment, button" on both. The variant is not announced. | "Approve payment, button" on both. The variant is not announced. | Pass |
| 5 | PrimaryDisabled story: press Tab to the button | "Approve payment, dimmed, button", then after a short pause "You created this payment, so another approver must approve it." | "Approve payment, dimmed, button", then after a short pause "You created this payment, so another approver must approve it." | Pass |
| 6 | PrimaryDisabled story: on the button, press VO + Space | The console logs "blocked", never "activated" | The console logged "blocked" once. No "activated". | Pass |
| 7 | PrimaryDisabled story: VO + right arrow past the button | VoiceOver reaches the reason text as its own line. Note whether hearing it twice is confusing. | The reason is read as its own line. Hearing it twice is a little repetitive, but not confusing: see Findings 2. | Pass |
| 8 | SecondaryDisabled and DangerDisabled: repeat row 5 | Same announcement on both | Same announcement on both | Pass |

## NVDA on Firefox, Windows

Skip this section if you have no Windows machine, and say so under Findings.

Start: Ctrl + Alt + N. NVDA key: Insert (or Caps Lock in laptop layout). Next
button in browse mode: B. Read the focused item: NVDA + Tab. Activate: Enter or
Space. Stop: NVDA + Q.

Turn on the speech viewer so you can read what NVDA says: NVDA menu
(NVDA + N) > Tools > Speech viewer.

| # | Action | Expected announcement | Actual announcement | Pass |
|---|---|---|---|---|
| 1 | Primary story: press Tab to the button | "Approve payment, button" | Not tested | |
| 2 | Primary story: press B in browse mode | "Approve payment, button" | Not tested | |
| 3 | Primary story: on the button, press Enter, then Space | The console logs "activated" once for each key | Not tested | |
| 4 | PrimaryDisabled story: press Tab to the button | "Approve payment, button, unavailable, You created this payment, so another approver must approve it." | Not tested | |
| 5 | PrimaryDisabled story: on the button, press Enter, then Space | The console logs "blocked", never "activated" | Not tested | |
| 6 | SecondaryDisabled and DangerDisabled: repeat row 4 | Same announcement on both | Not tested | |

## Contrast settings

| # | Check | Expected | Actual | Pass |
|---|---|---|---|---|
| 1 | Windows forced colours (Settings > Accessibility > Contrast themes, pick any), Primary and PrimaryDisabled side by side | Focus ring and borders visible. The disabled button can be told apart from the enabled one without reading the reason. | Not tested on Windows. The automated Chromium emulation shows the disabled button looks the same as the enabled one: see Findings 1. | Fail |
| 2 | Increase contrast on macOS (System Settings > Accessibility > Display > Increase contrast) | Borders, focus ring and the disabled state are still visible | Borders, focus ring and the disabled state all stay visible | Pass |

## Findings

| # | What happened | Severity | Issue or PR |
|---|---|---|---|
| 1 | In forced colours (emulated in Chromium), a disabled Button looks the same as an enabled one. Only the reason text tells them apart. Recorded as `test.fail()` in `e2e/storybook/button.a11y.spec.ts`. | Medium | #28 |
| 2 | VoiceOver reads the disabled reason twice: once as the button's description, then again as its own line. A little repetitive, not confusing. | Low | No change: accepted |
| 3 | NVDA not tested: no Windows machine available. VoiceOver on macOS covers the desktop screen reader rows for now. | n/a | |
| 4 | Automated, webkit only: the States 3 test fails in some runs and passes in others (1 of 15 in a repeat run, on a different variant each time). Safari by hand keeps the hover fill while pressed. A test timing problem, not a Button problem. | n/a | #31 |

## Verdict

Pass with findings