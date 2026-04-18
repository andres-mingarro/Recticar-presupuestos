"use client";

import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

const DEFAULT_ACTIVE_TONE =
  "border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-[0_10px_24px_rgba(234,88,12,0.28)]";

export type ButtonGroupOption<T extends string | number> = {
  value: T;
  label: string;
  activeTone?: string;
  icon?: IconName;
};

type ButtonGroupProps<T extends string | number> = {
  options: ButtonGroupOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  buttonClassName?: string;
};

export function ButtonGroup<T extends string | number>({
  options,
  value,
  onChange,
  className,
  buttonClassName,
}: ButtonGroupProps<T>) {
  return (
    <div className={cn("ButtonGroup inline-flex rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1.5", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)]",
              buttonClassName,
              active
                ? (option.activeTone ?? DEFAULT_ACTIVE_TONE)
                : "border-transparent bg-transparent text-[var(--text-color-gray)] hover:bg-white hover:text-[var(--text-color-defult)]"
            )}
          >
            {option.icon ? <Icon name={option.icon} className="h-4 w-4 shrink-0" /> : null}
            <span className="whitespace-nowrap">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
