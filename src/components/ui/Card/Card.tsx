import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./Card.module.scss";

type CardProps<T extends ElementType = "div"> = {
  as?: T;
  className?: string;
  children: ReactNode;
};

export function Card<T extends ElementType = "div">({
  as,
  className,
  children,
}: CardProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(
        "Card",
        styles.Card,
        "rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]",
        className
      )}
    >
      {children}
    </Component>
  );
}
