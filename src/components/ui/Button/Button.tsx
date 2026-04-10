import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./Button.module.scss";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "sm";

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "Button",
    styles.Button,
    "inline-flex items-center justify-center rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] disabled:pointer-events-none disabled:opacity-60",
    size === "md" ? "h-11 px-4 text-sm" : "h-9 px-3 text-sm",
    variant === "primary" &&
      "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-strong)] focus-visible:ring-[var(--color-accent)]",
    variant === "secondary" &&
      "border border-[var(--color-border)] bg-white text-[var(--color-foreground)] hover:bg-[var(--color-surface-alt)] focus-visible:ring-[var(--color-accent)]",
    variant === "ghost" &&
      "text-[var(--color-foreground-muted)] hover:bg-[var(--color-surface-alt)] focus-visible:ring-[var(--color-accent)]",
    className
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant,
  size,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  );
}
