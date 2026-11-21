import { expect, test, type Locator, type Page } from "@playwright/test";

// Automates the rows of docs/a11y/button.md that a browser can check on its own.
// Each test name starts with the row it replaces, such as "Keyboard 6".
//
// What this file does not do, and docs/a11y/button.md still covers by hand:
// - judge whether the focus ring is easy to see (only a person can)
// - listen to VoiceOver and NVDA (the tests read the accessibility tree,
//   which is what a screen reader starts from, not what it says)
//
// Keyboard behaviour is also unit tested (AC-4 to AC-9), but in jsdom, which
// has no real keyboard. The keyboard tests here add what only a browser shows:
// the focus ring on every story, Space acting on release, no page scroll.
//
// Rows already covered elsewhere are not repeated here:
// - default, hover and disabled colours, cursor: AC-16, AC-20, AC-21, stories
// - long label at 320 CSS px: AC-18, LongLabelReflow story
// - zero axe violations: AC-19, every story

const REASON = "You created this payment, so another approver must approve it.";
const LABEL = "Approve payment";

const ENABLED = ["primary", "secondary", "danger"] as const;
const DISABLED = ["primary-disabled", "secondary-disabled", "danger-disabled"] as const;
type StoryId = (typeof ENABLED)[number] | (typeof DISABLED)[number];

// ---------------------------------------------------------------------------
// Helpers

async function openStory(page: Page, id: StoryId): Promise<Locator> {
  await page.goto(`/iframe.html?id=components-button--${id}&viewMode=story`);
  const button = page.getByRole("button", { name: LABEL });
  await expect(button).toBeVisible();
  return button;
}

// Moves focus to the button with the keyboard, so :focus-visible applies.
// WebKit follows Safari: plain Tab may skip buttons, Option + Tab never does.
async function tabToButton(page: Page, button: Locator, browserName: string): Promise<void> {
  const blur = () => page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await blur();
  await page.keyboard.press("Tab");
  if (browserName === "webkit" && !(await button.evaluate((el) => el === document.activeElement))) {
    await blur();
    await page.keyboard.press("Alt+Tab");
  }
  await expect(button).toBeFocused();
}

// Counts native click events on the button. Enter and Space on a native button
// dispatch a click, which is what calls onClick.
async function countClicks(button: Locator): Promise<void> {
  await button.evaluate((el) => {
    const w = window as unknown as { clicks: number; prevented: number };
    w.clicks = 0;
    w.prevented = 0;
    // Bubble phase on window, so the Button's own handler has already run.
    window.addEventListener("click", (event) => {
      if (event.target !== el) return;
      w.clicks += 1;
      if (event.defaultPrevented) w.prevented += 1;
    });
  });
}

async function clicks(page: Page): Promise<{ clicks: number; prevented: number }> {
  return page.evaluate(() => {
    const w = window as unknown as { clicks: number; prevented: number };
    return { clicks: w.clicks, prevented: w.prevented };
  });
}

type Rgba = [number, number, number, number];

function parseColour(value: string): Rgba {
  const match = /rgba?\(([^)]+)\)/.exec(value);
  if (!match) throw new Error(`Cannot parse colour "${value}"`);
  const parts = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return [parts[0], parts[1], parts[2], parts[3] ?? 1];
}

// Lays a semi-transparent colour over an opaque one.
function over(top: Rgba, bottom: Rgba): Rgba {
  const a = top[3];
  return [0, 1, 2].map((i) => top[i] * a + bottom[i] * (1 - a)).concat(1) as Rgba;
}

// WCAG 2.2 relative luminance and contrast ratio.
function luminance([r, g, b]: Rgba): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: Rgba, b: Rgba): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

async function pageBackground(page: Page): Promise<Rgba> {
  const values = await page.evaluate(() => [
    getComputedStyle(document.body).backgroundColor,
    getComputedStyle(document.documentElement).backgroundColor,
  ]);
  const white: Rgba = [255, 255, 255, 1];
  return values.map(parseColour).reduceRight((under, layer) => over(layer, under), white);
}

async function styles(button: Locator) {
  return button.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      background: s.backgroundColor,
      colour: s.color,
      border: s.borderTopColor,
      borderWidth: parseFloat(s.borderTopWidth),
      outlineStyle: s.outlineStyle,
      outlineWidth: s.outlineWidth,
      outlineOffset: s.outlineOffset,
      outlineColour: s.outlineColor,
      boxShadow: s.boxShadow,
    };
  });
}

// ---------------------------------------------------------------------------
// Keyboard

test.describe("Keyboard", () => {
  for (const id of [...ENABLED, ...DISABLED]) {
    test(`Keyboard 1-3, 8, 10: ${id}, Tab shows a two-layer ring that contrasts with the page and the inner ring`, async ({
      page,
      browserName,
    }) => {
      // AC-15 checks the ring on the primary variant only. This checks all six
      // stories, and adds the contrast the two layers exist to provide.
      const button = await openStory(page, id);
      await tabToButton(page, button, browserName);
      expect(await button.evaluate((el) => el.matches(":focus-visible"))).toBe(true);

      const s = await styles(button);
      expect(s.outlineStyle).toBe("solid");
      expect(s.outlineWidth).toBe("3px");
      expect(s.outlineOffset).toBe("2px");
      expect(s.boxShadow).toContain("0px 0px 0px 2px");

      // WCAG 1.4.11: the outer ring needs 3:1 against what sits next to it,
      // the page outside and the white inner ring inside.
      const outer = over(parseColour(s.outlineColour), await pageBackground(page));
      const inner = parseColour(s.boxShadow);
      expect(contrast(outer, await pageBackground(page)), "outer ring against the page").toBeGreaterThanOrEqual(3);
      expect(contrast(outer, inner), "outer ring against the inner ring").toBeGreaterThanOrEqual(3);
    });
  }

  test("Keyboard 4: Shift + Tab moves focus off the button and the ring goes", async ({ page, browserName }) => {
    const button = await openStory(page, "primary");
    await tabToButton(page, button, browserName);
    await page.keyboard.press(browserName === "webkit" ? "Alt+Shift+Tab" : "Shift+Tab");
    await expect(button).not.toBeFocused();
    expect((await styles(button)).outlineStyle).toBe("none");
  });

  test("Keyboard 5: Enter activates once", async ({ page, browserName }) => {
    const button = await openStory(page, "primary");
    await tabToButton(page, button, browserName);
    await countClicks(button);
    await page.keyboard.press("Enter");
    expect(await clicks(page)).toEqual({ clicks: 1, prevented: 0 });
  });

  test("Keyboard 6: Space activates once, on release, and does not scroll the page", async ({ page, browserName }) => {
    const button = await openStory(page, "primary");
    // Make the page taller than the window, so a scroll would show.
    await page.evaluate(() => {
      const spacer = document.createElement("div");
      spacer.style.height = "3000px";
      document.body.append(spacer);
    });
    await tabToButton(page, button, browserName);
    await countClicks(button);

    await page.keyboard.down("Space");
    expect((await clicks(page)).clicks, "nothing yet while Space is held").toBe(0);
    await page.keyboard.up("Space");
    expect((await clicks(page)).clicks, "one activation on release").toBe(1);
    expect(await page.evaluate(() => window.scrollY), "page did not scroll").toBe(0);
  });

  test("Keyboard 7: Escape does nothing and focus stays", async ({ page, browserName }) => {
    const button = await openStory(page, "primary");
    await tabToButton(page, button, browserName);
    await countClicks(button);
    await page.keyboard.press("Escape");
    expect((await clicks(page)).clicks).toBe(0);
    await expect(button).toBeFocused();
  });

  for (const id of DISABLED) {
    test(`Keyboard 9-10: ${id}, Enter and Space are blocked in a real browser`, async ({ page, browserName }) => {
      // AC-9 proves onClick is not called, in jsdom. Here the browser still
      // fires a click for each key, because aria-disabled does not stop it;
      // every one must have been cancelled by the Button's disabled branch.
      const button = await openStory(page, id);
      await tabToButton(page, button, browserName);
      await countClicks(button);
      await page.keyboard.press("Enter");
      await page.keyboard.press("Space");
      const { clicks: total, prevented } = await clicks(page);
      expect(prevented).toBe(total);
      await expect(button).toBeFocused();
    });
  }
});

// ---------------------------------------------------------------------------
// States

test.describe("States", () => {
  for (const id of ENABLED) {
    test(`States 3: ${id}, pressing with the pointer looks the same as hover`, async ({ page }) => {
      const button = await openStory(page, id);
      await button.hover();
      const hover = await styles(button);
      await page.mouse.down();
      const active = await styles(button);
      await page.mouse.up();

      expect(active.background).toBe(hover.background);
      expect(active.colour).toBe(hover.colour);
      expect(active.border).toBe(hover.border);
      // A pointer press is not keyboard focus, so no ring.
      expect(active.outlineStyle).toBe("none");
    });
  }
});

// ---------------------------------------------------------------------------
// Screen reader rows: what the accessibility tree exposes

test.describe("Accessibility tree", () => {
  for (const id of ENABLED) {
    test(`VoiceOver 1-4, NVDA 1-2: ${id} exposes "${LABEL}, button" and nothing more`, async ({ page }) => {
      const button = await openStory(page, id);
      await expect(button).toHaveRole("button");
      await expect(button).toHaveAccessibleName(LABEL);
      await expect(button).toBeEnabled();
      await expect(button).toHaveAccessibleDescription("");
    });
  }

  for (const id of DISABLED) {
    test(`VoiceOver 5, 8, NVDA 4, 6: ${id} exposes name, role, disabled and the reason`, async ({ page }) => {
      const button = await openStory(page, id);
      await expect(button).toHaveRole("button");
      await expect(button).toHaveAccessibleName(LABEL);
      await expect(button).toBeDisabled();
      await expect(button).toHaveAccessibleDescription(REASON);
    });
  }
});

// ---------------------------------------------------------------------------
// Zoom and contrast

test.describe("Zoom and contrast", () => {
  for (const id of DISABLED) {
    test(`Zoom 2: ${id} at 320 CSS px, the button and the reason fit without sideways scroll`, async ({ page }) => {
      // 320 CSS px is a 1280 px window at 400%, the WCAG 1.4.10 test size.
      await page.setViewportSize({ width: 320, height: 640 });
      const button = await openStory(page, id);
      const reason = page.getByText(REASON);

      const fits = await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      );
      expect(fits, "no horizontal scroll").toBe(true);
      for (const element of [button, reason]) {
        const box = await element.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(320);
      }
      expect(await button.evaluate((el) => el.scrollWidth <= el.clientWidth), "label not cut off").toBe(true);
    });
  }

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    for (const id of ENABLED) {
      test(`Zoom 3: ${id}, hover and focus run no transition or animation`, async ({ page, browserName }) => {
        const button = await openStory(page, id);
        await button.hover();
        await tabToButton(page, button, browserName);
        const motion = await button.evaluate((el) => ({
          animations: el.getAnimations().length,
          durations: getComputedStyle(el).transitionDuration.split(",").map((d) => parseFloat(d)),
        }));
        expect(motion.animations).toBe(0);
        expect(motion.durations.every((d) => d === 0)).toBe(true);
      });
    }
  });

  test.describe("in Windows forced colours", () => {
    // Forced colours emulation exists in Chromium only. The real check, on
    // Windows with a contrast theme, stays in docs/a11y/button.md.
    test.use({ forcedColors: "active" });
    test.skip(({ browserName }) => browserName !== "chromium", "Chromium only");

    for (const id of [...ENABLED, ...DISABLED]) {
      test(`Zoom 4: ${id}, the border and the focus ring survive`, async ({ page, browserName }) => {
        const button = await openStory(page, id);
        const background = await pageBackground(page);
        const resting = await styles(button);
        expect(resting.borderWidth, "border drawn").toBeGreaterThanOrEqual(1);
        expect(
          contrast(over(parseColour(resting.border), background), background),
          "border against the page",
        ).toBeGreaterThanOrEqual(3);

        await tabToButton(page, button, browserName);
        const focused = await styles(button);
        // The inner ring is a box-shadow, which forced colours removes. The
        // outer ring must carry focus alone.
        expect(focused.outlineStyle).toBe("solid");
        expect(
          contrast(over(parseColour(focused.outlineColour), background), background),
          "focus ring against the page",
        ).toBeGreaterThanOrEqual(3);
      });
    }

    // Known finding: with aria-disabled instead of the native attribute, the
    // browser does not switch a disabled button to the system GrayText colour,
    // and the Button sets no forced-colours style of its own. Disabled and
    // enabled then look identical; only the reason text tells them apart.
    // test.fail() keeps the suite green while the finding is open, and turns
    // red as soon as the Button is fixed, as a reminder to remove it.
    test("Zoom 4: a disabled button looks different from an enabled one", async ({ page }) => {
      test.fail();
      const enabled = await styles(await openStory(page, "primary"));
      const disabled = await styles(await openStory(page, "primary-disabled"));
      const look = (s: typeof enabled) => [s.colour, s.background, s.border].join(" | ");
      expect(look(disabled)).not.toBe(look(enabled));
    });
  });
});
