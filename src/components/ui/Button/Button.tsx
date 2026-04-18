import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode, ElementType } from "react";
import { cn } from "@/lib/cn";
import styles from "./Button.module.scss";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "dark" | "warm" | "burnt" | "outline" | "outline-warm" | "outline-dark" | "outline-ghost" | "danger-ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

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
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] disabled:pointer-events-none disabled:opacity-60",
    size === "sm" && "h-8 px-3 text-xs",
    size === "md" && "h-11 px-4 text-sm",
    size === "lg" && "h-13 px-6 text-base",
    variant === "primary" &&
      "bg-[linear-gradient(135deg,var(--orange-vivid),var(--color-accent))] text-white shadow-[0_2px_8px_var(--color-accent-soft)] hover:brightness-105 focus-visible:ring-[var(--color-accent)]",
    variant === "secondary" &&
      "border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--cream-warm),var(--peach-soft))] text-[var(--brown-burnt)] hover:brightness-95 focus-visible:ring-[var(--color-accent)]",
    variant === "ghost" &&
      "bg-transparent text-[var(--text-color-gray)] hover:bg-[var(--color-surface-alt)] focus-visible:ring-[var(--color-accent)]",
    variant === "dark" &&
      "bg-[linear-gradient(135deg,#475569,#1e293b)] text-white hover:brightness-110 focus-visible:ring-slate-700",
    variant === "warm" &&
      "bg-[linear-gradient(135deg,var(--apricot-light),var(--orange-vivid))] text-white hover:brightness-105 focus-visible:ring-[var(--orange-vivid)]",
    variant === "burnt" &&
      "bg-[linear-gradient(135deg,var(--color-accent),var(--brown-burnt))] text-white hover:brightness-110 focus-visible:ring-[var(--brown-burnt)]",
    variant === "outline" &&
      "border border-[var(--color-accent)] bg-transparent text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] focus-visible:ring-[var(--color-accent)]",
    variant === "outline-warm" &&
      "border border-[var(--brown-burnt)] bg-transparent text-[var(--brown-burnt)] hover:bg-[var(--peach-soft)]/40 focus-visible:ring-[var(--brown-burnt)]",
    variant === "outline-dark" &&
      "border border-[#475569] bg-transparent text-[#475569] hover:bg-slate-100 focus-visible:ring-slate-500",
    variant === "danger-ghost" &&
      "bg-transparent text-[var(--text-color-gray)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger-text)] focus-visible:ring-[var(--color-danger-text)]",
    variant === "outline-ghost" &&
      "rounded-full border border-[var(--color-border)] bg-transparent text-[var(--text-color-gray)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:ring-[var(--color-accent)]",
    variant === "link" &&
      "h-auto px-0 rounded-none bg-transparent text-[var(--color-accent)] underline underline-offset-4 decoration-[var(--color-accent)] hover:text-[var(--color-accent-strong)] hover:decoration-[var(--color-accent-strong)] focus-visible:ring-[var(--color-accent)]",
    className
  );
}

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children?: ReactNode;
};

type AsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    as?: "button";
    href?: never;
  };

type AsAnchor = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    as: "a";
    href: string;
  };

type ButtonProps = AsButton | AsAnchor;

export function Button({ variant, size, icon, iconRight, className, children, as, ...rest }: ButtonProps) {
  const cls = buttonStyles({ className, variant, size});

  if (as === "a") {
    const { href, ...anchorRest } = rest as AsAnchor;
    return (
      <a href={href} className={cls} {...anchorRest}>
        {icon && <span className={styles.ButtonIcon}>{icon}</span>}
        {children}
        {iconRight && <span className={styles.ButtonIcon}>{iconRight}</span>}
      </a>
    );
  }

  return (
    <button className={cls} {...(rest as AsButton)}>
      {icon && <span className={styles.ButtonIcon}>{icon}</span>}
      {children}
      {iconRight && <span className={styles.ButtonIcon}>{iconRight}</span>}
    </button>
  );
}
