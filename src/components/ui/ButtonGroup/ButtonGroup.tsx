"use client";

import { cn } from "@/lib/cn";

const DEFAULT_ACTIVE_TONE =
  "border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-[0_10px_24px_rgba(234,88,12,0.28)]";

export type ButtonGroupOption<T extends string | number> = {
  value: T;
  label: string;
  activeTone?: string;
};

type ButtonGroupProps<T extends string | number> = {
  options: ButtonGroupOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function ButtonGroup<T extends string | number>({
  options,
  value,
  onChange,
}: ButtonGroupProps<T>) {
  return (
    <div className="ButtonGroup inline-flex w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              "flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)]",
              active
                ? (option.activeTone ?? DEFAULT_ACTIVE_TONE)
                : "border-transparent bg-transparent text-[var(--color-foreground-muted)] hover:bg-white hover:text-[var(--color-foreground)]"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
