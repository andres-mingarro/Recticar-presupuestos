import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./Input.module.scss";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "Input",
        styles.Input,
        "h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-foreground)] outline-none transition placeholder:text-[var(--color-foreground-subtle)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]",
        className
      )}
      {...props}
    />
  );
}
