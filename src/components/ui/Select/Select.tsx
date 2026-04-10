import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./Select.module.scss";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "Select",
        styles.Select,
        "h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]",
        className
      )}
      {...props}
    />
  );
}
