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

const btnBase = "flex shrink-0 select-none items-center justify-center font-bold text-[var(--text-color-gray)] transition-colors disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer";

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
  const sm = incrementoSmall;

  return (
    <div
      className={cn(
        "Incrementor inline-flex items-center overflow-hidden rounded-full border border-[var(--color-border)]",
        disabled && "opacity-40",
        className
      )}
      style={{ background: "white" }}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabled}
        aria-label="Decrementar"
        className={cn(
          btnBase,
          "border-r border-[var(--color-border)]",
          sm ? "size-7 text-sm" : "size-9 text-base"
        )}
        style={{ background: "white" }}
      >
        −
      </button>

      <span
        className={cn(
          "inline-flex select-none items-center justify-center font-semibold tabular-nums text-[var(--text-color-defult)]",
          sm ? "min-w-[28px] px-1.5 text-sm" : "min-w-[36px] px-2 text-sm",
          valueClassName
        )}
        style={{ background: "white" }}
      >
        {formatValue(value)}
      </span>

      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled}
        aria-label="Incrementar"
        className={cn(
          btnBase,
          "border-l border-[var(--color-border)]",
          sm ? "size-7 text-sm" : "size-9 text-base"
        )}
        style={{ background: "white" }}
      >
        +
      </button>
    </div>
  );
}
