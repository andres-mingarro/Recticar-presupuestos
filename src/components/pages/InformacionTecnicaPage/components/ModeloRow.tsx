"use client";

import { useActionState } from "react";
import type { TechnicalMarca, TechnicalModelo } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/Spinner";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { type ActionFn, fieldCls, readCls, saveRowBtnCls, RowError, DeleteButton } from "./shared";
import { MarcaDialogSelect } from "./MarcaDialogSelect";

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
    <div className={cn("modelo-row-item", index % 2 === 1 && "bg-[var(--color-surface-alt)]/40")}>
      <form
        action={canEdit ? formAction : undefined}
        className="px-2 py-2.5 lg:px-4"
      >
        <input type="hidden" name="modeloId" value={modelo.id} />
        {canEdit ? (
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="row-header flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-1">
              <input
                type="text"
                name="nombre"
                defaultValue={modelo.nombre}
                disabled={isPending}
                className={cn("min-w-0 flex-1", fieldCls)}
              />
              <MarcaDialogSelect
                name="marcaId"
                marcas={marcas}
                value={modelo.marcaId}
                selectedName={modelo.marcaNombre}
                disabled={isPending}
                className="w-full sm:w-[220px] lg:w-[200px]"
              />
            </div>
            <div className="row-footer flex shrink-0 items-center gap-1.5 self-end lg:self-auto">
              <PulsatingButton size="sm" type="submit" pulsing={!isPending} disabled={isPending} className={cn(saveRowBtnCls, "inline-flex items-center gap-1.5")}>
                {isPending ? <Spinner className="h-3.5 w-3.5" /> : null}
                {isPending ? "Guardando…" : "Guardar"}
              </PulsatingButton>
              <DeleteButton form={deleteFormId} disabled={deletePending} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:gap-2">
              <span className={cn("flex-1 truncate", readCls)}>{modelo.nombre}</span>
              <span className={cn("flex-1 truncate", readCls, "text-[var(--text-color-gray)]")}>
                {modelo.marcaNombre ?? "—"}
              </span>
            </div>
          </div>
        )}
      </form>
      <form id={deleteFormId} action={deleteFormAction} className="hidden">
        <input type="hidden" name="modeloId" value={modelo.id} />
      </form>
      <RowError error={state.error ?? deleteState.error} />
    </div>
  );
}
