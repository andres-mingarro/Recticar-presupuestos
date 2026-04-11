"use client";

import { useActionState } from "react";
import { cn } from "@/lib/cn";
import type { PedidoPrioridad } from "@/lib/types";

export type ChangePrioridadActionState = { error: string | null };

const OPTIONS: Array<{
  value: PedidoPrioridad;
  label: string;
  styles: { base: string; active: string };
}> = [
  {
    value: "baja",
    label: "Baja",
    styles: {
      base: "border-slate-200 text-slate-600 hover:bg-slate-50",
      active: "border-slate-400 bg-slate-100 text-slate-700 font-semibold",
    },
  },
  {
    value: "normal",
    label: "Normal",
    styles: {
      base: "border-sky-200 text-sky-600 hover:bg-sky-50",
      active: "border-sky-400 bg-sky-100 text-sky-700 font-semibold",
    },
  },
  {
    value: "alta",
    label: "Alta",
    styles: {
      base: "border-rose-200 text-rose-600 hover:bg-rose-50",
      active: "border-rose-400 bg-rose-100 text-rose-700 font-semibold",
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
      <div className="flex gap-1.5">
        {OPTIONS.map((option) => {
          const isActive = option.value === value;

          return (
            <form key={option.value} action={formAction} className="flex-1">
              <input type="hidden" name="prioridad" value={option.value} />
              <button
                type="submit"
                disabled={isPending || isActive}
                className={cn(
                  "w-full rounded-lg border px-2 py-1.5 text-xs transition",
                  isActive ? option.styles.active : option.styles.base,
                  isPending && "opacity-60",
                  isActive && "cursor-default"
                )}
              >
                {option.label}
              </button>
            </form>
          );
        })}
      </div>
      {state.error ? (
        <p className="text-xs text-rose-600">{state.error}</p>
      ) : null}
    </div>
  );
}
