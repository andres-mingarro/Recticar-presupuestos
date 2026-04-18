"use client";

import { useActionState } from "react";
import type { TechnicalMotor } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/Spinner";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { type ActionFn, fieldCls, readCls, saveRowBtnCls, RowError, DeleteButton } from "./shared";

export function MotorRow({
  motor,
  index,
  updateAction,
  deleteAction,
  canEdit,
}: {
  motor: TechnicalMotor;
  index: number;
  updateAction: ActionFn;
  deleteAction: ActionFn;
  canEdit: boolean;
}) {
  const deleteFormId = `delete-motor-${motor.id}`;
  const [state, formAction, isPending] = useActionState(updateAction, { error: null });
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteAction, { error: null });

  return (
    <div className={cn(index % 2 === 1 && "bg-[var(--color-surface-alt)]/40")}>
      <form
        action={canEdit ? formAction : undefined}
        className="grid items-center gap-2 px-4 py-2.5 md:grid-cols-[1fr_140px_auto_auto]"
      >
        <input type="hidden" name="motorId" value={motor.id} />
        {canEdit ? (
          <>
            <input
              type="text"
              name="nombre"
              defaultValue={motor.nombre}
              disabled={isPending}
              className={cn("min-w-0", fieldCls)}
            />
            <input
              type="text"
              name="cilindrada"
              defaultValue={motor.cilindrada ?? ""}
              placeholder="Cilindrada"
              disabled={isPending}
              className={fieldCls}
            />
            <PulsatingButton size="sm" type="submit" pulsing={!isPending} disabled={isPending} className={cn(saveRowBtnCls, "inline-flex items-center gap-1.5")}>
              {isPending ? <Spinner className="h-3.5 w-3.5" /> : null}
              {isPending ? "Guardando…" : "Guardar"}
            </PulsatingButton>
            <DeleteButton form={deleteFormId} disabled={deletePending} />
          </>
        ) : (
          <>
            <span className={readCls}>{motor.nombre}</span>
            <span className={cn(readCls, "text-[var(--text-color-gray)]")}>
              {motor.cilindrada ?? "—"}
            </span>
          </>
        )}
      </form>
      <form id={deleteFormId} action={deleteFormAction} className="hidden">
        <input type="hidden" name="motorId" value={motor.id} />
      </form>
      <RowError error={state.error ?? deleteState.error} />
    </div>
  );
}
