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
          ? "bg-emerald-100 text-emerald-700"
          : "bg-red-100 text-red-700"
      )}
    >
      {cobrado ? "Cobrado" : "No cobrado"}
    </span>
  );
}
