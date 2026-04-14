"use client";

import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import styles from "./Tabs.module.scss";

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
    <div className={cn("Tabs", styles.Tabs, expand && styles.TabsExpanded, className)}>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "TabsButton",
              styles.TabsButton,
              expand && styles.TabsButtonExpanded,
              active ? styles.TabsButtonActive : styles.TabsButtonInactive
            )}
            aria-pressed={active}
          >
            {option.icon ? <Icon name={option.icon} className="h-4 w-4 shrink-0" /> : null}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
