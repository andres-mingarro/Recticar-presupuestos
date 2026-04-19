"use client";

import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export type TabsOption<T extends string> = {
  value: T;
  label: string;
  icon?: IconName;
};

type TabsProps<T extends string> = {
  options: TabsOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  expand?: boolean;
};

export function Tabs<T extends string>({
  options,
  value,
  onChange,
  className,
  expand = false,
}: TabsProps<T>) {
  return (
    <div className={cn("Tabs flex items-end gap-1 px-6", expand && "w-full", className)}>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "TabsButton",
              "cursor-pointer inline-flex items-center justify-center gap-2 rounded-t-2xl border border-transparent border-b-0 px-6 py-3.5 text-base font-semibold transition-all duration-200",
              expand && "flex-1 basis-0",
              active
                ? "border-[var(--color-border)] bg-white text-[var(--color-accent)]"
                : "bg-[var(--color-surface-alt)] text-[var(--text-color-gray)] hover:border-[var(--border-ligth)] hover:bg-gradient-to-b hover:from-[var(--color-surface-alt)] hover:to-white hover:text-[var(--text-color-defult)]"
            )}
            aria-pressed={active}
          >
            {option.icon ? <Icon name={option.icon} className="h-[1.35rem] w-[1.35rem] shrink-0" /> : null}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
