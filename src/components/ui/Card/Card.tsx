import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./Card.module.scss";

type CardProps<T extends ElementType = "div"> = {
  as?: T;
  className?: string;
  noPadding?: boolean;
  children: ReactNode;
};

export function Card<T extends ElementType = "div">({
  as,
  className,
  noPadding,
  children,
}: CardProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(
        "Card",
        styles.Card,
        "rounded-[28px] border border-[var(--color-border)] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]",
        !noPadding && "p-6",
        className
      )}
    >
      {children}
    </Component>
  );
}
