"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { TechnicalMarca } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { type ActionFn, fieldCls, readCls, saveRowBtnCls, RowError, DeleteButton } from "./shared";

export function MarcaRow({
  marca,
  index,
  updateAction,
  deleteAction,
  canEdit,
  hiddenMarcas,
  confirmMarcaHiddenChange,
}: {
  marca: TechnicalMarca;
  index: number;
  updateAction: ActionFn;
  deleteAction: ActionFn;
  canEdit: boolean;
  hiddenMarcas: Set<number>;
  confirmMarcaHiddenChange: (marcaId: number, hidden: boolean) => void;
}) {
  const deleteFormId = `delete-marca-${marca.id}`;
  const [state, formAction, isPending] = useActionState(updateAction, { error: null });
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteAction, { error: null });
  const isHidden = hiddenMarcas.has(marca.id);
  const [pendingHidden, setPendingHidden] = useState(isHidden);
  const prevPending = useRef(isPending);

  useEffect(() => {
    setPendingHidden(isHidden);
  }, [isHidden]);

  useEffect(() => {
    if (prevPending.current && !isPending && !state.error && pendingHidden !== isHidden) {
      confirmMarcaHiddenChange(marca.id, pendingHidden);
    }
    prevPending.current = isPending;
  }, [isPending, state.error, pendingHidden, isHidden, confirmMarcaHiddenChange, marca.id]);

  return (
    <div className={cn(index % 2 === 1 && "bg-[var(--color-surface-alt)]/40")}>
      <form
        action={canEdit ? formAction : undefined}
        className="flex items-center gap-2 px-4 py-2.5"
      >
        <input type="hidden" name="marcaId" value={marca.id} />
        <input type="hidden" name="hidden" value={pendingHidden ? "1" : "0"} />
        <Button
          variant="outline-ghost"
          onClick={() => setPendingHidden((prev) => !prev)}
          disabled={!canEdit}
          className="shrink-0 h-auto p-1.5"
          title={canEdit ? (pendingHidden ? "Ocultar marca (guardar para confirmar)" : "Mostrar marca (guardar para confirmar)") : "Necesitás permisos para guardar"}
          icon={<Icon name={pendingHidden ? "eyeSlash" : "eye"} className="h-4 w-4" />}
        />
        <input
          type="text"
          name="nombre"
          defaultValue={marca.nombre}
          disabled={!canEdit || isPending}
          className={cn("min-w-0 flex-1", canEdit ? fieldCls : readCls)}
        />
        {canEdit && (
          <>
            <PulsatingButton size="sm" type="submit" pulsing={!isPending} disabled={isPending} className={cn(saveRowBtnCls, "inline-flex items-center gap-1.5")}>
              {isPending ? <Spinner className="h-3.5 w-3.5" /> : null}
              {isPending ? "Guardando…" : "Guardar"}
            </PulsatingButton>
            <DeleteButton form={deleteFormId} disabled={deletePending} />
          </>
        )}
      </form>
      <form id={deleteFormId} action={deleteFormAction} className="hidden">
        <input type="hidden" name="marcaId" value={marca.id} />
      </form>
      <RowError error={state.error ?? deleteState.error} />
    </div>
  );
}
