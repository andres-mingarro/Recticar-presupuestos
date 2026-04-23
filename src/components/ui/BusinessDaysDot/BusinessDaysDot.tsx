"use client";

import { cn } from "@/lib/cn";
import styles from "./BusinessDaysDot.module.scss";

export function BusinessDaysDot({
  days,
  verdeHasta,
  naranjaHasta,
  className,
}: {
  days: number;
  verdeHasta: number;
  naranjaHasta: number;
  className?: string;
}) {
  const color =
    days <= verdeHasta
      ? "bg-emerald-500"
      : days <= naranjaHasta
      ? "bg-orange-400"
      : "bg-rose-500";

  return (
    <span
      className={cn(
        "BusinessDaysDot",
        styles.BusinessDaysDot,
        "inline-block h-2 w-2 shrink-0 rounded-full",
        color,
        className
      )}
    />
  );
}
