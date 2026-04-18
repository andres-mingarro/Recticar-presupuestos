"use client";

import { useActionState } from "react";
import { cn } from "@/lib/cn";
import type { TrabajoPrioridad } from "@/lib/types";
import { usePrioridad } from "./PrioridadContext";

export type ChangePrioridadActionState = { error: string | null; success?: boolean };

const OPTIONS: Array<{
  value: TrabajoPrioridad;
  label: string;
  tooltip: string;
  activeTone: string;
}> = [
  {
    value: "baja",
    label: "Baja",
    tooltip: "Cambiar prioridad a baja",
    activeTone: "border-slate-600 bg-[linear-gradient(135deg,#475569,#1e293b)] text-white shadow-[0_10px_24px_rgba(51,65,85,0.28)]",
  },
  {
    value: "normal",
    label: "Normal",
    tooltip: "Cambiar prioridad a normal",
    activeTone: "border-sky-600 bg-[linear-gradient(135deg,#0284c7,#38bdf8)] text-white shadow-[0_10px_24px_rgba(2,132,199,0.3)]",
  },
  {
    value: "alta",
    label: "Alta",
    tooltip: "Cambiar prioridad a alta",
    activeTone: "border-rose-600 bg-[linear-gradient(135deg,#e11d48,#fb7185)] text-white shadow-[0_10px_24px_rgba(225,29,72,0.3)]",
  },
];

type PrioridadSelectorProps = {
  value: TrabajoPrioridad;
  action: (
    prevState: ChangePrioridadActionState,
    formData: FormData
  ) => Promise<ChangePrioridadActionState>;
};

export function PrioridadSelector({ value, action }: PrioridadSelectorProps) {
  const [state, formAction, isPending] = useActionState(action, { error: null });
  const { prioridad, setPrioridad } = usePrioridad();

  return (
    <div className="PrioridadSelector space-y-1.5">
      <div className="inline-flex rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1.5">
        {OPTIONS.map((option) => {
          const isActive = option.value === prioridad;

          return (
            <form
              key={option.value}
              action={formAction}
              onSubmit={() => setPrioridad(option.value)}
            >
              <input type="hidden" name="prioridad" value={option.value} />
              <button
                type="submit"
                disabled={isPending || isActive}
                title={isActive ? `Prioridad actual: ${option.label}` : option.tooltip}
                aria-label={isActive ? `Prioridad actual: ${option.label}` : option.tooltip}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none",
                  isActive
                    ? option.activeTone
                    : "border-transparent bg-transparent text-[var(--text-color-gray)] hover:bg-white hover:text-[var(--text-color-defult)]",
                  isPending && "opacity-60",
                  isActive ? "cursor-default" : "cursor-pointer"
                )}
              >
                {option.label}
              </button>
            </form>
          );
        })}
      </div>
      {state.error ? (
        <p className="text-xs text-[var(--color-danger-text)]">{state.error}</p>
      ) : null}
    </div>
  );
}
