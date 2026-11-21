import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent as syntheticUserEvent, within } from "storybook/test";

import { Button } from "./Button";

// Browser acceptance criteria AC-14 to AC-21 from specs/components/button.md.
// AC-19 (zero axe violations) is enforced for every story by the a11y addon,
// with `a11y.test` set to "error" in .storybook/preview.tsx.
//
// Every token is resolved by its full name, such as "--color-primary". Tailwind
// emits a theme variable to :root only when its name appears in a scanned
// source file, so naming the tokens here is also what makes them readable at
// runtime.

const REASON = "You created this payment, so another approver must approve it.";

const LONG_LABEL =
  "Approve the payment of 48,250.00 GBP to Northfield Logistics Limited for invoice INV-2026-0419";

type Variant = "primary" | "secondary" | "danger";

const DEFAULT_TOKENS: Record<
  Variant,
  { background: string; text: string; border?: string }
> = {
  primary: { background: "--color-primary", text: "--color-on-primary" },
  secondary: {
    background: "transparent",
    text: "--color-on-surface",
    border: "--color-outline-strong",
  },
  danger: { background: "--color-danger", text: "--color-on-danger" },
};

const HOVER_TOKENS: Record<Variant, string> = {
  primary: "--color-primary-hover",
  secondary: "--color-surface-variant",
  danger: "--color-danger-hover",
};

// ---------------------------------------------------------------------------
// Helpers

function assertTokenDefined(token: string): void {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  if (raw === "") {
    throw new Error(
      `Token ${token} is not defined at runtime. Check that Storybook loads src/app/globals.css through Tailwind.`,
    );
  }
}

// Resolves a colour token to the same serialisation the browser uses for any
// computed colour, by applying it to a throwaway element.
function computedColour(value: string): string {
  if (value !== "transparent") assertTokenDefined(value);
  const probe = document.createElement("span");
  probe.style.color = value === "transparent" ? "transparent" : `var(${value})`;
  document.body.append(probe);
  const colour = getComputedStyle(probe).color;
  probe.remove();
  return colour;
}

function computedLength(token: string): number {
  assertTokenDefined(token);
  const probe = document.createElement("span");
  probe.style.display = "block";
  probe.style.width = `var(${token})`;
  document.body.append(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();
  return width;
}

// Real pointer and keyboard input exist only in the Storybook test project,
// where Vitest drives the browser through Playwright. CSS :hover cannot be
// triggered by synthetic events, so hover checks run only there.
type RealUserEvent = (typeof import("vitest/browser"))["userEvent"];

async function realUserEvent(): Promise<RealUserEvent | null> {
  if (!(globalThis as { __vitest_browser__?: boolean }).__vitest_browser__) return null;
  const { userEvent } = await import("vitest/browser");
  return userEvent;
}

// The spec neither requires nor forbids a colour transition. Reading a computed
// style mid-transition would fail a correct Button, so every check that follows
// a state change waits for the element's animations and transitions to finish.
async function settled(element: HTMLElement): Promise<void> {
  await Promise.all(element.getAnimations().map((animation) => animation.finished));
}

function getButton(canvasElement: HTMLElement, name: string): HTMLElement {
  const canvas = within(canvasElement);
  expect(canvas.getAllByRole("button"), "exactly one button").toHaveLength(1);
  return canvas.getByRole("button", { name });
}

// ---------------------------------------------------------------------------
// Checks, one per acceptance criterion

function checkTargetSize(button: HTMLElement): void {
  const target = computedLength("--spacing-target");
  const { width, height } = button.getBoundingClientRect();
  expect(height, "AC-14 height").toBeGreaterThanOrEqual(target);
  expect(width, "AC-14 width").toBeGreaterThanOrEqual(target);
}

function checkDefaultColours(button: HTMLElement, variant: Variant): void {
  const style = getComputedStyle(button);
  const tokens = DEFAULT_TOKENS[variant];
  expect(style.backgroundColor, "AC-20 background").toBe(computedColour(tokens.background));
  expect(style.color, "AC-20 text").toBe(computedColour(tokens.text));
  if (tokens.border) {
    expect(style.borderTopColor, "AC-20 border").toBe(computedColour(tokens.border));
  }
}

function checkDisabledColours(button: HTMLElement): void {
  const style = getComputedStyle(button);
  expect(style.backgroundColor, "AC-16 background").toBe(
    computedColour("--color-surface-variant"),
  );
  expect(style.color, "AC-16 text").toBe(computedColour("--color-on-surface-variant"));
  expect(style.borderTopColor, "AC-16 border").toBe(computedColour("--color-outline-strong"));
  expect(style.opacity, "AC-16 opacity").toBe("1");
}

function checkReasonVisible(canvasElement: HTMLElement): void {
  const reason = within(canvasElement).getByText(REASON);
  const box = reason.getBoundingClientRect();
  expect(box.width, "AC-17 width").toBeGreaterThan(0);
  expect(box.height, "AC-17 height").toBeGreaterThan(0);
  expect(box.left, "AC-17 inside viewport, left").toBeGreaterThanOrEqual(0);
  expect(box.top, "AC-17 inside viewport, top").toBeGreaterThanOrEqual(0);
  expect(box.right, "AC-17 inside viewport, right").toBeLessThanOrEqual(window.innerWidth);
  expect(box.bottom, "AC-17 inside viewport, bottom").toBeLessThanOrEqual(window.innerHeight);

  for (let ancestor = reason.parentElement; ancestor; ancestor = ancestor.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(ancestor);
    if (overflowX === "visible" && overflowY === "visible") continue;
    const clip = ancestor.getBoundingClientRect();
    const label = `AC-17 inside clipping ancestor <${ancestor.tagName.toLowerCase()}>`;
    expect(box.left, label).toBeGreaterThanOrEqual(clip.left);
    expect(box.top, label).toBeGreaterThanOrEqual(clip.top);
    expect(box.right, label).toBeLessThanOrEqual(clip.right);
    expect(box.bottom, label).toBeLessThanOrEqual(clip.bottom);
  }
}

async function checkHover(button: HTMLElement, variant: Variant): Promise<void> {
  expect(getComputedStyle(button).cursor, "AC-21 cursor").toBe("pointer");
  const real = await realUserEvent();
  if (!real) return;
  await real.hover(button);
  await settled(button);
  expect(getComputedStyle(button).backgroundColor, "AC-21 hover background").toBe(
    computedColour(HOVER_TOKENS[variant]),
  );
  await real.unhover(button);
}

async function checkDisabledHover(button: HTMLElement): Promise<void> {
  expect(getComputedStyle(button).cursor, "AC-21 cursor while disabled").toBe("not-allowed");
  const real = await realUserEvent();
  if (!real) return;
  const before = getComputedStyle(button).backgroundColor;
  await real.hover(button);
  await settled(button);
  expect(getComputedStyle(button).backgroundColor, "AC-21 no hover change while disabled").toBe(
    before,
  );
  await real.unhover(button);
}

// Chrome serialises each computed shadow layer as
// "<colour> <x> <y> <blur> <spread>", with an optional trailing "inset".
const SHADOW_LAYER = /^(.*?)\s+(-?[\d.]+px)\s+(-?[\d.]+px)\s+(-?[\d.]+px)\s+(-?[\d.]+px)(\s+inset)?$/;

function shadowLayers(boxShadow: string): { colour: string; spread: string }[] {
  const layers: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of boxShadow) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      layers.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  layers.push(current.trim());
  return layers.flatMap((layer) => {
    const match = SHADOW_LAYER.exec(layer);
    return match ? [{ colour: match[1], spread: match[5] }] : [];
  });
}

function checkFocusRing(button: HTMLElement): void {
  const style = getComputedStyle(button);
  expect(style.outlineStyle, "AC-15 outline is drawn").not.toBe("none");
  expect(style.outlineWidth, "AC-15 outline width").toBe("3px");
  expect(style.outlineColor, "AC-15 outline colour").toBe(computedColour("--color-focus"));
  expect(style.outlineOffset, "AC-15 outline offset").toBe("2px");

  const onFocus = computedColour("--color-on-focus");
  const inner = shadowLayers(style.boxShadow).find(
    (layer) => layer.spread === "2px" && layer.colour === onFocus,
  );
  expect(inner, `AC-15 a 2px box-shadow in --color-on-focus, got "${style.boxShadow}"`).toBeDefined();
}

// ---------------------------------------------------------------------------
// Stories

const meta = {
  title: "Components/Button",
  component: Button,
  args: { children: "Approve payment" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

function defaultStory(variant: Variant): Story {
  return {
    args: { variant },
    play: async ({ canvasElement, step }) => {
      const button = getButton(canvasElement, "Approve payment");
      await step("AC-14 target size", () => checkTargetSize(button));
      await step("AC-20 default colours", () => checkDefaultColours(button, variant));
      await step("AC-21 hover and cursor", () => checkHover(button, variant));
    },
  };
}

function disabledStory(variant: Variant): Story {
  return {
    args: { variant, disabled: true, disabledReason: REASON },
    play: async ({ canvasElement, step }) => {
      const button = getButton(canvasElement, "Approve payment");
      await step("AC-14 target size", () => checkTargetSize(button));
      await step("AC-16 disabled colours", () => checkDisabledColours(button));
      await step("AC-17 reason is visible", () => checkReasonVisible(canvasElement));
      await step("AC-21 no hover, not-allowed cursor", () => checkDisabledHover(button));
    },
  };
}

export const Primary: Story = defaultStory("primary");

export const PrimaryFocus: Story = {
  args: { variant: "primary" },
  play: async ({ canvasElement, step }) => {
    const button = getButton(canvasElement, "Approve payment");
    await step("Focus the button with Tab", async () => {
      (document.activeElement as HTMLElement | null)?.blur();
      const real = await realUserEvent();
      if (real) await real.tab();
      else await syntheticUserEvent.tab();
      expect(document.activeElement, "Tab reaches the button").toBe(button);
    });
    await step("AC-15 two-layer focus ring", async () => {
      await settled(button);
      checkFocusRing(button);
    });
  },
};

export const PrimaryDisabled: Story = disabledStory("primary");

export const Secondary: Story = defaultStory("secondary");

export const SecondaryDisabled: Story = disabledStory("secondary");

export const Danger: Story = defaultStory("danger");

export const DangerDisabled: Story = disabledStory("danger");

export const LongLabelReflow: Story = {
  args: { variant: "primary", children: LONG_LABEL },
  parameters: {
    viewport: {
      options: {
        reflow320: {
          name: "320 CSS px (400% zoom on 1280 px)",
          styles: { width: "320px", height: "640px" },
          type: "mobile",
        },
      },
    },
  },
  globals: { viewport: { value: "reflow320", isRotated: false } },
  play: async ({ canvasElement, step }) => {
    const button = getButton(canvasElement, LONG_LABEL);
    await step("AC-18 viewport is 320 CSS px wide", () => {
      expect(window.innerWidth).toBe(320);
    });
    await step("AC-18 label wraps and nothing scrolls sideways", () => {
      const target = computedLength("--spacing-target");
      expect(button.getBoundingClientRect().height, "AC-18 button grows taller").toBeGreaterThan(
        target,
      );
      expect(button.scrollWidth, "AC-18 label not cut off").toBeLessThanOrEqual(button.clientWidth);
      const page = document.documentElement;
      expect(page.scrollWidth, "AC-18 no horizontal scroll").toBeLessThanOrEqual(page.clientWidth);
    });
  },
};
