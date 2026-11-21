"use client";

import { useId, type MouseEvent } from "react";

type Variant = "primary" | "secondary" | "danger";

type CommonProps = {
  /** Visible label and accessible name. Text only. */
  children: string;
  variant?: Variant;
  /** No `reset`: clearing a whole payment form in one press is itself a risk. */
  type?: "button" | "submit";
  /** Fires on pointer, Enter or Space, only while the button is not disabled. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

// `disabled: true` without a reason does not compile (AC-12). The reason is
// optional while enabled, so a parent can pass both from one condition.
type EnabledProps = { disabled?: false; disabledReason?: string };
type DisabledProps = { disabled: true; disabledReason: string };

export type ButtonProps = CommonProps & (EnabledProps | DisabledProps);

const BASE = "min-h-target min-w-target rounded-sm border px-md text-body font-medium focus-ring";

const ENABLED: Record<Variant, string> = {
  primary: "cursor-pointer border-transparent bg-primary text-on-primary hover:bg-primary-hover",
  secondary:
    "cursor-pointer border-outline-strong bg-transparent text-on-surface hover:bg-surface-variant",
  danger: "cursor-pointer border-transparent bg-danger text-on-danger hover:bg-danger-hover",
};

// The same for every variant, with no hover: a button that cannot be pressed
// should neither signal how important its action is nor invite a press.
const DISABLED =
  "cursor-not-allowed border-outline-strong bg-surface-variant text-on-surface-variant";

/**
 * Commits an action that changes state or data, such as confirming,
 * approving or rejecting a payment.
 *
 * Use it for actions on the current screen. Do not use it to navigate: anything
 * that changes the URL is a link. A screen has at most one primary button.
 *
 * Accessibility:
 * - The accessible name is the label, so the label must make sense on its own.
 * - Disabled is marked with `aria-disabled`, never the native attribute, so the
 *   button stays focusable and its reason, shown below it and linked with
 *   `aria-describedby`, can be read.
 * - Enter and Space come from the native element; there is no key handling.
 * - Pressing Enter in a text field can still submit a form without reaching
 *   this button. Blocking that is the form's job.
 */
export function Button({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled,
  disabledReason,
}: ButtonProps) {
  const reasonId = useId();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (disabled) {
      // Without the native attribute, a submit button would still submit.
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  return (
    <span className="inline-flex flex-col gap-xs">
      <button
        type={type}
        className={`${BASE} ${disabled ? DISABLED : ENABLED[variant]}`}
        aria-disabled={disabled ? true : undefined}
        aria-describedby={disabled ? reasonId : undefined}
        onClick={handleClick}
      >
        {children}
      </button>
      {disabled ? (
        <span id={reasonId} className="text-body font-normal text-on-surface">
          {disabledReason}
        </span>
      ) : null}
    </span>
  );
}
