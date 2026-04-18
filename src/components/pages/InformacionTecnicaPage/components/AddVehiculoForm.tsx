"use client";

import { useActionState } from "react";
import type { TechnicalModelo, TechnicalMotor } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { type ActionFn, addFieldCls, addBtnClassName, AddFooter } from "./shared";

export function AddVehiculoForm({
  modelos,
  motores,
  action,
}: {
  modelos: TechnicalModelo[];
  motores: TechnicalMotor[];
  action: ActionFn;
}) {
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
    resetKey: 0,
  });
  return (
    <AddFooter>
      <form
        key={state.resetKey ?? 0}
        action={formAction}
        className="flex flex-1 flex-wrap items-center gap-3"
      >
        <select
          name="modeloId"
          defaultValue=""
          required
          disabled={isPending}
          className={cn("min-w-0 flex-1", addFieldCls)}
        >
          <option value="" disabled>
            Seleccionar modelo
          </option>
          {modelos.map((m) => (
            <option key={m.id} value={m.id}>
              {(m.marcaNombre ? `${m.marcaNombre} / ` : "") + m.nombre}
            </option>
          ))}
        </select>
        <select
          name="motorId"
          defaultValue=""
          required
          disabled={isPending}
          className={cn("w-52 shrink-0", addFieldCls)}
        >
          <option value="" disabled>
            Seleccionar motor
          </option>
          {motores.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}{m.cilindrada ? ` (${m.cilindrada})` : ""}
            </option>
          ))}
        </select>
        <Button type="submit" disabled={isPending} className={addBtnClassName} icon={isPending ? <Spinner className="h-4 w-4" /> : <Icon name="plus" className="h-4 w-4" />}>
          {isPending ? "Agregando…" : "Agregar relación"}
        </Button>
      </form>
      {state.error && (
        <p className="w-full text-xs text-[var(--color-danger-text)]">{state.error}</p>
      )}
    </AddFooter>
  );
}
