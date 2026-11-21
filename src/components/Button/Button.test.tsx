import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Button } from "./Button";

const REASON = "You created this payment, so another approver must approve it.";

// Resolves aria-describedby the way an accessible description is computed for
// plain text targets: each referenced id, in order, joined by a space.
function accessibleDescription(element: HTMLElement): string {
  const ids = (element.getAttribute("aria-describedby") ?? "")
    .split(/\s+/)
    .filter(Boolean);
  return ids
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function renderInForm(ui: React.ReactElement) {
  const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
    // jsdom does not navigate; preventing the default keeps it from logging
    // "not implemented" while the submit event is still counted.
    event.preventDefault();
  });
  render(<form onSubmit={onSubmit}>{ui}</form>);
  return { onSubmit };
}

describe("Button", () => {
  test("AC-1: renders exactly one native button named by its children", () => {
    render(<Button>Approve payment</Button>);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);

    const button = screen.getByRole("button", { name: "Approve payment" });
    expect(button.tagName).toBe("BUTTON");
  });

  test("AC-2: defaults to type button and does not submit its form", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderInForm(<Button>Continue</Button>);

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button.getAttribute("type")).toBe("button");

    await user.click(button);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("AC-3: with type submit, clicking submits its form once", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderInForm(<Button type="submit">Confirm payment</Button>);

    await user.click(screen.getByRole("button", { name: "Confirm payment" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test("AC-4: clicking calls onClick exactly once", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Approve</Button>);

    await user.click(screen.getByRole("button", { name: "Approve" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("AC-5: Enter and Space each call onClick once", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Approve</Button>);

    const button = screen.getByRole("button", { name: "Approve" });
    button.focus();
    expect(document.activeElement).toBe(button);

    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);

    onClick.mockClear();
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("AC-6: reached with Tab and left with Shift + Tab in DOM order, without tabindex", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <Button>Approve</Button>
        <button type="button">After</button>
      </>,
    );

    const before = screen.getByRole("button", { name: "Before" });
    const button = screen.getByRole("button", { name: "Approve" });
    const after = screen.getByRole("button", { name: "After" });

    expect(button.hasAttribute("tabindex")).toBe(false);

    await user.tab();
    expect(document.activeElement).toBe(before);
    await user.tab();
    expect(document.activeElement).toBe(button);
    await user.tab();
    expect(document.activeElement).toBe(after);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(button);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(before);
  });

  test("AC-7: when disabled, uses aria-disabled and never the native disabled attribute", () => {
    render(
      <Button disabled disabledReason={REASON}>
        Approve
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Approve" });
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  test("AC-8: when disabled, is still reachable with Tab", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <Button disabled disabledReason={REASON}>
          Approve
        </Button>
      </>,
    );

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Before" }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Approve" }));
  });

  test("AC-9: when disabled, click, Enter and Space neither call onClick nor submit the form", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { onSubmit } = renderInForm(
      <Button type="submit" disabled disabledReason={REASON} onClick={onClick}>
        Approve
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Approve" });

    await user.click(button);
    expect(document.activeElement).toBe(button);
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("AC-10: when disabled, the reason is shown and is the accessible description", () => {
    render(
      <Button disabled disabledReason={REASON}>
        Approve
      </Button>,
    );

    expect(screen.getByText(REASON)).toBeTruthy();

    const button = screen.getByRole("button", { name: "Approve" });
    expect(button.hasAttribute("aria-describedby")).toBe(true);
    expect(accessibleDescription(button)).toBe(REASON);
  });

  test("AC-11: when not disabled, has no aria-disabled, no aria-describedby and no reason text", () => {
    const { container } = render(<Button>Approve</Button>);

    const button = screen.getByRole("button", { name: "Approve" });
    expect(button.hasAttribute("aria-disabled")).toBe(false);
    expect(button.hasAttribute("aria-describedby")).toBe(false);
    // The only text Button renders when enabled is its label.
    expect(container.textContent).toBe("Approve");
  });

  // AC-12 and AC-13 are type-level. `pnpm typecheck` is the gate: each
  // `@ts-expect-error` fails the type check if the line below it compiles.
  // The functions are never called, so these tests do nothing at runtime.
  test("AC-12: disabled without disabledReason is a type error", () => {
    const typeOnly = () => (
      // @ts-expect-error disabledReason is required when disabled is true
      <Button disabled>Approve</Button>
    );
    expect(typeof typeOnly).toBe("function");
  });

  test("AC-13: a number or a JSX element as children is a type error", () => {
    const typeOnlyNumber = () => (
      // @ts-expect-error children must be a string
      <Button>{42}</Button>
    );
    const typeOnlyElement = () => (
      // @ts-expect-error children must be a string
      <Button>
        <span>Approve</span>
      </Button>
    );
    expect(typeof typeOnlyNumber).toBe("function");
    expect(typeof typeOnlyElement).toBe("function");
  });
});
