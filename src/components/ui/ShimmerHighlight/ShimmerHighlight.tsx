"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./ShimmerHighlight.module.scss";

type ShimmerHighlightProps = {
  active?: boolean;
  children: ReactNode;
  className?: string;
  shimmerColor?: string;
  shimmerSize?: string;
};

export function ShimmerHighlight({
  active = false,
  children,
  className,
  shimmerColor = "#22c55e",
  shimmerSize = "0.20em",
}: ShimmerHighlightProps) {
  const [isVisible, setIsVisible] = useState(active);
  const isExiting = isVisible && !active;

  useEffect(() => {
    if (active) {
      setIsVisible(true);
      return;
    }

    const timeout = window.setTimeout(() => setIsVisible(false), 420);
    return () => window.clearTimeout(timeout);
  }, [active]);

  return (
    <div
      className={cn(
        "ShimmerHighlight",
        styles.ShimmerHighlight,
        !isVisible && styles.ShimmerHighlightIdle,
        isExiting && styles.ShimmerHighlightExit,
        className
      )}
      style={
        {
          "--shimmer-size": shimmerSize,
          "--shimmer-color": shimmerColor,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
