"use client";

import { useActionState } from "react";
import { cn } from "@/lib/cn";
import type { PedidoPrioridad } from "@/lib/types";

export type ChangePrioridadActionState = { error: string | null };

const OPTIONS: Array<{
  value: PedidoPrioridad;
  label: string;
  tooltip: string;
  styles: { base: string; active: string };
}> = [
  {
    value: "baja",
    label: "Baja",
    tooltip: "Cambiar prioridad a baja",
    styles: {
      base: "border-[var(--color-neutral-border)] text-[var(--color-neutral-text)] hover:bg-[var(--color-neutral-bg)]",
      active:
        "border-[var(--color-neutral-border-strong)] bg-[var(--color-neutral-bg)] text-[var(--color-neutral-text-strong)] font-semibold",
    },
  },
  {
    value: "normal",
    label: "Normal",
    tooltip: "Cambiar prioridad a normal",
    styles: {
      base: "border-[var(--color-info-border)] text-[var(--color-info-text)] hover:bg-[var(--color-info-bg)]",
      active:
        "border-[var(--color-info-border-strong)] bg-[var(--color-info-bg-strong)] text-[var(--color-info-text-strong)] font-semibold",
    },
  },
  {
    value: "alta",
    label: "Alta",
    tooltip: "Cambiar prioridad a alta",
    styles: {
      base: "border-[var(--color-danger-border)] text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)]",
      active:
        "border-[var(--color-priority-high-border)] bg-[var(--color-danger-bg-strong)] text-[var(--color-priority-high-text)] font-semibold",
    },
  },
];

type PrioridadSelectorProps = {
  value: PedidoPrioridad;
  action: (
    prevState: ChangePrioridadActionState,
    formData: FormData
  ) => Promise<ChangePrioridadActionState>;
};

export function PrioridadSelector({ value, action }: PrioridadSelectorProps) {
  const [state, formAction, isPending] = useActionState(action, { error: null });

  return (
    <div className="space-y-1.5">
      <div className="flex flex-col gap-1.5 sm:flex-row">
        {OPTIONS.map((option) => {
          const isActive = option.value === value;

          return (
            <form key={option.value} action={formAction} className="flex-1">
              <input type="hidden" name="prioridad" value={option.value} />
              <button
                type="submit"
                disabled={isPending || isActive}
                title={isActive ? `Prioridad actual: ${option.label}` : option.tooltip}
                aria-label={isActive ? `Prioridad actual: ${option.label}` : option.tooltip}
                className={cn(
                  "w-full rounded-lg border px-2 py-1.5 text-xs transition",
                  isActive ? option.styles.active : option.styles.base,
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
