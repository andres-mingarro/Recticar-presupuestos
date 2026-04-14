import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./Button.module.scss";

type ButtonVariant = "primary" | "secondary" | "ghost" | "dark";
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
    "inline-flex cursor-pointer items-center justify-center rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] disabled:pointer-events-none disabled:opacity-60",
    size === "md" ? "h-11 px-4 text-sm" : "h-9 px-3 text-sm",
    variant === "primary" &&
      "bg-[linear-gradient(135deg,var(--color-accent),#fb923c)] text-white hover:brightness-95 focus-visible:ring-[var(--color-accent)]",
    variant === "secondary" &&
      "border border-[var(--color-border)] bg-[linear-gradient(135deg,#ffffff,#f1f5f9)] text-[var(--color-foreground)] hover:brightness-95 focus-visible:ring-[var(--color-accent)]",
    variant === "ghost" &&
      "bg-[linear-gradient(135deg,transparent,var(--color-surface-alt)/60%)] text-[var(--color-foreground-muted)] hover:brightness-95 focus-visible:ring-[var(--color-accent)]",
    variant === "dark" &&
      "bg-[linear-gradient(135deg,#475569,#1e293b)] text-white hover:brightness-95 focus-visible:ring-slate-700",
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
