"use client";

import { useActionState } from "react";
import type { TechnicalMarca, TechnicalModelo } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/Spinner";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { type ActionFn, fieldCls, readCls, saveRowBtnCls, RowError, DeleteButton } from "./shared";

export function ModeloRow({
  modelo,
  index,
  marcas,
  updateAction,
  deleteAction,
  canEdit,
}: {
  modelo: TechnicalModelo;
  index: number;
  marcas: TechnicalMarca[];
  updateAction: ActionFn;
  deleteAction: ActionFn;
  canEdit: boolean;
}) {
  const deleteFormId = `delete-modelo-${modelo.id}`;
  const [state, formAction, isPending] = useActionState(updateAction, { error: null });
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteAction, { error: null });

  return (
    <div className={cn(index % 2 === 1 && "bg-[var(--color-surface-alt)]/40")}>
      <form
        action={canEdit ? formAction : undefined}
        className="grid items-center gap-2 px-4 py-2.5 md:grid-cols-[1fr_180px_auto_auto]"
      >
        <input type="hidden" name="modeloId" value={modelo.id} />
        {canEdit ? (
          <>
            <input
              type="text"
              name="nombre"
              defaultValue={modelo.nombre}
              disabled={isPending}
              className={cn("min-w-0", fieldCls)}
            />
            <select
              name="marcaId"
              defaultValue={modelo.marcaId}
              disabled={isPending}
              className={fieldCls}
            >
              {marcas.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
            <PulsatingButton size="sm" type="submit" pulsing={!isPending} disabled={isPending} className={cn(saveRowBtnCls, "inline-flex items-center gap-1.5")}>
              {isPending ? <Spinner className="h-3.5 w-3.5" /> : null}
              {isPending ? "Guardando…" : "Guardar"}
            </PulsatingButton>
            <DeleteButton form={deleteFormId} disabled={deletePending} />
          </>
        ) : (
          <>
            <span className={readCls}>{modelo.nombre}</span>
            <span className={cn(readCls, "text-[var(--text-color-gray)]")}>
              {modelo.marcaNombre ?? "—"}
            </span>
          </>
        )}
      </form>
      <form id={deleteFormId} action={deleteFormAction} className="hidden">
        <input type="hidden" name="modeloId" value={modelo.id} />
      </form>
      <RowError error={state.error ?? deleteState.error} />
    </div>
  );
}
