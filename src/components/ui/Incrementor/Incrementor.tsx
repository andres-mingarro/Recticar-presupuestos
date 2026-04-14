"use client";

import { cn } from "@/lib/cn";

type IncrementorProps = {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  className?: string;
  valueClassName?: string;
  disabled?: boolean;
  formatValue?: (value: number) => string;
  incrementoSmall?: boolean;
};

export function Incrementor({
  value,
  onIncrement,
  onDecrement,
  className,
  valueClassName,
  disabled = false,
  formatValue = (current) => String(current),
  incrementoSmall = false,
}: IncrementorProps) {
  return (
    <div
      className={cn(
        "Incrementor flex items-center justify-center",
        incrementoSmall ? "gap-0.5" : "gap-2",
        className
      )}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabled}
        className={cn(
          "flex cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40",
          incrementoSmall ? "h-7 w-7 text-sm" : "h-8 w-8 text-base"
        )}
      >
        -
      </button>
      <span
        className={cn(
          "inline-flex justify-center rounded-full bg-[var(--color-surface-alt)] font-semibold text-[var(--color-foreground)]",
          incrementoSmall ? "min-w-[36px] px-1.5 py-0.5 text-sm leading-none" : "min-w-8 px-2 py-1 text-sm",
          valueClassName
        )}
      >
        {formatValue(value)}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled}
        className={cn(
          "flex cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40",
          incrementoSmall ? "h-7 w-7 text-sm" : "h-8 w-8 text-base"
        )}
      >
        +
      </button>
    </div>
  );
}
