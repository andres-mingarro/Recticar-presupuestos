"use client";

import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode, MouseEvent } from "react";
import { cn } from "@/lib/cn";
import styles from "./Button.module.scss";

function spawnRipple(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  const span = document.createElement("span");
  span.className = styles.ripple;
  span.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  el.appendChild(span);
  span.addEventListener("animationend", () => span.remove(), { once: true });
}

export type ButtonVariant = "primary" | "secondary" | "ghost" | "dark" | "soft-dark" | "warm" | "burnt" | "outline" | "outline-warm" | "outline-dark" | "outline-ghost" | "danger-ghost" | "link" | "danger" | "warning" | "info" | "success" | "outline-danger" | "outline-warning" | "outline-info" | "outline-success" | "hero";
export type ButtonSize = "sm" | "md" | "lg";

export function buttonStyles({
  size = "md",
  className,
}: {
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "Button",
    styles.Button,
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60",
    size === "sm" && "h-8 px-3 text-xs",
    size === "md" && "h-11 px-4 text-sm",
    size === "lg" && "h-13 px-6 text-base",
    className
  );
}

type BaseProps = {
  variant?: ButtonVariant;
  variantOnHover?: ButtonVariant;
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

export function Button({ variant = "primary", variantOnHover, size, icon, iconRight, className, children, as, ...rest }: ButtonProps) {
  const cls = buttonStyles({ className, size });
  const dataAttrs = {
    "data-variant": variant,
    ...(variantOnHover ? { "data-hover-variant": variantOnHover } : {}),
  };

  if (as === "a") {
    const { href, onClick, ...anchorRest } = rest as AsAnchor;
    return (
      <a href={href} className={cls} {...dataAttrs} onClick={(e) => { spawnRipple(e); onClick?.(e); }} {...anchorRest}>
        {icon && <span className={styles.ButtonIcon}>{icon}</span>}
        {children}
        {iconRight && <span className={styles.ButtonIcon}>{iconRight}</span>}
      </a>
    );
  }

  const { onClick, ...buttonRest } = rest as AsButton;
  return (
    <button className={cls} {...dataAttrs} onClick={(e) => { spawnRipple(e); onClick?.(e); }} {...buttonRest}>
      {icon && <span className={styles.ButtonIcon}>{icon}</span>}
      {children}
      {iconRight && <span className={styles.ButtonIcon}>{iconRight}</span>}
    </button>
  );
}
