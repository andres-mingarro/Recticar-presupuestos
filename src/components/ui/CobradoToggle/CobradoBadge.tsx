"use client";

import { cn } from "@/lib/cn";
import { useCobrado } from "./CobradoContext";

export function CobradoBadge() {
  const { cobrado } = useCobrado();

  return (
    <span
      className={cn(
        "CobradoBadge",
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold",
        cobrado
          ? "bg-[var(--color-success-bg)] text-[var(--color-success-text)]"
          : "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]"
      )}
    >
      {cobrado ? "Cobrado" : "No cobrado"}
    </span>
  );
}
