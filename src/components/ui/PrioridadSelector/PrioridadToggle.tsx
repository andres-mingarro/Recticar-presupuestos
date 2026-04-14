"use client";

import { cn } from "@/lib/cn";
import { usePrioridad } from "./PrioridadContext";

const OPTIONS = [
  {
    value: "baja" as const,
    label: "Baja",
    activeTone: "border-slate-600 bg-[linear-gradient(135deg,#475569,#1e293b)] text-white shadow-[0_10px_24px_rgba(51,65,85,0.28)]",
  },
  {
    value: "normal" as const,
    label: "Normal",
    activeTone: "border-sky-600 bg-[linear-gradient(135deg,#0284c7,#38bdf8)] text-white shadow-[0_10px_24px_rgba(2,132,199,0.3)]",
  },
  {
    value: "alta" as const,
    label: "Alta",
    activeTone: "border-rose-600 bg-[linear-gradient(135deg,#e11d48,#fb7185)] text-white shadow-[0_10px_24px_rgba(225,29,72,0.3)]",
  },
];

export function PrioridadToggle({ form }: { form?: string }) {
  const { prioridad, setPrioridad } = usePrioridad();

  return (
    <div className="PrioridadToggle flex-1 flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-foreground-muted)]">Prioridad</span>
      <input type="hidden" name="prioridad" value={prioridad} form={form} />
      <div className="flex w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1.5">
        {OPTIONS.map((option) => {
          const isActive = option.value === prioridad;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setPrioridad(option.value)}
              aria-pressed={isActive}
              className={cn(
                "flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none",
                isActive
                  ? option.activeTone
                  : "border-transparent bg-transparent text-[var(--color-foreground-muted)] hover:bg-white hover:text-[var(--color-foreground)]"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
