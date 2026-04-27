"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { TechnicalMarca } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { DeleteItemForm } from "@/components/forms/DeleteItemForm";
import { type ActionFn, fieldCls, readCls, saveRowBtnCls, RowError } from "./shared";

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
  const [state, formAction, isPending] = useActionState(updateAction, { error: null });
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

  const updateFormId = `update-marca-${marca.id}`;

  return (
    <div className={cn(index % 2 === 1 && "bg-[var(--color-surface-alt)]/40")}>
      {/* form de update: solo campos, sin botones dentro */}
      <form id={updateFormId} action={canEdit ? formAction : undefined}>
        <input type="hidden" name="marcaId" value={marca.id} />
        <input type="hidden" name="hidden" value={pendingHidden ? "1" : "0"} />
      </form>

      {/* fila visual: ojo + input + botones (fuera del form) */}
      <div className="flex flex-col gap-2 px-2 py-2.5 sm:flex-row sm:items-center sm:justify-between lg:px-4">
        <div className="row-header flex min-w-0 flex-1 items-center gap-2">
          <Button
            variant="outline-ghost"
            onClick={() => setPendingHidden((prev) => !prev)}
            disabled={!canEdit}
            className="shrink-0 h-auto p-1.5"
            title={canEdit ? (pendingHidden ? "Ocultar marca (guardar para confirmar)" : "Mostrar marca (guardar para confirmar)") : "Necesitás permisos para guardar"}
            icon={<Icon name={pendingHidden ? "eyeSlash" : "eye"} className="h-4 w-4" />}
          />
          <input
            form={updateFormId}
            type="text"
            name="nombre"
            defaultValue={marca.nombre}
            disabled={!canEdit || isPending}
            className={cn("min-w-0 flex-1", canEdit ? fieldCls : readCls)}
          />
        </div>
        {canEdit && (
          <div className="row-footer flex shrink-0 items-center gap-1.5 self-end sm:self-auto">
            <PulsatingButton
              form={updateFormId}
              size="sm"
              type="submit"
              pulsing={!isPending}
              disabled={isPending}
              className={cn(saveRowBtnCls, "inline-flex items-center gap-1.5")}
            >
              {isPending ? <Spinner className="h-3.5 w-3.5" /> : null}
              {isPending ? "Guardando…" : "Guardar"}
            </PulsatingButton>
            <DeleteItemForm
              itemId={marca.id}
              idFieldName="marcaId"
              action={deleteAction}
              title="Eliminar marca"
              confirmDescription={`Se eliminarán todos los modelos y vehículos de "${marca.nombre}". Esta acción no se puede deshacer.`}
              doubleConfirm
              doubleConfirmDescription={`Esta acción borrará la marca "${marca.nombre}" junto con todos sus modelos y vehículos. No se puede deshacer.`}
            />
          </div>
        )}
      </div>

      <RowError error={state.error} />
    </div>
  );
}
