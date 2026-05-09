"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  labelPosition?: "left" | "right";
  className?: string;
};

export function Switch({ checked, onChange, label, labelPosition = "right", className }: SwitchProps) {
  const id = useId();

  const labelEl = label ? (
    <span className="whitespace-nowrap text-xs font-medium text-[var(--text-color-gray)]">
      {label}
    </span>
  ) : null;

  return (
    <label htmlFor={id} className={cn("Switch flex cursor-pointer items-center gap-2", className)}>
      {labelPosition === "left" && labelEl}
      {/* opacity-0 sobre el track — evita que el browser haga scroll hacia un sr-only fuera de viewport */}
      <span className="relative inline-flex h-5 w-9 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
        <span
          className={cn(
            "pointer-events-none relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors duration-200",
            checked ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block size-4 rounded-full bg-white shadow transition-transform duration-200",
              checked ? "translate-x-4" : "translate-x-0"
            )}
          />
        </span>
      </span>
      {labelPosition === "right" && labelEl}
    </label>
  );
}
