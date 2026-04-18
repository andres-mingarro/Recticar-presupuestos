"use client";

import { usePrioridad } from "./PrioridadContext";

export function PrioridadBadge() {
  const { prioridad } = usePrioridad();
  return (
    <span className="PrioridadBadge font-medium capitalize text-[var(--text-color-defult)]">
      {prioridad}
    </span>
  );
}
